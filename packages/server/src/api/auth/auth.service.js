import DbConnection from '@lib/database-adapter';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import cryptoRandomString from 'crypto-random-string';
import { sendMail } from '@lib/mailing';
import path from 'path';
import { BitlyClient } from 'bitly';
import { blockTempMail } from '@lib/helper';

export const findUser = (query) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    let user;
    user = await db.collection('persons').findOne(query);

    if (user) {
      user.type = 'person';
      resolve(user);
    } else {
      user = await db.collection('businesses').findOne(query);
      if (user) {
        user.type = 'business';
        resolve(user);
      } else {
        reject(`User not found!`);
      }
    }
  });
};

export const register = (user, collection) => {
  user.id = uuid();
  const hash = bcrypt.hashSync(user.password, 10);
  const verificationToken = cryptoRandomString({
    length: 128,
    type: 'alphanumeric',
  });
  user.password = hash;
  user.active = false;

  return new Promise(async (resolve, reject) => {
    try {
      await findUser({ email: user.email });
      return reject('E-Mail already exists');
    } catch (err) {
      console.log(err);
      const db = await DbConnection.Get();
      try {
        await blockTempMail(user.email);
        const userPromise = db.collection(collection).insertOne(user);
        const codePromise = db
          .collection('codes')
          .insertOne({ token: verificationToken, userId: user.id });
        const mailPromise = sendVerificationMail(
          user.email,
          verificationToken,
          user.firstname || user.name
        );

        await Promise.all([userPromise, codePromise, mailPromise]);
        return resolve(user.id);
      } catch (e) {
        return reject(e);
      }
    }
  });
};

export const forgotPassword = (email) => {
  return new Promise(async (resolve, reject) => {
    const user = await findUser({ email });
    if (user && user.active) {
      const newPassword = cryptoRandomString({
        length: 20,
        type: 'alphanumeric',
      });
      const hash = bcrypt.hashSync(newPassword, 10);

      const db = await DbConnection.Get();
      let collection;
      if (user.type === 'person') collection = 'persons';
      else collection = 'businesses';

      await db
        .collection(collection)
        .findOneAndUpdate({ id: user.id }, { $set: { password: hash } });

      const htmlPath = path.join(
        process.cwd(),
        'src',
        'lib',
        'templates',
        'reset-password.html'
      );

      const htmlReplacements = {
        firstname: user.firstname,
        newPassword,
      };

      try {
        await sendMail(
          email,
          'Reset Password',
          `To reset your password please follow the instructions inside of this mail`,
          { htmlPath, htmlReplacements }
        );
      } catch (error) {
        return reject("Couldn't send mail to: " + email);
      }
      return resolve(true);
    } else {
      return reject('User not found or inactive (' + email + ')');
    }
  });
};

export const verifyAccount = (token) => {
  console.log('Verify Account');
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    try {
      const code = await db.collection('codes').findOne({ token });
      // console.log(code);
      if (code.used) return reject('Token already used or expired');

      db.collection('codes').findOneAndUpdate(
        { token },
        { $set: { used: true } }
      );
      // console.log(code);
      const user = await findUser({ id: code.userId });
      // console.log(user);
      const collection = user.type === 'person' ? 'persons' : 'businesses';
      const verifiedUser = await db
        .collection(collection)
        .findOneAndUpdate({ id: user.id }, { $set: { active: true } });
      // console.log(verifiedUser);
      return resolve(verifiedUser);
    } catch (error) {
      console.log(error);
      return reject('Verification failed');
    }
  });
};

export const sendVerificationMail = async (email, token, firstname) => {
  console.log('Send verification Mail');
  const bitly = new BitlyClient(process.env.BITLY_ACCESS_TOKEN);
  const activationLink = `${process.env.PROD_CLIENT_URL}/verification/${token}`;
  const shortenActivationLink = (await bitly.shorten(activationLink)).link;

  const htmlPath = path.join(
    process.cwd(),
    'src',
    'lib',
    'templates',
    'account-confirmation.html'
  );

  const htmlReplacements = {
    firstname,
    verificationUrl: activationLink,
    shortenVerificationUrl: shortenActivationLink,
  };

  return new Promise(async (resolve, reject) => {
    try {
      const request = await sendMail(
        email,
        'Account Verification',
        `To activate your account please copy the following link into your browser: ${shortenActivationLink}`,
        { htmlPath, htmlReplacements }
      );
      console.log('send verification mail successfully');
      return resolve(request.statusCode);
    } catch (error) {
      console.log('send verification mail failed');
      console.log(error);
      return reject(error);
    }
  });
};

export const removeUsedVerificationCodes = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await DbConnection.Get();
      const commandResult = await db
        .collection('codes')
        .removeMany({ used: true });

      console.log(
        'Removed ' + commandResult?.result?.n + ' codes successfully'
      );

      return resolve(true);
    } catch (error) {
      return reject(error);
    }
  });
};

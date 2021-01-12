import express from 'express';
import * as AuthService from '@api/auth/auth.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import parse from 'parse-duration';
import { authenticateJWT } from '@src/middleware/auth.middleware';

/**
 * Router Definition
 */

export const authRouter = express.Router();

/**
 * Controller Definitions
 */

const TOKEN_COOKIE = 'token';

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await AuthService.findUser({ email });
    if (bcrypt.compareSync(password, user.password)) {
      if (user.active) {
        const expiresIn = '24h';
        const tokenData = {
          id: user.id,
          email: user.email,
          type: user.type,
          isAdmin: user.isAdmin,
        };
        if (user.demo) tokenData.demo = user.demo;
        const accessToken = jwt.sign(tokenData, process.env.JWT_TOKEN, {
          expiresIn,
        });
        res.cookie(TOKEN_COOKIE, accessToken, {
          expires: new Date(Date.now() + parse(expiresIn)),
          secure: false, // set to true if we are using https
          httpOnly: true,
        });
        return res.status(200).send({ user: tokenData });
      } else {
        res.status(403).send('Your account needs to be activated first');
      }
    } else {
      res.status(403).send('Wrong email and/or password');
    }
  } catch (e) {
    res.status(403).send('Wrong email and/or password');
  }
});

authRouter.post('/register', async (req, res) => {
  console.log('Register User');
  const { user, userType } = req.body;
  let collection;
  if (userType === 'person') collection = 'persons';
  if (userType === 'business') collection = 'businesses';
  if (!collection) res.status(400).send('Missing or wrong user type');

  try {
    await AuthService.register(user, collection);
    return res.sendStatus(200);
  } catch (e) {
    res.status(400).send(e);
  }
});

authRouter.post('/logout', async (req, res) => {
  console.log('Logout User');
  res.clearCookie(TOKEN_COOKIE);
  return res.sendStatus(200);
});

authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) res.sendStatus(400);
  try {
    console.log('Forgot password for mail: ' + email);
    await AuthService.forgotPassword(email);
  } catch (error) {
    console.log(error);
  }
  return res.sendStatus(200);
});

authRouter.get('/validate-token', authenticateJWT, async (req, res) => {
  console.log('validate token');
  res.status(200).send('Success');
});

authRouter.post('/verification/', async (req, res) => {
  const { token } = req.body;
  try {
    await AuthService.verifyAccount(token);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).send(error);
  }
});

authRouter.post('/verification/send-mail', async (req, res) => {
  try {
    await AuthService.sendVerificationMail('leon.kuehn@outlook.com');
    res.status(200).send('Success');
  } catch (error) {
    res.status(400).send(error);
  }
});

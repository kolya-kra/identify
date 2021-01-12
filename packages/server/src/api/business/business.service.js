import DbConnection from '@lib/database-adapter';
import bcrypt from 'bcrypt';

export const updatePasswordById = (id, password, newPassword) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();

    const business = await db.collection('businesses').findOne({ id });

    console.log(password);
    console.log(business.password);
    if (!(await bcrypt.compare(password, business.password))) {
      console.log('Wrong password');
      return reject('wrong password');
    }

    const newHashedPassword = bcrypt.hashSync(newPassword, 10);

    db.collection('businesses')
      .findOneAndUpdate({ id }, { $set: { password: newHashedPassword } })
      .then(() => {
        console.log(`Updated password for ${id} successfully`);
        return resolve(true);
      })
      .catch((error) => {
        console.error(error);
        return reject(error);
      });
  });
};

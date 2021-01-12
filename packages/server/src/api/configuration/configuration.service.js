import DbConnection from '@lib/database-adapter';

export const findById = (collection, id) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const object = await db.collection(collection).findOne({ id });
    console.log(object);
    resolve(object);
  });
};

export const updateById = (collection, id, instance) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    db.collection(collection)
      .replaceOne({ id }, instance)
      .then(() => {
        console.log(`Updated ${collection} successfully`);
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject(`Updated ${collection} unsuccessfully!`);
      });
  });
};

export const insertOne = (collection, object) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    try {
      await db.collection(collection).insertOne(object);
      resolve(`Created ${collection} successfully`);
    } catch (error) {
      reject(`Failed to create ${collection}`);
    }
  });
};

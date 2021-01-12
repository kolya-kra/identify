import DbConnection from '@lib/database-adapter';
import { v4 as uuid } from 'uuid';

export const findAll = (collection) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const objects = await db.collection(collection).find({}).toArray();

    if (objects) {
      console.log(`Fetched all ${collection} successfully`);
      resolve(objects);
    } else {
      reject(`No ${collection} found!`);
    }
  });
};

export const findById = (collection, id) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const object = await db.collection(collection).findOne({ id });

    if (object) {
      console.log(`Fetched ${collection} successfully`);
      resolve(object);
    } else {
      reject(`No ${collection} found!`);
    }
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

export const deleteById = (collection, id) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    try {
      const object = await db.collection(collection).findOneAndDelete({ id });
      if (object.value) {
        console.log(`Deleted ${collection} successfully`);
        resolve(object.value);
      } else {
        reject(`No ${collection} found!`);
      }
    } catch (error) {
      reject(`Failed to delete ${collection}`);
    }
  });
};

export const insertOne = (collection, object) => {
  const id = uuid();
  object.id = id;

  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    try {
      await db.collection(collection).insertOne(object);
      resolve(id);
    } catch (error) {
      reject(`Failed to create ${collection}`);
    }
  });
};

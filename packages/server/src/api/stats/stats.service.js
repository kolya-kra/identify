import DbConnection from '@lib/database-adapter';
const collection = 'stats';

export const getStatsByBusinessId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await DbConnection.Get();
      const stats = (
        await db.collection(collection).findOne({ businessId: id })
      )?.stats;
      if (stats) return resolve(stats);
      else return resolve({});
    } catch (error) {
      return reject(error);
    }
  });
};

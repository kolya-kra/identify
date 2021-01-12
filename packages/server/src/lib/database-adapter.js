import { MongoClient } from 'mongodb';

const DbConnection = function () {
  let db = null;
  let instance = 0;

  async function DbConnect() {
    if (process.env.NODE_ENV !== 'testing') {
      try {
        if (
          !process.env.MONGODB_USER ||
          !process.env.MONGODB_PASS ||
          !process.env.MONGODB_URL ||
          !process.env.MONGODB_DB
        ) {
          console.error('Missing .env for MongoDB');
          process.exit(1);
        }
        const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}`;

        const client = await MongoClient.connect(url, {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        });

        console.log('Connected to DB successfully');

        return client.db(process.env.MONGODB_DB);
      } catch (e) {
        return e;
      }
    } else {
      return { database: {} };
    }
  }

  async function Get() {
    try {
      if (db != null) {
        if (process.env.NODE_ENV !== 'production') {
          instance++;
          console.log(`DbConnection instance called ${instance} times`);
        }
        return db;
      } else {
        db = await DbConnect();
        return db;
      }
    } catch (e) {
      return e;
    }
  }

  return {
    Get: Get,
  };
};

export default DbConnection();

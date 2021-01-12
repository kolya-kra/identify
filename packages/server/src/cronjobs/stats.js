import DbConnection from '@lib/database-adapter';
import moment from 'moment';

const statsCreator = async () => {
  console.log('Start creating stats');
  const db = await DbConnection.Get();
  const businesses = await db.collection('businesses').find({}).toArray();
  businesses.forEach(async (business) => {
    const { countedVisits, totalSeats } = await counter(business);

    if (!countedVisits || !totalSeats) return;

    const visits = Object.keys(countedVisits).map((key) => countedVisits[key]);
    const totalVisits = Object.keys(countedVisits)
      .map((key) => countedVisits[key])
      .reduce((sum, visits) => sum + visits);
    const occupations = visits.map((numberOfVisits) =>
      Math.round((numberOfVisits / totalSeats) * 100)
    );

    const stats = {
      visits,
      averageVisits: Math.round(
        totalVisits / Object.keys(countedVisits).length
      ),
      totalVisits,
      occupations,
      averageOccupation: parseFloat(
        (
          occupations.reduce((sum, occupation) => sum + occupation) /
          Object.keys(occupations).length
        ).toFixed(1)
      ),
    };

    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    if (await db.collection('stats').findOne({ businessId: business.id })) {
      db.collection('stats').findOneAndUpdate(
        { businessId: business.id },
        { $set: { stats, createdAt } }
      );
    } else {
      db.collection('stats').insertOne({
        businessId: business.id,
        stats,
        createdAt,
      });
    }
  });
};

const counter = (business) => {
  return new Promise(async (resolve) => {
    const db = await DbConnection.Get();
    const countedVisits = {};
    const locations = await db
      .collection('locations')
      .find({ businessId: business.id })
      .toArray();

    if (locations?.length === 0) return;

    const totalSeats = locations
      .map((location) => location.capacity)
      .reduce((sum, capacity) => sum + capacity);

    await Promise.all(
      locations.map(async (location) => {
        return new Promise(async (resolve) => {
          const visits = await db
            .collection('visits')
            .find({ locationId: location.id, checkOut: { $exists: true } })
            .toArray();
          visits.forEach((visit) => {
            const day = moment(visit.checkOut).format('YYYY-MM-DD');
            if (countedVisits[day]) countedVisits[day] = countedVisits[day] + 1;
            else countedVisits[day] = 1;
          });
          return resolve();
        });
      })
    );
    return resolve({ countedVisits, totalSeats });
  });
};

module.exports = statsCreator;

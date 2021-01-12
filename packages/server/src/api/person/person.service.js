import DbConnection from '@lib/database-adapter';

const locationLookup = {
  $lookup: {
    from: 'locations',
    localField: 'locationId',
    foreignField: 'id',
    as: 'location',
  },
};

export const findAllVisitsByPersonId = (id) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const visits = await db
      .collection('visits')
      .aggregate([
        { $match: { personId: id } },
        locationLookup,
        {
          $lookup: {
            from: 'categories',
            localField: 'location.categoryId',
            foreignField: 'id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        { $unwind: '$location' },
        {
          $project: {
            _id: 1,
            isActive: 1,
            personId: 1,
            locationId: 1,
            imageUrl: '$location.imageUrl',
            checkIn: 1,
            checkOut: 1,
            name: '$location.name',
            address: '$location.address',
            category: '$category.names',
          },
        },
      ])
      .toArray();

    if (visits) {
      console.log(`Fetched all visits successfully`);
      resolve(visits);
    } else {
      reject(`No visits found!`);
    }
  });
};

export const findActiveVisitByPersonId = (id) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const visits = await db
      .collection('visits')
      .aggregate([
        { $match: { personId: id, isActive: true } },
        locationLookup,
        { $unwind: '$location' },
        {
          $project: {
            _id: 1,
            checkIn: 1,
            isActive: 1,
            personId: 1,
            locationId: 1,
            location: '$location',
          },
        },
      ])
      .toArray();

    if (visits && visits.length >= 1) return resolve(visits[0]);
    else return resolve(null);
  });
};

export const userHasActiveVisit = (id) => {
  return new Promise(async (resolve, _) => {
    const db = await DbConnection.Get();
    const visits = await db
      .collection('visits')
      .aggregate([
        { $match: { personId: id, isActive: true } },
        {
          $lookup: {
            from: 'locations',
            localField: 'locationId',
            foreignField: 'id',
            as: 'location',
          },
        },
        { $unwind: '$location' },
        {
          $project: {
            _id: 1,
            checkIn: 1,
            isActive: 1,
            personId: 1,
            locationId: 1,
            location: '$location',
          },
        },
      ])
      .toArray();

    if (visits && visits.length >= 1) return resolve(true);
    else return resolve(false);
  });
};

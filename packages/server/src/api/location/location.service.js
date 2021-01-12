import DbConnection from '@lib/database-adapter';
import { ObjectID } from 'mongodb';
import * as CrudService from '@api/crud.service';
import moment from 'moment';

const OUTDATED_DAYS = 7;

const locationAggregation = [
  {
    $lookup: {
      from: 'categories',
      localField: 'categoryId',
      foreignField: 'id',
      as: 'category',
    },
  },
  {
    $lookup: {
      from: 'visits',
      localField: 'id',
      foreignField: 'locationId',
      as: 'visits',
    },
  },
  { $unwind: '$category' },
];

export const findAllLocations = (businessId) => {
  console.log(businessId);
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const query = {};
    if (businessId) query.businessId = businessId;
    const objects = await db
      .collection('locations')
      .aggregate([
        ...locationAggregation,
        { $match: query },
        {
          $project: {
            id: 1,
            name: 1,
            category: '$category.names',
            capacity: 1,
            address: 1,
            coordinates: 1,
            categoryId: 1,
            address: 1,
            imageUrl: 1,
            visits: {
              $size: {
                $filter: {
                  input: '$visits',
                  as: 'visit',
                  cond: { $eq: ['$$visit.isActive', true] },
                },
              },
            },
          },
        },
      ])
      .toArray();

    if (objects) {
      console.log(`Fetched all locations successfully`);
      resolve(objects);
    } else {
      reject(`No location found!`);
    }
  });
};

export const findAllVisitsByLocationId = (id) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const visits = await db
      .collection('visits')
      .find({ locationId: id })
      .toArray();

    if (visits) {
      console.log(`Fetched all visits successfully`);
      resolve(visits);
    } else {
      reject(`No visits found!`);
    }
  });
};

export const getExportVisitsByLocationId = (id) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const visits = await db
      .collection('visits')
      .aggregate([
        { $match: { locationId: id } },
        {
          $lookup: {
            from: 'persons',
            localField: 'personId',
            foreignField: 'id',
            as: 'person',
          },
        },
        {
          $lookup: {
            from: 'locations',
            localField: 'locationId',
            foreignField: 'id',
            as: 'location',
          },
        },
        { $unwind: '$person' },
        { $unwind: '$location' },
        {
          $project: {
            location: {
              id: '$location.id',
              name: '$location.name',
              address: '$location.address',
              capacity: '$location.capacity',
            },
            visitor: {
              name: '$person.name',
              firstname: '$person.firstname',
              phone: '$person.phone',
              email: '$person.email',
            },
            checkIn: 1,
            isActive: 1,
            checkOut: 1,
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

export const findAllActiveVisits = (id) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    const visits = await db
      .collection('visits')
      .aggregate([
        {
          $lookup: {
            from: 'persons',
            localField: 'personId',
            foreignField: 'id',
            as: 'person',
          },
        },
        { $match: { locationId: id, isActive: true } },
        { $unwind: '$person' },
        {
          $project: {
            locationId: 1,
            visitor: {
              firstname: '$person.firstname',
              name: { $concat: [{ $substr: ['$person.name', 0, 1] }, '.'] },
            },
            checkIn: 1,
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

export const searchForLocations = (searchTerm) => {
  return new Promise(async (resolve, reject) => {
    const query = { $text: { $search: searchTerm } };
    const db = await DbConnection.Get();
    const locations = await db
      .collection('locations')
      .aggregate([
        { $match: query },
        ...locationAggregation,
        {
          $project: {
            id: 1,
            name: 1,
            category: '$category.names',
            textScore: { $meta: 'textScore' },
            capacity: 1,
            address: 1,
            imageUrl: 1,
            visits: {
              $size: {
                $filter: {
                  input: '$visits',
                  as: 'visit',
                  cond: { $eq: ['$$visit.isActive', true] },
                },
              },
            },
          },
        },
        { $sort: { textScore: -1 } },
      ])
      .toArray();

    if (locations) {
      console.log(`Fetched all searched locations successfully`);
      resolve(locations);
    } else {
      reject(`No locations found!`);
    }
  });
};

export const checkIn = (locationId, personId) => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    try {
      const result = await db.collection('visits').insertOne({
        locationId,
        personId,
        checkIn: Date.now(),
        isActive: true,
      });

      const location = await CrudService.findById('locations', locationId);

      const visit = result.ops[0];
      if (visit) {
        const locationId = visit.locationId;
        global.io.in(locationId).emit('locationCheckIn', { locationId });
        // global.io.emit('locationCheckIn', {
        //   locationId: visit.locationId,
        // });
        console.log('Check-In to Location successfully');
        visit.location = location;
        resolve(visit);
      } else {
        reject('Error creating visit');
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const checkOut = (id) => {
  return new Promise(async (resolve, reject) => {
    console.log(id);
    const db = await DbConnection.Get();
    try {
      let visit = await db.collection('visits').findOne({ _id: ObjectID(id) });
      if (visit.isActive) {
        visit = await db
          .collection('visits')
          .findOneAndUpdate(
            { _id: ObjectID(id) },
            { $set: { checkOut: Date.now(), isActive: false } }
          );

        if (visit) {
          const locationId = visit.value.locationId;
          global.io.in(locationId).emit('locationCheckOut', { locationId });
          console.log('Check-Out from Location successfully');
          return resolve(visit);
        } else {
          return reject('Error updating visit');
        }
      } else {
        console.log('Already checked out');
        return resolve('Already checked out');
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const getAllImageUrls = () => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    try {
      const locations = await db
        .collection('locations')
        .aggregate([
          {
            $project: {
              id: 1,
              imageUrl: 1,
            },
          },
        ])
        .toArray();

      return resolve(locations);
    } catch (error) {
      return reject(error);
    }
  });
};

export const removeOutdatedVisits = () => {
  return new Promise(async (resolve, reject) => {
    const db = await DbConnection.Get();
    try {
      const outdated = moment().subtract(OUTDATED_DAYS, 'd').valueOf();
      const commandResult = await db
        .collection('visits')
        .deleteMany({ checkOut: { $lt: outdated } });

      console.log('Removed ' + commandResult.result.n + ' visits successfully');

      return resolve(outdated);
    } catch (error) {
      return reject(error);
    }
  });
};

/** Helper */

export const calcGpsDistance = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // km
  var dLat = numericToRadian(lat2 - lat1);
  var dLon = numericToRadian(lon2 - lon1);
  var lat1 = numericToRadian(lat1);
  var lat2 = numericToRadian(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

// Converts numeric degrees to radians
const numericToRadian = (value) => {
  return (value * Math.PI) / 180;
};

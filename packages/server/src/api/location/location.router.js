import express from 'express';
import * as CrudService from '@api/crud.service';
import * as LocationService from './location.service';
import * as PersonService from '@api/person/person.service';
import { createVisitsExportForLocation } from './create-visits-export';

import OpenCage from 'opencage-api-client';

/**
 * Router Definition
 */

export const locationRouter = express.Router();

/**
 * Controller Definitions
 */
const collection = 'locations';

locationRouter.get('/', async (req, res) => {
  try {
    if (!req.user) throw new Error('Missing user on request');

    let locations;
    if (req.user && req.user.isAdmin)
      locations = await LocationService.findAllLocations();
    else if (req.user && req.user.id && req.user.type === 'business')
      locations = await LocationService.findAllLocations(req.user.id);

    res.status(200).send(locations);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

locationRouter.get('/search', async (req, res) => {
  let searchTerm = req.query.term;
  if (!searchTerm) {
    searchTerm = ' ';
  }

  try {
    const locations = await LocationService.searchForLocations(searchTerm);

    res.status(200).send(locations);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

locationRouter.get('/coordinates/:radius', async (req, res) => {
  const radius = req.params.radius; //in km
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;

  try {
    let locations = await LocationService.findAllLocations();
    locations = await locations
      .filter((location) => {
        if (location.coordinates) {
          const distance = LocationService.calcGpsDistance(
            latitude,
            longitude,
            location.coordinates.latitude,
            location.coordinates.longitude
          );
          location.distance = distance;
          return distance < radius;
        } else {
          return false;
        }
      })
      .sort((a, b) => (a.distance > b.distance ? 1 : -1));

    res.status(200).send(locations);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

locationRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const location = await CrudService.findById(collection, id);
    if (location.businessId === req.user.id || req.user.isAdmin)
      res.status(200).send(location);
    else res.sendStatus(403);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

locationRouter.get('/:id/visits', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const visits = await LocationService.findAllVisitsByLocationId(id);

    res.status(200).send(visits);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

locationRouter.get('/:id/visits/current', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const visits = await LocationService.findAllActiveVisits(id);

    res.status(200).send(visits);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

locationRouter.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { location } = req.body;
  if (!id) res.sendStatus(400);

  try {
    await CrudService.updateById(collection, id, location);

    res.status(200).send(location);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

locationRouter.post('/', async (req, res) => {
  const { location } = req.body;
  if (!location) res.sendStatus(400);

  console.log(location);
  const { address } = location;

  try {
    const query = `${address.street} ${address.number}, ${address.postcode} ${address.city}`;
    const geoData = await OpenCage.geocode({ q: query });

    const coordinates = geoData.results[0].geometry;

    location.coordinates = {
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    };

    const id = await CrudService.insertOne(collection, { ...location });

    res.status(200).send({ ...location, id });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

locationRouter.post('/:id/checkin', async (req, res) => {
  const id = req.params.id;
  const { personId } = req.body;
  if (!id || !personId) res.sendStatus(400);

  try {
    const hasActiveVisit = await PersonService.userHasActiveVisit(personId);
    if (hasActiveVisit) return res.status(400).send('User has active visit');

    const visit = await LocationService.checkIn(id, personId);

    res.status(200).send(visit);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

locationRouter.post('/:id/checkout', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    await LocationService.checkOut(id);
    return res.sendStatus(200);
  } catch (e) {
    res.status(400).send(e);
  }
});

locationRouter.post('/:id/send-csv-export', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  const email = 'leon.kuehn@outlook.com';

  try {
    await createVisitsExportForLocation(id, email);

    return res.sendStatus(200);
  } catch (e) {
    res.status(400).send(e);
  }
});

locationRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const location = await CrudService.findById(collection, id);
    if (location.businessId === req.user.id || req.user.isAdmin) {
      await CrudService.deleteById(collection, id);
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

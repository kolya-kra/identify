import express from 'express';
import * as CrudService from '@api/crud.service';
import * as PersonService from './person.service';

/**
 * Router Definition
 */

export const personsRouter = express.Router();

/**
 * Controller Definitions
 */
const collection = 'persons';

personsRouter.get('/', async (req, res) => {
  try {
    const persons = await CrudService.findAll(collection);

    res.status(200).send(persons);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

personsRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const person = await CrudService.findById(collection, id);

    res.status(200).send(person);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

personsRouter.get('/:id/active-visit', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const visit = await PersonService.findActiveVisitByPersonId(id);
    res.status(200).send(visit);
  } catch (e) {
    res.status(400).send(e);
  }
});

personsRouter.get('/:id/visits', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    let visits = await PersonService.findAllVisitsByPersonId(id);
    visits = await visits.sort((a, b) => (a.checkIn < b.checkIn ? 1 : -1));

    res.status(200).send(visits);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

personsRouter.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { person } = req.body;
  if (person._id) delete person._id;
  if (!id) res.sendStatus(400);

  try {
    await CrudService.updateById(collection, id, person);

    res.status(200).send(person);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

personsRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const person = await CrudService.deleteById(collection, id);

    res.status(200).send(person);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

import express from 'express';
import * as DataService from '@api/crud.service';
import { verifyAdmin } from '@src/middleware/auth.middleware';

/**
 * Router Definition
 */

export const categoryRouter = express.Router();

/**
 * Controller Definitions
 */
const collection = 'categories';

categoryRouter.get('/', async (req, res) => {
  try {
    const categories = await DataService.findAll(collection);

    res.status(200).send(categories);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

categoryRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const category = await DataService.findById(collection, id);

    res.status(200).send(category);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Need to be an admin to use the following methods
categoryRouter.use(verifyAdmin);

categoryRouter.post('/', async (req, res) => {
  const category = req.body;

  try {
    const id = await DataService.insertOne(collection, category);

    res.status(200).send(id);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

categoryRouter.put('/:id', async (req, res) => {
  const id = req.params.id;
  const category = req.body;
  if (!id) res.sendStatus(400);

  try {
    await DataService.updateById(collection, id, category);

    res.status(200).send(category);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

categoryRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const category = await CrudService.deleteById(collection, id);
    res.status(200).send(category);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

import express from 'express';
import * as DataService from '@api/crud.service';
import * as ConfigurationService from './configuration.service';

/**
 * Router Definition
 */

export const configurationRouter = express.Router();

/**
 * Controller Definitions
 */
const collection = 'configurations';

const defaultConfiguration = {
  radius: 5,
};

configurationRouter.get('/', async (req, res) => {
  try {
    const configuration = await DataService.findAll(collection);

    res.status(200).send(configuration);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

configurationRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  if (!id) res.sendStatus(400);

  try {
    const configuration = await DataService.findById(collection, id);

    res.status(200).send(configuration);
  } catch (e) {
    res.status(200).send(defaultConfiguration);
  }
});

// Need to be an admin to use the following methods

configurationRouter.post('/', async (req, res) => {
  const configuration = req.body;

  try {
    const id = await DataService.insertOne(collection, configuration);

    res.status(200).send(id);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

configurationRouter.put('/:id', async (req, res) => {
  const id = req.params.id;
  let { configuration } = req.body;
  if (!id) res.sendStatus(400);
  configuration.id = id;
  try {
    const existingCollection = await ConfigurationService.findById(
      collection,
      id
    );
    if (existingCollection) {
      await ConfigurationService.updateById(collection, id, configuration);
    } else {
      await ConfigurationService.insertOne(collection, configuration);
    }

    res.status(200).send(configuration);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

configurationRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const configuration = await CrudService.deleteById(collection, id);
    res.status(200).send(configuration);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

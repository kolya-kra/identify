import express from 'express';
import * as BusinessService from './business.service';
import * as CrudService from '@api/crud.service';

/**
 * Router Definition
 */

export const businessRouter = express.Router();

/**
 * Controller Definitions
 */
const collection = 'businesses';

businessRouter.get('/', async (req, res) => {
  try {
    const businesses = await CrudService.findAll(collection);

    res.status(200).send(businesses);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

businessRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const business = await CrudService.findById(collection, id);
    res.status(200).send(business);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

businessRouter.put('/new-password', async (req, res) => {
  const { password, newPassword } = req.body;
  if (!password || !newPassword) res.sendStatus(400);

  try {
    await BusinessService.updatePasswordById(
      req.user.id,
      password,
      newPassword
    );

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

businessRouter.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { business } = req.body;
  if (business._id) delete business._id;

  if (!id) res.sendStatus(400);

  try {
    await CrudService.updateById(collection, id, business);

    res.status(200).send(business);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

businessRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const business = await CrudService.deleteById(collection, id);
    res.status(200).send(business);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

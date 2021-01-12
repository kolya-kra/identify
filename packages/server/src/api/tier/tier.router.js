import express from 'express';
import * as CrudService from '@api/crud.service';
import * as TierService from './tier.service';
import { verifyAdmin } from '@src/middleware/auth.middleware';

/**
 * Router Definition
 */

export const tierRouter = express.Router();

/**
 * Controller Definitions
 */
const collection = 'tiers';

tierRouter.get('/', async (req, res) => {
  try {
    const tiers = await CrudService.findAll(collection);
    tiers.sort((a, b) => a.order - b.order);

    res.status(200).send(tiers);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

tierRouter.get('/current', async (req, res) => {
  if (!req?.user?.id) return res.sendStatus(403);
  try {
    const business = await TierService.getCurrentTier(req.user.id);

    res.status(200).send(business);
  } catch (e) {
    if (e?.status)
      return res.status(e.status).send(e?.message || 'Payment required');
    else return res.status(400).send(e);
  }
});

tierRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const tier = await CrudService.findById(collection, id);

    res.status(200).send(tier);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

tierRouter.post('/:id/booking', async (req, res) => {
  const tierId = req.params.id;
  const { orderId, periods } = req.body;
  if (!tierId || !orderId) res.sendStatus(400);

  try {
    console.log('Tier: ' + tierId);
    console.log('PayPal Order ID: ' + orderId);
    console.log(req.user);
    await TierService.bookTier(req.user.id, orderId, tierId, periods);
    // await CrudService.updateById(collection, id, tier);
    res.sendStatus(200);
    // res.status(200).send(tier);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Need to be an admin to use the following methods
tierRouter.use(verifyAdmin);

tierRouter.put('/:id', async (req, res) => {
  const id = req.params.id;
  const tier = req.body;
  if (!id) res.sendStatus(400);

  try {
    await CrudService.updateById(collection, id, tier);

    res.status(200).send(tier);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

tierRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const tier = await CrudService.deleteById(collection, id);
    res.status(200).send(tier);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

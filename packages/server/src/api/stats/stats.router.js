import express from 'express';
import * as StatsService from './stats.service';
import { verifyAdmin } from '@src/middleware/auth.middleware';

/**
 * Router Definition
 */

export const statsRouter = express.Router();

statsRouter.get('/', async (req, res) => {
  const id = req.user.id;
  if (!id) res.sendStatus(403);

  try {
    const stats = await StatsService.getStatsByBusinessId(id);
    console.log(stats);
    res.status(200).send(stats);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

statsRouter.use(verifyAdmin);

statsRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) res.sendStatus(400);

  try {
    const stats = await StatsService.getStatsByBusinessId(id);
    console.log(stats);
    res.status(200).send(stats);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

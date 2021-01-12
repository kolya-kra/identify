import express, { static as staticExpress } from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import socket from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import * as Sentry from '@sentry/node';
// import * as Tracing from '@sentry/tracing';
import * as CronJobs from '@cron';

if (process.env.NODE_ENV !== 'testing') {
  dotenv.config();
} else {
  dotenv.config({ path: path.join(__dirname, '../default.env') });
  console.log('Testing Port: ' + process.env.PORT);
}

import DbConnection from '@lib/database-adapter';
import { authenticateJWT } from '@src/middleware/auth.middleware';
import { authRouter } from '@api/auth/auth.router';
import { personsRouter } from '@api/person/person.router';
import { businessRouter } from '@api/business/business.router';
import { locationRouter } from '@api/location/location.router';
import { categoryRouter } from '@api/category/category.router';
import { configurationRouter } from '@api/configuration/configuration.router';
import { statsRouter } from '@api/stats/stats.router';
import { tierRouter } from '@api/tier/tier.router';

import { validateEnv } from '@lib/validate-env';

DbConnection.Get();
validateEnv();

// App setup
const app = express();

app.use(compression());
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin:
      process.env.NODE_ENV === 'production'
        ? [process.env.PROD_CLIENT_URL]
        : 'http://localhost:3000',
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan('tiny'));

app.get('/', (_, res) => {
  return res.redirect(process.env.PROD_CLIENT_URL);
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use('/api/', apiLimiter);

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // start blocking after 5 requests
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try later again!',
});
app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRouter);

//The following routes need an authentication -> JWT
app.use(authenticateJWT);
app.use('/api/person', personsRouter);
app.use('/api/business', businessRouter);
app.use('/api/location', locationRouter);
app.use('/api/category', categoryRouter);
app.use('/api/configuration', configurationRouter);
app.use('/api/stats', statsRouter);
app.use('/api/tier', tierRouter);

// Static files
app.use(staticExpress('public'));

app.use((_, res) => {
  return res.status(404).send('404: File Not Found');
});

const port = process.env.PORT || 80;

const server = app.listen(port, function () {
  console.log(`Listening on port ${port}`);
  console.log(`http://localhost:${port}`);

  if (process.env.NODE_ENV === 'testing') server.close();
  // close after successful connection
  else CronJobs.startJobs();
});

// Socket setup
const io = socket(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('Made socket connection');
  global.socket = socket;

  socket.on('joinRoom', (room) => {
    console.log('Joining room: ' + room);
    if (socket.rooms.has(room)) {
      console.log('Already joined room');
    } else {
      socket.join(room);
      console.log('Joined room');
    }
  });

  socket.on('leaveRoom', (room) => {
    console.log('Leaving room: ' + room);
    if (socket.rooms.has(room)) {
      socket.leave(room);
      console.log('Left room');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

global.io = io;

Sentry.init({
  dsn:
    'https://71e0c52428eb4b1d8c81ac419c5fee9f@o483035.ingest.sentry.io/5534150',
  // tracesSampleRate: 1.0,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0, //report all errors in production mode
  environment: process.env.NODE_ENV,
});

const shutDown = () => {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

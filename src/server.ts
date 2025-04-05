import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { NextFunction, Request, Response } from 'express';

import 'express-async-errors';

import { baseRoutes, apiKeysRoutes } from '@src/routes';

import { NodeEnvs } from '@src/common/ENV';
import env from '@src/config';
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import { RouteError } from '@src/common/route-errors';

/******************************************************************************
 Setup
 ******************************************************************************/

const app = express();

// **** Middleware **** //

// Basic middleware
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (env.NODE_ENV === NodeEnvs.Dev) {
  app.use(morgan('dev'));
} else if (env.NODE_ENV === NodeEnvs.Production) {
  if (!env.DISABLE_HELMET) {
    app.use(helmet());
  }
}

// Add APIs, must be after middleware
app.use('/mailer', baseRoutes);
app.use('/mailer/api-keys', apiKeysRoutes);

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json(err);
  }
  return next(err);
});

// **** FrontEnd Content **** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

/******************************************************************************
 Export default
 ******************************************************************************/

export default app;

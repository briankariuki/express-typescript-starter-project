import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morganBody from 'morgan-body';
import { serializeError, ErrorObject } from 'serialize-error';
import cors from 'cors';
import config from '../config/config';
import { isCelebrateError } from 'celebrate';

export function configExpress(app: Application): void {
  app.enable('trust proxy');

  app.use(
    cors({
      allowedHeaders: ['Authorization', 'Content-Type'],
      exposedHeaders: ['Authorization'],
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  //   app.use(bodyParser.json({ limit: config.BODY_PARSER_LIMIT }));

  //   app.use(bodyParser.urlencoded({ extended: false }));

  morganBody(app, { maxBodyLength: config.MORGAN_BODY_MAX_BODY_LENGTH, filterParameters: ['password'] });

  app.get('/', (req, res) => {
    res.send('Yay! Sending links');
  });
  app.get('/test', (req, res) => {
    res.send('Yay! Test succeeded. ');
  });
}

export function configExpressNotFoundError(app: Application): void {
  app.use((req, res, next) => {
    const error: DefaultError = new Error('URL not found');

    error.code = '404';
    error.status = 404;

    next(error);
  });
}

export function configExpressError(app: Application): void {
  app.use((error: DefaultError, req: Request, res: Response, next: NextFunction) => {
    const { name, stack, status, code, message } = error;

    const serializedError: ErrorObject & {
      status?: number;
    } = serializeError({ name, stack, status, code, message });

    serializedError.code = serializedError.code || '500';

    delete serializedError.status;

    if (isCelebrateError(error)) serializedError.message = error.details.entries().next().value[1].details[0].message;

    if (config.NODE_ENV !== 'development') delete serializedError.stack;

    res.status(error.status || 500).json({ error: serializedError });

    next();
  });
}

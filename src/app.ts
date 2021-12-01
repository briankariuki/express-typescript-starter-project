import 'reflect-metadata';
import './api/controller';
import http from 'http';
import config from './config/config';
import { InversifyExpressServer, getRouteInfo } from 'inversify-express-utils';
import { configExpressError, configExpress, configExpressNotFoundError } from './loader/express';
import { initDb } from './loader/mongoose';
import { getContainer } from './loader/inversify';
import { logger } from './loader/logger';
import { render } from 'prettyjson';
import { AuthProvider } from './api/provider/auth';
import { AddressInfo } from 'net';

process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT_EXCEPTION: %o', error);

  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('UNHANDLED_REJECTION: Reason: %o', reason);
  logger.error('UNHANDLED_REJECTION: Promise: %o', promise);
});

async function serve(): Promise<void> {
  await initDb();

  logger.info('DB_CONNECTED');

  const container = getContainer();

  const app = new InversifyExpressServer(container, null, null, null, AuthProvider).setConfig(configExpress).build();

  configExpressNotFoundError(app);

  configExpressError(app);

  logger.info('DI_LOADED');

  logger.info('ROUTES_LOADED');

  logger.debug(render(getRouteInfo(container)));

  logger.info('APP_LOADED');

  const server = http.createServer(app);

  server.on('error', (error) => {
    logger.error('SERVER_ERROR: %o', error);

    throw error;
  });

  server.listen(config.port, () => {
    logger.info('🚀  Server ready at Port: %o', (server.address() as AddressInfo).port);
  });
}

serve();

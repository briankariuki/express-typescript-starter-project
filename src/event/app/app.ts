import { EventEmitter } from 'events';
import { injectable } from 'inversify';
import { logger } from '../../loader/logger';
import { AppDocument } from '../../model/app/app';

type AppEvent = 'app-created' | 'app-updated' | 'app-fetched' | 'app-deleted';

export interface AppEventEmitter {
  on(event: AppEvent, listener: (app: AppDocument) => void): this;
  emit(event: AppEvent, app: AppDocument): boolean;
}

@injectable()
export class AppEventEmitter extends EventEmitter {
  constructor() {
    super();

    this.on('app-created', async (app) => {
      try {
        logger.info('app-created %o', app._id);
      } catch (error) {
        logger.error('app-created %o', (error as Error).message);
      }
    });

    this.on('app-updated', async (app) => {
      try {
        logger.info('app-updated %o', app._id);
      } catch (error) {
        logger.error('app-updated %o', (error as Error).message);
      }
    });

    this.on('app-fetched', async (app) => {
      try {
        logger.info('app-fetched %o', app._id);
      } catch (error) {
        logger.error('app-fetched %o', (error as Error).message);
      }
    });

    this.on('app-deleted', async (app) => {
      try {
        logger.info('app-deleted %o', app._id);
      } catch (error) {
        logger.error('app-deleted %o', (error as Error).message);
      }
    });
  }
}

import { EventEmitter } from 'events';
import { injectable } from 'inversify';
import { logger } from '../../loader/logger';
import { NotificationDocument, NotificationModel } from '../../model/notification/notification';
import { UserModel } from '../../model/user/user';

type NotificationEvent =
  | 'notification-created'
  | 'notification-updated'
  | 'notification-fetched'
  | 'notification-deleted';

export interface NotificationEventEmitter {
  on(event: NotificationEvent, listener: (data: NotificationDocument) => void): this;
  emit(event: NotificationEvent, data: NotificationDocument): boolean;
}

@injectable()
export class NotificationEventEmitter extends EventEmitter {
  constructor() {
    super();

    this.on('notification-created', async (notification: NotificationDocument) => {
      try {
        logger.info('notification-created %o', notification._id);

        await (await UserModel.findById(notification.populated(notification.user) || notification.user)).addFields();
      } catch (error) {
        logger.error('notification-created %o', (error as Error).message);
      }
    });

    this.on('notification-updated', async (notification: NotificationDocument) => {
      try {
        logger.info('notification-updated %o', notification._id);

        await NotificationModel.updateMany(
          { _id: { $lt: notification._id }, user: notification.populated(notification.user) || notification.user },
          { $set: { status: notification.status } },
        );

        await (await UserModel.findById(notification.populated(notification.user) || notification.user)).addFields();
      } catch (error) {
        logger.error('notification-updated %o', (error as Error).message);
      }
    });

    this.on('notification-fetched', async (notification: NotificationDocument) => {
      try {
        logger.info('notification-fetched %o', notification._id);
      } catch (error) {
        logger.error('notification-fetched %o', (error as Error).message);
      }
    });

    this.on('notification-deleted', async (notification: NotificationDocument) => {
      try {
        logger.info('notification-deleted %o', notification._id);

        await (await UserModel.findById(notification.populated(notification.user) || notification.user)).addFields();
      } catch (error) {
        logger.error('notification-deleted %o', (error as Error).message);
      }
    });
  }
}

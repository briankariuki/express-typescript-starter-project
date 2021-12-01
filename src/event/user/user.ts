import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { User, UserDocument } from '../../model/user/user';
import { logger } from '../../loader/logger';
import { NotificationService } from '../../service/notification/notification';
import { FirebaseService } from '../../service/firebase/firebase';
import config from '../../config/config';

type UserEvent = 'user-created' | 'user-deleted' | 'user-updated' | 'user-fetched';

export interface UserEventEmitter {
  on(event: UserEvent, listener: (user: UserDocument) => void): this;
  emit(event: UserEvent, user: User): boolean;
}

@injectable()
export class UserEventEmitter extends EventEmitter {
  @inject(NotificationService)
  notificationService: NotificationService;

  @inject(FirebaseService)
  firebaseService: FirebaseService;

  constructor() {
    super();

    this.on('user-created', async (user) => {
      logger.info('user-register %o', user._id);

      try {
        await user.addFields();
      } catch (error) {
        logger.error('user-fetched %o', (error as Error).message);
      }

      await this.notificationService.create({
        user: user.id,
        sender: config.ADMIN_ID,
        message: 'Add email and password to restore your account when logged out',
      });

      user.fcmToken.forEach(async (e) => {
        await this.firebaseService.sendNotification(e, {
          title: 'Account Created Succesfully',
          body: `Hi @${user.username}, add your email and password to restore your account when logged out`,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          screen: '/add-email',
          imageUrl: 'https://pbs.twimg.com/profile_images/1296395667401846784/lj8OmH_T_400x400.jpg',
          avatar: `${user.avatar.filename}`,
          summary: 'notification',
          priority: 'high',
        });
      });
    });

    this.on('user-deleted', (user) => {
      logger.info('user-delete %o', user._id);
    });

    this.on('user-updated', async (user) => {
      logger.info('user-update %o', user._id);

      try {
        await user.addFields();
      } catch (error) {
        logger.error('user-updated %o', (error as Error).message);
      }
    });

    this.on('user-fetched', async (user) => {
      logger.info('user-fetched %o', user._id);

      try {
        await user.addFields();
      } catch (error) {
        logger.error('user-fetched %o', (error as Error).message);
      }
    });
  }
}

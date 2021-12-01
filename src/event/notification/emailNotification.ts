import { EventEmitter } from 'events';
import { injectable, inject } from 'inversify';
import { Purpose, EmailNotificationModel } from '../../model/notification/emailNotification';
import { EmailService } from '../../service/email/email';
import { logger } from '../../loader/logger';

type EmailNotificationEvent = 'send-email';

export interface EmailNotificationEventEmitter {
  on(
    event: EmailNotificationEvent,
    listener: (data: { to: string; purpose: Purpose; message: string; meta?: string }) => void,
  ): this;
  emit(
    event: EmailNotificationEvent,
    data: {
      to: string;
      purpose: Purpose;
      message: string;
      meta?: string;
    },
  ): boolean;
}

@injectable()
export class EmailNotificationEventEmitter extends EventEmitter {
  @inject(EmailService)
  private emailService: EmailService;

  constructor() {
    super();

    this.on('send-email', async (data) => {
      try {
        const { to, message, meta, purpose } = data;

        const emailNotification = await new EmailNotificationModel({ to, message, meta, purpose }).save();

        try {
          logger.info('send-email %o : %o', emailNotification.to, emailNotification.purpose);

          await this.emailService.send({
            to,
            message,
          });

          emailNotification.status = 'success';
        } catch (error) {
          logger.error('send-email %o', (error as Error).message);
          emailNotification.status = 'failed';
        }

        await emailNotification.save();
      } catch (error) {
        logger.error('email-send-event %o', (error as Error).message);
      }
    });
  }
}

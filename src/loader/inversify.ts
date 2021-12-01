import { Container } from 'inversify';
import { Auth0Middleware } from '../api/middleware/auth';
import { PermitAdminMiddleware } from '../api/middleware/permission';
import { UploadMiddleware } from '../api/middleware/upload';
import { AppEventEmitter } from '../event/app/app';
import { EmailNotificationEventEmitter } from '../event/notification/emailNotification';
import { NotificationEventEmitter } from '../event/notification/notification';
import { RequestEventEmitter } from '../event/request/request';
import { UserEventEmitter } from '../event/user/user';
import { AccessInfoService, AccessControlService } from '../service/access/access';
import { AppService } from '../service/app/app';
import { EmailService } from '../service/email/email';
import { FirebaseService } from '../service/firebase/firebase';
import { NotificationService } from '../service/notification/notification';
import { RequestService } from '../service/request/request';
import { TokenService } from '../service/token/token';
import { UserService } from '../service/user/user';
export function getContainer(): Container {
  const container = new Container({ skipBaseClassChecks: true });
  
  container.bind<UserEventEmitter>(UserEventEmitter).to(UserEventEmitter);
  container.bind<UserService>(UserService).to(UserService);

  container.bind<AccessInfoService>(AccessInfoService).to(AccessInfoService);
  container.bind<AccessControlService>(AccessControlService).to(AccessControlService);

  container.bind<Auth0Middleware>(Auth0Middleware).to(Auth0Middleware);

  container.bind<PermitAdminMiddleware>(PermitAdminMiddleware).to(PermitAdminMiddleware);

  container.bind<UploadMiddleware>(UploadMiddleware).to(UploadMiddleware);

  container.bind<RequestEventEmitter>(RequestEventEmitter).to(RequestEventEmitter);
  container.bind<RequestService>(RequestService).to(RequestService);

  container.bind<TokenService>(TokenService).to(TokenService);

  container.bind<FirebaseService>(FirebaseService).to(FirebaseService);

  container.bind<AppEventEmitter>(AppEventEmitter).to(AppEventEmitter);
  container.bind<AppService>(AppService).to(AppService);

  container.bind<NotificationEventEmitter>(NotificationEventEmitter).to(NotificationEventEmitter);
  container.bind<NotificationService>(NotificationService).to(NotificationService);

  container.bind<EmailNotificationEventEmitter>(EmailNotificationEventEmitter).to(EmailNotificationEventEmitter);
  container.bind<EmailService>(EmailService).to(EmailService);


  return container;
}
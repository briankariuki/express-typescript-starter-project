import { injectable } from 'inversify';
import { credential, initializeApp, apps } from 'firebase-admin';
import { logger } from '../../loader/logger';
import { BaseHttpController } from 'inversify-express-utils';

const serviceAccount = require('../../../firebase_2.json');

@injectable()
export class FirebaseService extends BaseHttpController {
  private admin =
    apps.length == 0
      ? initializeApp({
          credential: credential.applicationDefault(),
          databaseURL: 'https://example-default-rtdb.firebaseio.com/',
        })
      : apps[0];
  private exampleApp =
    apps.length == 1
      ? initializeApp(
          {
            credential: credential.cert(serviceAccount),
            databaseURL: 'https://example-default-rtdb.firebaseio.com/',
          },
          'example-app',
        )
      : apps[1];

  async getUid(token: string): Promise<string> {
    const decodedIdToken = await this.admin.auth().verifyIdToken(token);

    return decodedIdToken.uid;
  }

  async getUser(uid: string): Promise<{ displayName: string; email: string; photoURL: string }> {
    const response = await this.admin.auth().getUser(uid);

    logger.info('firebase-getUser-response : %o', response);

    const { displayName, email, photoURL } = response;

    return { displayName, email, photoURL };
  }

  async sendNotification(token: string, data: any): Promise<void> {
    const request = this.httpContext.request;

    var _appName = request.get('app-name');

    const _payload: any = {
      token,
      data,
    };

    _payload.android = {
      priority: 'high',
    };

    if (_appName == 'example') {
      // const _headers = {
      //   Authorization: `Bearer ${config.FPL_STATION_FCM_TOKEN}`,
      //   'Content-Type': 'application/json',
      // };
      // console.log(_headers);
      // const response: any = await axios.post(config.FCM_URI, _payload, { headers: _headers });

      const response = await this.exampleApp.messaging().send(_payload);

      logger.info('fcm-message-sent %o', response);

      return;
    }

    const response = await this.admin.messaging().send(_payload);

    logger.info('fcm-message-sent %o', response);
  }
}

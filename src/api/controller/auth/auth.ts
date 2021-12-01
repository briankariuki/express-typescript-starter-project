import { BaseHttpController, controller, httpPost, httpGet } from 'inversify-express-utils';
import { inject } from 'inversify';
import { celebrate, Joi } from 'celebrate';
import { UserService } from '../../../service/user/user';
import { FirebaseService } from '../../../service/firebase/firebase';
import { NAME_REGEX } from '../../../util/regex';
import { UserDocument } from '../../../model/user/user';
import { upload, UploadMiddleware } from '../../middleware/upload';
import config from '../../../config/config';
import { fileJoi } from '../../../util/joi';

@controller('/v1/auth')
export class AuthController extends BaseHttpController {
  @inject(UserService)
  private userService: UserService;

  @inject(FirebaseService)
  private firebase: FirebaseService;

  @httpGet(
    '/',
    celebrate({
      body: Joi.object().empty(),
      query: Joi.object().empty(),
    }),
  )
  async auth(): Promise<void> {
    const {
      response,
      user: { details: id, isAuthenticated },
    } = this.httpContext;

    let user: UserDocument;

    if (await isAuthenticated()) {
      user = await this.userService.findById(id);
    } else {
      user = await this.userService.findOne({ uid: id });

      if (user._status != 'active') throw new Error('You have been blocked from Scorr. Contact support');
    }

    response.json({ user });
  }

  @httpPost(
    '/register',
    upload({ filePath: config.FILE_PATH, fileName: 'avatar' }),
    UploadMiddleware,
    celebrate({
      body: Joi.object({
        displayName: Joi.string().regex(NAME_REGEX).required(),
        username: Joi.string().required(),
        file: fileJoi,
        fcmToken: Joi.string(),
      }),
    }),
  )
  async register(): Promise<void> {
    const {
      response,
      request: {
        body: { displayName, username, file: avatar, media, teams, fplTeamId, fcmToken },
      },
      user: { details: uid, isAuthenticated },
    } = this.httpContext;

    if (await isAuthenticated()) throw new Error('User registered. Log in');

    try {
      await this.userService.findOne({ uid });

      throw new Error('User registered. Log in');
    } catch (error) {}

    const { email, photoURL } = await this.firebase.getUser(uid);

    const user = await this.userService.create({
      uid,
      displayName,
      username,
      email,
      photoURL,
      avatar,
      fcmToken,
    });

    response.json({ user });
  }
}

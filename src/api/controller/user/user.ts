import { UserService } from '../../../service/user/user';
import { inject } from 'inversify';
import { celebrate, Joi } from 'celebrate';
import { httpPut, controller, BaseHttpController, httpGet, httpPost, httpDelete } from 'inversify-express-utils';
import { NAME_REGEX } from '../../../util/regex';
import { Query } from '../../../plugin/types';
import config from '../../../config/config';
import { upload, UploadMiddleware } from '../../middleware/upload';
import { fileJoi } from '../../../util/joi';
import { Auth0Middleware } from '../../middleware/auth';
import { FirebaseService } from '../../../service/firebase/firebase';
import { Types } from 'mongoose';
import { UserDocument } from '../../../model/user/user';

@controller('/v1/user')
export class UserController extends BaseHttpController {
  @inject(UserService)
  private userService: UserService;

  @inject(FirebaseService)
  private firebaseService: FirebaseService;

  @httpPut(
    '/:userId',
    Auth0Middleware,
    upload({ filePath: config.FILE_PATH, fileName: 'avatar' }),
    UploadMiddleware,
    celebrate({
      body: Joi.object({
        displayName: Joi.string().regex(NAME_REGEX),
        _status: Joi.string(),
        preferences: Joi.array().items(Joi.string()),
        file: fileJoi,
        fcmToken: Joi.string(),
      }),
    }),
  )
  async update(): Promise<void> {
    const {
      request: {
        body: { preferences, file: avatar, displayName, _status, teams, fplTeamId, fcmToken },
        params: { userId },
      },
      response,
    } = this.httpContext;

    const { uid } = await this.userService.findById(userId);

    const { email, photoURL } = await this.firebaseService.getUser(uid);

    const user = await this.userService.update(
      userId,
      {
        displayName,
        _status,
        avatar,
        preferences,
        email,
        photoURL,
        
      },
    );

    response.json({ user });
  }

  @httpGet(
    '/',
    celebrate({
      query: Joi.object({
        userId: Joi.string(),
        q: Joi.string().allow(''),
        sort: Joi.string(),
        role: Joi.string(),
        _status: Joi.string(),
        page: Joi.number(),
        limit: Joi.number(),
        username: Joi.string(),
      }),
    }),
  )
  async retrieve(): Promise<void> {
    const { userId, username, sort, page, limit, q, role, _status } = this.httpContext.request.query as any;

    const { details: activeUserId } = this.httpContext.user;

    if (username) {
      let query: Query = {};

      query = { ...query, ...{ username } };

      const user: any = (await this.userService.findOne(query)).toObject();

      if (user) throw new Error('Username not available');

      return;
    }

    if (userId) {
      let query: { $or?: ({ username: string } | { _id: string })[]; username?: string } = {};

      if (Types.ObjectId.isValid(userId)) query = { ...query, ...{ $or: [{ username: userId }, { _id: userId }] } };
      else query = { ...query, ...{ username: userId } };

      const user: any = (await this.userService.findOne(query)).toObject();

      if (activeUserId) {
        // try {
        //   let query: Query = {};
        //   query = { ...query, ...{ user: userId, following: activeUserId } };
        //   const follower = await this.followerService.findOne(query);
        //   user.follower = !!follower;
        // } catch (error) {}
        // try {
        //   let query: Query = {};
        //   query = { ...query, ...{ user: activeUserId, following: userId } };
        //   const following = await this.followerService.findOne(query);
        //   user.following = !!following;
        // } catch (error) {}
      }

      this.httpContext.response.json({ user });

      return;
    }

    let query: Query = {};

    if (role) query = { ...query, ...{ role } };

    if (_status) query = { ...query, ...{ _status } };

    const userPage = await this.userService.page(query, {
      sort,
      page,
      limit,
      q,
      populate: [],
    });

    if (activeUserId)
      for (let position = 0; position < userPage.docs.length; position += 1) {
        const _user = userPage.docs[position].toObject();

        // try {
        //   const follower = await this.followerService.findOne({ user: _user._id, following: activeUserId });

        //   _user.follower = !!follower;
        // } catch (error) {}

        // try {
        //   const following = await this.followerService.findOne({ user: activeUserId, following: _user._id });

        //   _user.following = !!following;
        // } catch (error) {}

        userPage.docs[position] = _user as UserDocument;
      }

    this.httpContext.response.json({ userPage });
  }

  @httpDelete(
    '/',
    Auth0Middleware,
    celebrate({
      query: Joi.object({
        userId: Joi.string().required(),
      }),
    }),
  )
  async remove(): Promise<void> {
    const { userId } = this.httpContext.request.query as any;

    const user = await this.userService.delete(userId);

    this.httpContext.response.json({ user });
  }
}

import { Request } from 'express';
import { injectable, inject } from 'inversify';
import { interfaces } from 'inversify-express-utils';
import { logger } from '../../loader/logger';
import { FirebaseService } from '../../service/firebase/firebase';
import { Role, UserDocument } from '../../model/user/user';
import { UserService } from '../../service/user/user';
import { RequestService } from '../../service/request/request';

@injectable()
export class AuthProvider implements interfaces.AuthProvider {
  @inject(FirebaseService)
  private firebaseService: FirebaseService;

  @inject(UserService)
  private userService: UserService;

  @inject(RequestService)
  private requestService: RequestService;

  async getUser(request: Request): Promise<interfaces.Principal> {
    let uid: string;

    try {
      const authorization = request.get('authorization');

      if (authorization) {
        const token = authorization.split(' ')[1];

        if (token) uid = await this.firebaseService.getUid(token);
      }
    } catch (error) {
      logger.error('auth %o', (error as Error).message);

      let newError = {};

      (newError as DefaultError).message = 'Session expired';
      (newError as DefaultError).code = '401';
      (newError as DefaultError).status = 401;

      throw newError;
    }

    logger.debug('auth-uid %o', uid);

    let user: UserDocument;

    if (uid)
      try {
        user = await this.userService.findOne({ uid });
      } catch (error) {}

    await this.requestService.create({ user, request });

    return {
      details: user && user._status === 'active' ? user._id : uid,
      isAuthenticated: async function (): Promise<boolean> {
        return user && user._status === 'active';
      },
      isResourceOwner: async function (resourceId: any): Promise<boolean> {
        return user && user._status === 'active' && !resourceId;
      },
      isInRole: async function (role: Role): Promise<boolean> {
        return user && user._status === 'active' && user.role == role;
      },
    };
  }
}

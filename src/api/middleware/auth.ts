import { Response, Request } from 'express';
import { injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import { NextFunction } from 'connect';

@injectable()
export class Auth0Middleware extends BaseMiddleware {
  async handler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAuthenticated = await this.httpContext.user.isAuthenticated();

      if (!isAuthenticated) throw new Error('Session expired');

      next();
    } catch (error) {
      (error as DefaultError).message = 'Session expired';
      (error as DefaultError).code = '401';
      (error as DefaultError).status = 401;

      next(error);
    }
  }
}

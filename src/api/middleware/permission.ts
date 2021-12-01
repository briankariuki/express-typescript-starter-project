import { injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import { Request, Response, NextFunction } from 'express';
@injectable()
export class PermitAdminMiddleware extends BaseMiddleware {
  async handler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permitted = await this.httpContext.user.isInRole('admin');

      if (permitted) return next();

      throw new Error('You do not have permissions to access this resource. [admin]');
    } catch (error) {
      (error as DefaultError).code = '403';
      (error as DefaultError).status = 403;
      next(error);
    }
  }
}

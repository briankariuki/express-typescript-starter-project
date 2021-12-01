import { injectable } from 'inversify';
import { logger } from '../../loader/logger';

@injectable()
export class EmailService {
  async send(params: { to: string; message: string; enqueue?: boolean }): Promise<void> {
    logger.info('email %o', params);
  }
}

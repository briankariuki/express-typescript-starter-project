import { Request } from 'express';
import { injectable, inject } from 'inversify';
import { RequestEventEmitter } from '../../event/request/request';
import { UserDocument } from '../../model/user/user';

@injectable()
export class RequestService {
  @inject(RequestEventEmitter)
  private requestEventEmitter: RequestEventEmitter;

  async create(data: { user?: UserDocument; request: Request }): Promise<void> {
    this.requestEventEmitter.emit('request-created', data);
  }
}

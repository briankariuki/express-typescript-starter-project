import { injectable } from 'inversify';
import config from '../../config/config';
import { sign, verify } from 'jsonwebtoken';

@injectable()
export class TokenService {
  encode(
    payload: string | any,
    options: { expiresIn: string } = { expiresIn: config.authentication.jwtExpiry },
  ): string {
    return sign(payload, config.authentication.jwtSecret, options);
  }

  async decode(token: string): Promise<any> {
    return verify(token, config.authentication.jwtSecret) as any;
  }
}

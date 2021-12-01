import { AccessControl, IAccessInfo } from 'role-acl';
import { injectable, decorate, inject } from 'inversify';

decorate(injectable(), AccessControl);

@injectable()
export class AccessInfoService {
  getGrants(): IAccessInfo[] {
    return [{ role: 'user', resource: 'user', action: 'update' }];
  }
}

@injectable()
export class AccessControlService extends AccessControl {
  constructor(@inject(AccessInfoService) accessInfo: AccessInfoService) {
    super(accessInfo.getGrants());
  }
}

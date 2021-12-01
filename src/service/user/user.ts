import { inject, injectable } from 'inversify';
import { pickBy } from 'lodash';
import { User, UserModel, UserDocument } from '../../model/user/user';
import { PageOptions, PageResult, Query, DefaultDocument } from '../../plugin/types';
import { UserEventEmitter } from '../../event/user/user';

@injectable()
export class UserService {
  @inject(UserEventEmitter)
  private userEventEmitter: UserEventEmitter;

  async create(data: {
    uid: User['uid'];
    email?: User['email'];
    displayName: User['displayName'];
    username: User['username'];
    preferences?: User['preferences'];
    avatar: User['avatar'];
    photoURL?: User['photoURL'];
    fcmToken?: User['fcmToken'];
  }): Promise<UserDocument> {
    const user = await new UserModel(pickBy(data)).save();

    this.userEventEmitter.emit('user-created', user);

    // await user.populate([{ path: 'wishlist' }, { path: 'groupsIn', populate: { path: 'user' } }]).execPopulate();

    return user;
  }

  async update(
    userId: string,

    update: {
      email?: User['email'];
      displayName?: User['displayName'];
      username?: User['username'];
      preferences?: User['preferences'];
     
      avatar?: User['avatar'];
      photoURL?: User['photoURL'];
      

      _status?: DefaultDocument['_status'];
    },
    fcmToken?: User['fcmToken'],
  ): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: pickBy(update), $addToSet: { fcmToken: fcmToken } },
      { new: true, runValidators: true },
    );

    if (!user) throw new Error('User not found');

    this.userEventEmitter.emit('user-updated', user);

    return user;
  }

  

  async findById(userId: string): Promise<UserDocument> {
    const user = await UserModel.findById(userId);

    if (!user) throw new Error('User not found');

    this.userEventEmitter.emit('user-fetched', user);

    return user;
  }

  async findOne(query: Query): Promise<UserDocument> {
    const user = await UserModel.findOne(query);

    if (!user) throw new Error('User not found');

    this.userEventEmitter.emit('user-fetched', user);

    return user;
  }

  async delete(userId: string): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: pickBy({ _status: 'deleted' }) },
      { new: true, runValidators: true },
    );

    if (!user) throw new Error('User not found');

    this.userEventEmitter.emit('user-deleted', user);

    return user;
  }

  async page(query: Query, pageOptions: PageOptions): Promise<PageResult<UserDocument>> {
    let pageResult: PageResult<UserDocument>;

    const { q, page, limit, populate } = pageOptions;

    if (q) {
      const docs = await UserModel.look(q, { query, populate, page, limit });

      pageResult = { docs, limit: docs.length, total: docs.length, sort: q, page: 1, pages: 1 };
    } else {
      pageResult = await UserModel.page(pickBy(query), pageOptions);
    }

    return pageResult;
  }
}

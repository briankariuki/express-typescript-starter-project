import { injectable, inject } from 'inversify';
import { pickBy } from 'lodash';
import { PageOptions, PageResult, Query, DefaultDocument } from '../../plugin/types';
import { Notification, NotificationModel, NotificationDocument } from '../../model/notification/notification';
import { NotificationEventEmitter } from '../../event/notification/notification';

@injectable()
export class NotificationService {
  @inject(NotificationEventEmitter)
  private notificationEventEmitter: NotificationEventEmitter;

  async create(data: {
    user: Notification['user'];
    sender: Notification['sender'];
    message?: Notification['message'];
  }): Promise<Notification> {
    const notification = await new NotificationModel(pickBy(data)).save();

    this.notificationEventEmitter.emit('notification-created', notification);

    await notification.populate([{ path: 'user' }, { path: 'sender' }]).execPopulate();

    return notification;
  }

  async update(
    notificationId: string,
    data: {
      status?: Notification['status'];
      _status?: DefaultDocument['_status'];
    },
  ): Promise<Notification> {
    const notification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { $set: pickBy(data) },
      { new: true, runValidators: true },
    );

    if (!notification) throw new Error('Notification not found');

    this.notificationEventEmitter.emit('notification-updated', notification);

    await notification.populate([{ path: 'user' }, { path: 'sender' }]).execPopulate();

    return notification;
  }

  async findById(notificationId: string): Promise<NotificationDocument> {
    const notification = await NotificationModel.findById(notificationId);

    if (!notification) throw new Error('Notification not found');

    this.notificationEventEmitter.emit('notification-fetched', notification);

    await notification.populate([{ path: 'user' }, { path: 'sender' }]).execPopulate();

    return notification;
  }

  async findOne(query: Query): Promise<NotificationDocument> {
    const notification = await NotificationModel.findOne(query);

    if (!notification) throw new Error('Notification not found');

    this.notificationEventEmitter.emit('notification-fetched', notification);

    await notification.populate([{ path: 'user' }, { path: 'sender' }]).execPopulate();

    return notification;
  }

  async findMany(query: Query): Promise<NotificationDocument[]> {
    const notifications = await NotificationModel.find(query);

    return notifications;
  }

  async delete(notificationId: string): Promise<Notification> {
    const notification = await this.findById(notificationId);

    await notification.remove();

    this.notificationEventEmitter.emit('notification-deleted', notification);

    await notification.populate([{ path: 'user' }, { path: 'sender' }]).execPopulate();

    return notification;
  }

  async page(query: Query, pageOptions: PageOptions): Promise<PageResult<NotificationDocument>> {
    let page: PageResult<NotificationDocument>;

    const { q } = query;

    if (q) {
      const docs = await NotificationModel.look(q);

      page = { docs, limit: docs.length, total: docs.length, sort: q, page: 1, pages: 1 };
    } else {
      page = await NotificationModel.page(pickBy(query), pageOptions);
    }

    return page;
  }
}

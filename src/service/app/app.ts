import { injectable, inject } from 'inversify';
import { pickBy } from 'lodash';
import { PageOptions, PageResult, Query, DefaultDocument } from '../../plugin/types';
import { App, AppModel, AppDocument } from '../../model/app/app';
import { AppEventEmitter } from '../../event/app/app';

@injectable()
export class AppService {
  @inject(AppEventEmitter)
  private appEventEmitter: AppEventEmitter;

  async create(data: App): Promise<App> {
    let app = await AppModel.findOne({ token: data.token });

    if (app) {
      Object.keys(data).forEach((key) => (app[key] = data[key]));

      await app.save();

      this.appEventEmitter.emit('app-updated', app);
    } else {
      app = await new AppModel(pickBy(data)).save();

      this.appEventEmitter.emit('app-created', app);
    }

    return app;
  }

  async update(
    appId: string,
    data: {
      _status?: DefaultDocument['_status'];
    },
  ): Promise<App> {
    const app = await AppModel.findByIdAndUpdate(appId, { $set: pickBy(data) }, { new: true, runValidators: true });

    if (!app) throw new Error('App not found');

    this.appEventEmitter.emit('app-updated', app);

    return app;
  }

  async findById(appId: string): Promise<AppDocument> {
    const app = await AppModel.findById(appId);

    if (!app) throw new Error('App not found');

    this.appEventEmitter.emit('app-fetched', app);

    return app;
  }

  async delete(appId: string): Promise<App> {
    const app = await AppModel.findByIdAndUpdate(
      appId,
      { $set: { _status: 'deleted' } },
      { new: true, runValidators: true },
    );

    if (!app) throw new Error('App not found');

    this.appEventEmitter.emit('app-deleted', app);

    return app;
  }

  async page(query: Query, pageOptions: PageOptions): Promise<PageResult<AppDocument>> {
    let pageResult: PageResult<AppDocument>;

    const { q, page, limit, populate } = pageOptions;

    if (q) {
      const docs = await AppModel.look(q, { query, populate, page, limit });

      pageResult = { docs, limit: docs.length, total: docs.length, sort: q, page: 1, pages: 1 };
    } else {
      pageResult = await AppModel.page(pickBy(query), pageOptions);
    }

    return pageResult;
  }
}

import searchPlugin from 'mongoosastic';
import idValidator from 'mongoose-id-validator';
import { pagePlugin } from './page';
import { Document, Schema } from 'mongoose';
import { logger } from '../loader/logger';
import { SearchableModel, Populate, Query } from './types';
import { historyPlugin } from './history';
import config from '../config/config';
import { query } from 'express';

async function look(
  q: string,
  options: { query?: Query; populate?: Populate[]; page?: number; limit?: number } = {},
): Promise<Document[]> {
  const model = this as SearchableModel<Document>;

  if (config.ELASTICSEARCH_STATUS !== 'enabled') {
    const { page, limit } = options;
    return model
      .find({ ...query, ...{ $text: { $search: q } } })
      .skip(((page || 1) - 1) * (limit || 10))
      .limit(limit || 10);
  }

  return new Promise((resolve, reject) => {
    const { populate, query: queryOptions, page, limit } = options;

    const query = {
      query_string: {
        query: q,
      },
    };

    const opts = {
      suggest: {
        autocomplete: {
          prefix: q,
          completion: {
            field: 'suggestions',
            skip_duplicates: true,
            fuzzy: {
              fuzziness: 'auto',
            },
          },
        },
      },
      from: page ? (page - 1) * (limit ? limit : 10) : 0,
      size: limit || 10,
    };

    model.search(query, opts, async (error, results) => {
      if (error) return reject(error);

      let ids: string[] = [];

      if (results.hits) ids = [...ids, ...results.hits.hits.map((hit) => hit._id)];

      if (results.suggest && results.suggest.autocomplete[0])
        ids = [...ids, ...results.suggest.autocomplete[0].options.map((option) => option._id)];

      const _query = model.find({ ...queryOptions, ...{ _id: { $in: ids } } });

      if (populate) _query.populate(populate);

      const docs = await _query.exec();

      return resolve(docs);
    });
  });
}

function toJson(): any {
  const object = (this as Document).toObject();

  return object;
}

function plugin(schema: Schema, options: { searchable?: boolean } = {}): void {
  schema.plugin(historyPlugin);
  schema.plugin(idValidator);
  schema.plugin(pagePlugin);

  const { searchable } = options;

  if (searchable) {
    schema.plugin(searchPlugin);
    schema.statics.look = look;
  }

  schema.methods.toJSON = toJson;

  // Index all text fields to allow easy search
  schema.index({ '$**': 'text' });

  schema.add({
    _status: {
      type: String,
      default: 'active',
      enum: ['active', 'deleted'],
    },
  });
}

export function initSearch(model: any): void {
  if (config.ELASTICSEARCH_STATUS !== 'enabled') return;

  const title = model.collection.collectionName.toLowerCase();

  model.bulkError().on('error', (error, res) => {
    logger.error('mongoosastic-bulkError %o : %o', title, error);
    logger.info('mongoosastic-bulkError-res %o : %o', title, res);
  });

  model.esTruncate((error) => {
    if (error && error.status != 404) logger.error('mongoosastic-esTruncate-error %o : %o', title, error);

    model.createMapping({}, (error, mapping) => {
      if (mapping) logger.info('mongoosastic-createMapping %o : %o', title, mapping);
      if (error) logger.error('mongoosastic-createMapping-error %o : %o', title, error);
    });

    const stream = model.synchronize();

    let count = 0;

    stream.on('data', async (err, doc) => {
      count += 1;

      if (err) logger.error('mongoosastic-data-error %o : %o : %o : %o', title, count, doc, err);

      try {
        if (doc.addFields) await doc.addFields();
      } catch (error) {
        if (error) logger.error('mongoosastic-data-addFields %o : %o : %o : %o', title, count, doc, error);
      }
    });

    stream.on('close', () => {
      logger.info('mongoosastic-close %o : %o', title, count);
    });

    stream.on('error', (e) => {
      if (e) logger.info('mongoosastic-error %o : %o : %o', title, count, e);
    });
  });
}

export const defaultPlugin = plugin;

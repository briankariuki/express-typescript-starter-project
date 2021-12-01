import { Schema, Model, Document, DocumentQuery, Aggregate, Types } from 'mongoose';
import { PageResult, PageOptions, Query } from './types';

async function page(q: Query = {}, options: PageOptions): Promise<PageResult<Document>> {
  let { sort, limit, page: p } = options;
  const { populate, select, key, direction } = options;

  sort = sort || '-createdAt';

  limit = limit || 10;

  p = p || 1;

  const looks = sort.split('.');

  let _query: DocumentQuery<Document[], Document> | Aggregate<any[]>;

  const shouldLookUp = looks.length > 1;

  const model = this as Model<Document>;

  let query = q;

  if (key) {
    if (!query._id)
      query = {
        ...query,
        ...{ _id: direction === 'previous' ? { $gt: Types.ObjectId(key) } : { $lt: Types.ObjectId(key) } },
      };
    else if (!query.$and)
      query = {
        ...query,
        ...{
          $and: [
            { _id: query._id },
            { _id: direction === 'previous' ? { $gt: Types.ObjectId(key) } : { $lt: Types.ObjectId(key) } },
          ],
        },
      };
    else if (query.$and)
      query = {
        ...query,
        ...{
          $and: [
            ...query.$and,
            { _id: query._id },
            { _id: direction === 'previous' ? { $gt: Types.ObjectId(key) } : { $lt: Types.ObjectId(key) } },
          ],
        },
      };
  }

  if (!shouldLookUp) {
    _query = model.find(query);

    if (populate) _query = _query.populate(populate);

    if (select) _query.select(select);
  } else {
    let field = looks[0];

    if (field.startsWith('-')) field = field.substring(1);

    let from = field;

    if (field.split(':').length) {
      from = field.split(':')[1];
      field = field.split(':')[0];
    }

    sort = `${field}.${looks[1]}`;

    _query = model.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: `${from}s`,
          localField: field,
          foreignField: '_id',
          as: field,
        },
      },
      {
        $unwind: `$${field}`,
      },
    ]);
  }

  _query.sort(sort);

  if (!key) _query.skip((p - 1) * limit);

  _query.limit(limit);

  let docs: Document[] = await _query.exec();

  if (shouldLookUp) {
    const tempDocs = [];

    for (let i = 0; i < docs.length; i += 1) {
      const tempDoc = model.findById(docs[i]._id);

      if (populate) tempDoc.populate(populate);

      if (select) tempDoc.select(select);

      const doc = await tempDoc.exec();

      if (doc) tempDocs.push(doc);
    }

    docs = tempDocs;
  }

  let total = 0;

  if (query && Object.entries(query).length) total = await model.countDocuments(query);
  else total = await model.estimatedDocumentCount();

  const pages = Math.ceil(total / limit) || 1;

  return {
    docs,
    total,
    limit: limit || total,
    page: p || 1,
    pages,
    sort,
  };
}

function plugin(schema: Schema): void {
  schema.statics.page = page;
}

export const pagePlugin = plugin;

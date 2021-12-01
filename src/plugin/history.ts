import { Schema, Document, model } from 'mongoose';
import { PagedModel } from './types';

type HistoryEvent = 'save' | 'update' | 'remove';

type History = {
  reference: Schema.Types.ObjectId;
  collection: string;
  event: HistoryEvent;
  document: any;
};

type HistoryDocument = History & Document;

type HistoryModel = PagedModel<HistoryDocument>;

const history = new Schema(
  {
    reference: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    table: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      required: true,
      enum: ['save', 'update', 'remove'],
    },
    document: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

const HistoryModel = model<HistoryDocument, HistoryModel>('History', history);

async function archive(event: 'save' | 'update' | 'remove', document: Document): Promise<void> {
  const doc = await document.collection.findOne({ _id: document._id });

  if (doc) {
    const {
      _id: reference,
      collection: { name: table },
    } = document;

    await new HistoryModel({ reference, table, event, document: doc }).save();
  }
}

function plugin(schema: Schema): void {
  schema.post('save', async function () {
    await archive('save', this);
  });

  schema.pre('remove', async function () {
    await archive('remove', this);
  });

  schema.post('findOneAndUpdate', async function (document) {
    if (document) await archive('update', document);
  });
}

export const historyPlugin = plugin;

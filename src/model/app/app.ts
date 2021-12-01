import { Schema, model } from 'mongoose';
import { PagedModel, SearchableModel, DefaultDocument } from '../../plugin/types';
import { defaultPlugin } from '../../plugin/default';

export type App = {
  user?: string;
  key: string;
  id: string;
  version: string;
  token?: string;
  name: string;
};

export type AppDocument = DefaultDocument & App;

const appSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    key: {
      type: String,
    },
    id: {
      type: String,
    },
    version: {
      type: String,
      required: true,
    },
    token: {
      type: String,

      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

appSchema.plugin(defaultPlugin);

export const AppModel = model<AppDocument, PagedModel<AppDocument> & SearchableModel<AppDocument>>('App', appSchema);

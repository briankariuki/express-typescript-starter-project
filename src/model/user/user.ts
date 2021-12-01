import { Schema, model } from 'mongoose';
import { defaultPlugin, initSearch } from '../../plugin/default';
import { PagedModel, SearchableModel, DefaultDocument } from '../../plugin/types';
import { fileSchema } from '../../util/schema';
import { File } from '../../types/file';
import { NotificationModel } from '../notification/notification';

export type Role = 'default' | 'admin' | 'support';

export type User = {
  uid: string;
  email?: string;
  displayName: string;
  username: string;
  photoURL?: string;
  avatar: File;
  //   followers: number;
  //   followings: number;
  //   follower?: boolean;
  //   following?: boolean;
  //   posts: number;
  //   statuses: number;
  notifications: { total: number; unread: number; enabled: boolean };
  role: Role;
  preferences: string[];
 
  suggestions?: string[];
  fcmToken: string[];
};

export type UserDocument = DefaultDocument &
  User & {
    addFields(): Promise<void>;
  };

const userSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      index: {
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
      },
      lowercase: true,
      trim: true,
      es_indexed: true,
    },
    displayName: {
      type: String,
      required: true,
      es_indexed: true,
    },
    username: {
      type: String,
      required: true,
      es_indexed: true,
      unique: true,
    },
    photoURL: {
      type: String,
    },
    avatar: {
      type: fileSchema,
      es_indexed: false,
    },
    preferences: {
      type: [String],
    },
    
    creators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Creator',
        default: [],
      },
    ],

    suggestions: {
      type: [String],
      es_indexed: true,
      es_type: 'completion',
    },
    role: {
      type: String,
      default: 'default',
      enum: ['default', 'admin', 'support'],
    },
    notifications: {
      type: new Schema(
        {
          total: { type: Number, default: 0 },
          unread: { type: Number, default: 0 },
          enabled: { type: Boolean, default: true },
        },
        { timestamps: true },
      ),
      es_indexed: false,
      default: {
        total: 0,
        unread: 0,
        enabled: true,
      },
    },

    fcmToken: {
      type: [String],
    },
  },
  { timestamps: true },
);

userSchema.plugin(defaultPlugin, { searchable: true });

async function addFields(): Promise<void> {
  const doc = this as UserDocument;

  const { _id } = doc;

  doc.notifications.total = await NotificationModel.countDocuments({ user: _id, status: { $in: ['pending', 'sent'] } });
  doc.notifications.unread = await NotificationModel.countDocuments({ user: _id, status: { $in: ['unread'] } });

  // const suggestions = [];

  // suggestions.push(doc.teams);
  // doc.suggestions = suggestions;

  await doc.save();
}

userSchema.methods.addFields = addFields;

export const UserModel = model<UserDocument, PagedModel<UserDocument> & SearchableModel<UserDocument>>(
  'User',
  userSchema,
);

initSearch(UserModel);

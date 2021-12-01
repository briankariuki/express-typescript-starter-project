import { Document, Schema, model } from 'mongoose';
import { PagedModel, SearchableModel } from '../../plugin/types';
import { defaultPlugin } from '../../plugin/default';

export interface Notification {
  user: string;
  sender: string;
  message?: string;
  status: 'pending' | 'sent' | 'unread' | 'read';
}

export type NotificationDocument = Document & Notification;

type NotificationModel = PagedModel<NotificationDocument> & SearchableModel<NotificationDocument>;

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // post: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Post',
    // },

    message: {
      type: String,
    },

    status: {
      type: String,
      default: 'unread',
      enum: ['pending', 'sent', 'read', 'unread'],
    },
  },
  { timestamps: true },
);

notificationSchema.plugin(defaultPlugin);

// notificationSchema.virtual('message-title').get(function () {
//   return 'You have a new notification';
// });

export const NotificationModel = model<NotificationDocument, NotificationModel>('Notification', notificationSchema);

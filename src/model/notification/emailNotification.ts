import { Document, Schema, model } from 'mongoose';
import { PagedModel, SearchableModel } from '../../plugin/types';
import { defaultPlugin } from '../../plugin/default';

export type Purpose = 'login' | 'register' | 'password-change';

export interface EmailNotification {
  to: string;
  purpose: Purpose;
  message: string;
  meta?: string;
  status: 'sending' | 'success' | 'failed';
}

export type EmailNotificationDocument = Document & EmailNotification;

type EmailNotificationModel = PagedModel<EmailNotificationDocument> & SearchableModel<EmailNotificationDocument>;

const emailNotificationSchema = new Schema(
  {
    to: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ['login', 'register', 'password-change'],
    },
    message: {
      type: String,
      required: true,
    },
    meta: {
      type: String,
    },
    status: {
      type: String,
      default: 'sending',
      enum: ['sending', 'success', 'failed'],
    },
  },
  { timestamps: true },
);

emailNotificationSchema.plugin(defaultPlugin);

export const EmailNotificationModel = model<EmailNotificationDocument, EmailNotificationModel>(
  'EmailNotification',
  emailNotificationSchema,
);

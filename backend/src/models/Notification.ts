import { Schema, model } from 'mongoose';
import { INotification } from '../interfaces/notification.interface';

const NotificationSchema = new Schema<INotification>(
    {
        receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['LIKE_POST', 'LIKE_COMMENT', 'REPLY_COMMENT', 'FOLLOW', 'COMMENT_POST', 'LIKE_REPLY'], required: true },
        post: { type: Schema.Types.ObjectId, ref: 'Post' },
        comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
        reply: { type: Schema.Types.ObjectId, ref: 'Reply' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const NotificationModel = model<INotification>('Notification', NotificationSchema, 'notifications');
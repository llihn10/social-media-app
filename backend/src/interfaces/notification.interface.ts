import { Document, Types } from "mongoose";

export interface INotification extends Document {
    receiver: Types.ObjectId;
    sender: Types.ObjectId;
    type: 'LIKE_POST' | 'LIKE_COMMENT' | 'REPLY_COMMENT' | 'FOLLOW' | 'COMMENT_POST' | 'LIKE_REPLY';
    post?: Types.ObjectId;
    comment?: Types.ObjectId;
    reply?: Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
}
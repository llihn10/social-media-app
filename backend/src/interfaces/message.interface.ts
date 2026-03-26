import { Document, Types } from 'mongoose'

export interface IMessage extends Document {
    conversation_id: Types.ObjectId;
    sender: Types.ObjectId;
    content: string;
    isRead: boolean;
    createdAt?: Date;
}
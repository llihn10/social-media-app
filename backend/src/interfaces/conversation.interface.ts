import { Document, Types } from 'mongoose'

export interface IConversation extends Document {
    participants: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
    updatedAt?: Date;
}
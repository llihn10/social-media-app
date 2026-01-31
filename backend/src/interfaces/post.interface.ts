import { Document, Types } from 'mongoose'

export interface IPost extends Document {
    user_id: Types.ObjectId;
    content: string;
    media: string[];
    likes_count: number;
    comments_count: number;
    createdAt?: Date;
    updatedAt?: Date;
}
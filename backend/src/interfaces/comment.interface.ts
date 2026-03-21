import { Document, Types } from 'mongoose'

export interface IReply {
    _id?: Types.ObjectId;
    author_id: Types.ObjectId;
    content: string;
    likes: Types.ObjectId[];
    createdAt?: Date;
}

export interface IComment extends Document {
    post_id: Types.ObjectId;
    user_id: Types.ObjectId;
    content: string;
    likes: Types.ObjectId[];
    replies: IReply[];
    createdAt?: Date;
    updatedAt?: Date;
}
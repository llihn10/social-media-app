import { Schema, model } from 'mongoose'
import { IComment } from '../interfaces/comment.interface'

const ReplySchema = new Schema(
    {
        author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true,
        _id: true
    }
);

const CommentSchema = new Schema<IComment>(
    {
        post_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Post'
        },
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        content: {
            type: String,
            required: true
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        replies: [ReplySchema],
    },
    {
        timestamps: true,
    }
)

export const CommentModel = model<IComment>("Comment", CommentSchema, "comments")
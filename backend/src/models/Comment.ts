import { Schema, model } from 'mongoose'
import { IComment } from '../interfaces/comment.interface'

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
        comment: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
)

export const CommentModel = model<IComment>("Comment", CommentSchema, "comments")
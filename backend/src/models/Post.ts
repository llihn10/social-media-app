import { Schema, model } from 'mongoose'
import { IPost } from '../interfaces/post.interface'

const PostSchema = new Schema<IPost>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        content: {
            type: String,
            required: true
        },
        media: {
            type: [String],
            default: []
        },
        likes_count: {
            type: Number,
            default: 0,
            min: 0
        },
        comments_count: {
            type: Number,
            default: 0,
            min: 0
        },
    },
    {
        timestamps: true,
    }
)

export const PostModel = model<IPost>("Post", PostSchema, "posts")
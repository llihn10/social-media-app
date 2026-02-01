import { Schema, model } from 'mongoose'
import { ILike } from '../interfaces/like.interface'

const LikeSchema = new Schema<ILike>(
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
        }
    },
    {
        timestamps: true,
    }
)

export const LikeModel = model<ILike>("Like", LikeSchema, "likes")
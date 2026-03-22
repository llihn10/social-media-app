import { Schema, model } from 'mongoose'
import { ILike } from '../interfaces/like.interface'
import { NotificationModel } from './Notification';

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

LikeSchema.pre('findOneAndDelete', async function () {
    try {
        const like = await this.model.findOne(this.getQuery());

        if (like) {
            await NotificationModel.deleteMany({ post: like.post_id });
            await NotificationModel.deleteMany({ type: 'LIKE_POST', post: like.post_id });
        }
    } catch (error: any) {
        throw error
    }
});

export const LikeModel = model<ILike>("Like", LikeSchema, "likes")
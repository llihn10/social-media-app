import { Schema, model } from 'mongoose'
import { IFollow } from '../interfaces/follow.interface'
import { NotificationModel } from './Notification';

const FollowSchema = new Schema<IFollow>(
    {
        follower: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        following: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    {
        timestamps: true,
    }
)

FollowSchema.pre('findOneAndDelete', async function () {
    try {
        const follow = await this.model.findOne(this.getQuery());

        if (follow) {
            await NotificationModel.deleteMany({
                type: 'FOLLOW',
                sender: follow.follower,
                receiver: follow.following
            });
        }
    } catch (error: any) {
        throw error
    }
});

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
export const FollowModel = model<IFollow>("Follow", FollowSchema, "follows")
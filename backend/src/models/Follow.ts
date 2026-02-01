import { Schema, model } from 'mongoose'
import { IFollow } from '../interfaces/follow.interface'

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

export const FollowModel = model<IFollow>("Follow", FollowSchema, "follows")
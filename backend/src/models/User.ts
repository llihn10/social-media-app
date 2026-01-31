import { Schema, model } from 'mongoose'
import { IUser } from '../interfaces/user.interface'

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        profile_picture: String,
        bio: String,
        follower_count: {
            type: Number,
            default: 0,
            min: 0
        },
        following_count: {
            type: Number,
            default: 0,
            min: 0
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        }
    },
    {
        timestamps: true,
    }
)

export const UserModel = model<IUser>("User", UserSchema, "users")
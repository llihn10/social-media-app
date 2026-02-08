import { Schema, model } from 'mongoose'
import { IUser } from '../interfaces/user.interface'
import bcrypt from 'bcryptjs'

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
        followers_count: {
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

UserSchema.pre('save', async function (this: IUser) {
    if (!this.isModified('password')) return

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

export const UserModel = model<IUser>("User", UserSchema, "users")
import { Document } from 'mongoose'

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    profile_picture?: string;
    bio?: string;
    followers_count: number;
    following_count: number;
    role: "user" | "admin"
    createdAt?: Date;
    updatedAt?: Date;
}
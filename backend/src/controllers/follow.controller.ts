import { Request, Response } from "express";
import { AuthRequest } from '../middlewares/auth.middleware'
import { UserModel } from '../models/User'
import { FollowModel } from "../models/Follow"

export const toggleFollow = async (req: any, res: Response) => {
    const targetUserId: string = req.params.id
    const userId = req.user!.id
    try {
        const existingFollow = await FollowModel.findOne({
            follower: userId,
            following: targetUserId
        })

        if (existingFollow) {
            // unfollow
            await FollowModel.findByIdAndDelete(existingFollow._id)
            await UserModel.findByIdAndUpdate(userId, { $inc: { following_count: -1 } })
            await UserModel.findByIdAndUpdate(targetUserId, { $inc: { followers_count: -1 } })
            return res.status(200).json({ followed: false })
        } else {
            // follow
            await FollowModel.create({ follower: userId, following: targetUserId })
            await UserModel.findByIdAndUpdate(userId, { $inc: { following_count: 1 } })
            await UserModel.findByIdAndUpdate(targetUserId, { $inc: { followers_count: 1 } })
            return res.status(200).json({ followed: true })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
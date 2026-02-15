import { Request, Response } from "express"
import { UserModel } from "../models/User"
import { AuthRequest } from "../middlewares/auth.middleware"
import { FollowModel } from "../models/Follow"
import mongoose from "mongoose"

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id

        const user = await UserModel.findById(userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json({ data: user })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getUserProfile = async (req: any, res: Response) => {
    try {
        const viewerId = req.user?.id

        const { id: userId } = req.params

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' })
        }

        const user = await UserModel
            .findById(userId)
            .select('_id username email profile_picture bio followers_count following_count createdAt is_followed')
            .lean()

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        let is_followed = false
        if (viewerId) {
            is_followed = !!(await FollowModel.exists({
                follower: viewerId,
                following: userId
            }))
        }

        res.status(200).json({
            data: {
                ...user,
                is_followed
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
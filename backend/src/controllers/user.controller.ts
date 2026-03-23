import { Request, Response } from "express"
import { UserModel } from "../models/User"
import { AuthRequest } from "../middlewares/auth.middleware"
import { FollowModel } from "../models/Follow"
import mongoose from "mongoose"
import { cloudinary } from "../configs/cloudinary"
import * as streamifier from 'streamifier'
import { isValidUsername } from "../utils/validator"

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

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id

        const { username, bio } = req.body
        const profile_picture = req.file as Express.Multer.File | undefined

        const user = await UserModel.findById(userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        user.username = username
        user.bio = bio

        if (profile_picture) {
            const uploadResult = await new Promise<any>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'avatars',
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result)
                    }
                )

                streamifier.createReadStream(profile_picture.buffer).pipe(stream)
            })

            user.profile_picture = uploadResult.secure_url
        }

        await user.save()

        res.status(200).json({ data: user })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const checkUsernameExist = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id
        const { username } = req.query
        const normalizedUsername = username.toLowerCase().trim()

        if (!isValidUsername(normalizedUsername)) {
            return res.status(400).json({
                message: 'Username must be 3-30 characters and only contain letters, numbers, underscores, or dots.'
            })
        }

        const user = await UserModel.findOne({
            username: normalizedUsername,
            _id: { $ne: userId }
        })

        if (user) {
            return res.status(400).json({ message: 'Username already exists' })
        }

        res.status(200).json({ message: 'Username is available' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
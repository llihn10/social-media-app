import { Request, Response } from 'express'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'
import { FollowModel } from '../models/Follow'

export const searchAll = async (req: Request, res: Response) => {
    try {
        const { searchQuery } = req.query
        const currentUserId = (req as any).user?.id;

        if (!searchQuery || typeof searchQuery !== 'string') {
            return res.status(400).json({ message: 'Missing search query' })
        }

        // search users
        const users = await UserModel.find({
            username: { $regex: searchQuery, $options: 'i' }
        })
            .select('username profile_picture')
            .limit(20)
            .lean()

        let usersWithFollowState = users;
        if (currentUserId) {
            usersWithFollowState = await Promise.all(
                users.map(async (u) => {
                    if (u._id.toString() === currentUserId) return { ...u, is_followed: false };
                    const followCount = await FollowModel.countDocuments({
                        follower: currentUserId,
                        following: u._id
                    });
                    return { ...u, is_followed: followCount > 0 };
                })
            ) as any;
        }

        const matchedUserIds = users.map(u => u._id);

        // search posts
        const posts = await PostModel.find({
            $or: [
                { content: { $regex: searchQuery, $options: 'i' } },
                { author: { $in: matchedUserIds } }
            ]
        })
            .populate('author', 'username profile_picture')
            .sort({ createdAt: -1 })
            .limit(30)
            .lean()

        res.json({
            success: true,
            data: {
                users: usersWithFollowState,
                posts
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
import { Response } from "express"
import { UserModel } from "../models/User"
import { PostModel } from "../models/Post"
import { CommentModel } from "../models/Comment"

export const getAdminStats = async (req: any, res: Response) => {
    try {
        const [totalUsers, totalPosts, totalComments] = await Promise.all([
            UserModel.countDocuments(),
            PostModel.countDocuments(),
            CommentModel.countDocuments(),
        ])

        // User growth in the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const userGrowth = await UserModel.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        // Trending posts (most likes + comments)
        const trendingPosts = await PostModel.find()
            .sort({ likes_count: -1, comments_count: -1 })
            .limit(5)
            .populate('author', 'username')
            .lean()

        res.status(200).json({
            success: true,
            summary: { totalUsers, totalPosts, totalComments },
            userGrowthCount: userGrowth.length,
            userGrowth,
            trendingPosts
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
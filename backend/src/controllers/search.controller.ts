import { Request, Response } from 'express'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'
import { CommentModel } from '../models/Comment'

export const searchAll = async (req: Request, res: Response) => {
    try {
        const { searchQuery } = req.query

        if (!searchQuery || typeof searchQuery !== 'string') {
            return res.status(400).json({ message: 'Missing search query' })
        }

        // Search users
        const users = await UserModel.find({
            username: { $regex: searchQuery, $options: 'i' }
        })
            .select('username profile_picture')
            .limit(10)
            .lean()

        // Search posts
        const posts = await PostModel.find({
            content: { $regex: searchQuery, $options: 'i' }
        })
            .populate('author', 'username profile_picture')
            .sort({ created_at: -1 })
            .limit(30)
            .lean()

        res.json({
            success: true,
            data: {
                users, posts
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
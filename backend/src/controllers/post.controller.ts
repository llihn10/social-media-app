import { Request, Response } from 'express'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'
import { CommentModel } from '../models/Comment'

export const getPosts = async (req: Request, res: Response) => {
    const posts = await PostModel.find()
        .populate('author', 'username profile_picture')
        .sort({ createdAt: -1 })
        .limit(20)

    res.json({ success: true, data: posts })
}

export const getPostDetail = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        const post = await PostModel.findById(postId)
            .populate('author', 'username profile_picture')
            .lean()

        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        const comments = await CommentModel.find({ post_id: postId })
            .populate('user_id', 'username profile_picture')
            .sort({ createdAt: -1 })
            .lean()

        res.json({
            ...post,
            comments: comments.map((c) => ({
                _id: c._id,
                user: c.user_id,
                comment: c.comment,
                created_at: c.created_at,
            }))
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}
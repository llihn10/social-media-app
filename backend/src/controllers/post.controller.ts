import { Request, Response } from 'express'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'
import { CommentModel } from '../models/Comment'
import { AuthRequest } from '../middlewares/auth.middleware'
import { cloudinary } from '../configs/cloudinary'
import * as streamifier from 'streamifier'

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

export const getUserPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id

        const posts = await PostModel
            .find({ author: userId })
            .sort({ createdAt: -1 })
            .populate('author', 'username profile_picture')
            .lean()

        res.status(200).json({ data: posts })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

export const createNewPost = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id
        const { content } = req.body

        const files = req.files as Express.Multer.File[] | undefined

        let mediaUrls: string[] = []

        // uploaded files
        if (files && files.length > 0) {
            for (const file of files) {
                const uploadResult = await new Promise<any>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'posts' }, (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        }
                    )
                    streamifier.createReadStream(file.buffer).pipe(stream)
                })
                mediaUrls.push(uploadResult.secure_url)
            }
        }

        const newPost = await PostModel.create({
            content,
            media: mediaUrls,
            author: userId
        })

        res.status(201).json({
            message: 'Post created successfully',
            data: newPost
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}
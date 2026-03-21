import { Response } from 'express'
import { PostModel } from '../models/Post'
import { CommentModel } from '../models/Comment'
import { cloudinary } from '../configs/cloudinary'
import * as streamifier from 'streamifier'
import { FollowModel } from '../models/Follow'
import mongoose from 'mongoose'
import { LikeModel } from '../models/Like'

export const getPosts = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id

        const posts = await PostModel.find()
            .populate('author', '_id username profile_picture')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()

        const postIds = posts.map(post => post._id)

        const [follows, likes] = await Promise.all([
            FollowModel.find({ follower: userId }).select('following').lean(),
            LikeModel.find({ user_id: userId, post_id: { $in: postIds } }).select('post_id').lean()
        ])

        const followingIds = new Set(follows.map(f => f.following.toString()))
        const likedPostIds = new Set(likes.map(l => l.post_id.toString()))

        const formattedPosts = posts.map((post: any) => {
            const authorId = post.author?._id?.toString()

            return {
                ...post,
                is_followed: followingIds.has(authorId),
                is_liked: likedPostIds.has(post._id.toString())
            }
        })

        res.json({ success: true, data: formattedPosts })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getPostDetail = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id
        const { postId } = req.params

        const post = await PostModel.findById(postId)
            .populate('author', '_id username profile_picture')
            .lean()

        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        let is_followed = false
        let is_liked = false

        if (userId) {
            const authorId = post.author._id.toString()

            const [isFollowed, isLiked] = await Promise.all([
                FollowModel.exists({ follower: userId, following: authorId }),
                LikeModel.exists({ user_id: userId, post_id: { $in: postId } })
            ])

            is_followed = !!isFollowed
            is_liked = !!isLiked
        }

        const comments = await CommentModel.find({ post_id: postId })
            .populate('user_id', '_id username profile_picture')
            .populate({
                path: 'replies.author_id',
                select: '_id username profile_picture'
            })
            .populate({
                path: 'replies.likes',
                select: '_id username profile_picture'
            })
            .sort({ createdAt: -1 })
            .lean();

        const formattedComments = comments.map(c => ({
            _id: c._id,
            user: c.user_id,
            content: c.content,
            likes: (c.likes || []).map(id => id.toString()),
            likesCount: (c.likes || []).length,
            createdAt: c.createdAt,
            replies: (c.replies || []).map(r => ({
                _id: r._id,
                author: r.author_id,
                content: r.content,
                likes: (r.likes || []).map((like: any) => like._id ? like._id.toString() : like.toString()),
                likesCount: (r.likes || []).length,
                createdAt: r.createdAt
            }))
        }));

        res.json({
            ...post,
            comments: formattedComments,
            is_followed,
            is_liked
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getMyPost = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id

        const posts = await PostModel
            .find({ author: userId })
            .sort({ createdAt: -1 })
            .populate('author', 'username profile_picture')
            .lean()

        const postIds = posts.map(post => post._id)

        const likes = await LikeModel.find({ user_id: userId, post_id: { $in: postIds } }).select('post_id').lean()
        const likePostIds = new Set(likes.map(l => l.post_id.toString()))

        const formattedPosts = posts.map((post: any) => {
            return {
                ...post,
                is_liked: likePostIds.has(post._id.toString())
            }
        })

        res.status(200).json({ data: formattedPosts })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getUserPost = async (req: any, res: Response) => {
    try {
        const viewerId = req.user?.id

        const { id: userId } = req.params

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' })
        }

        const posts = await PostModel
            .find({ author: userId })
            .sort({ createdAt: -1 })
            .populate('author', 'username profile_picture')
            .lean()

        const postIds = posts.map(post => post._id)

        const likes = await LikeModel.find({ user_id: viewerId, post_id: { $in: postIds } }).select('post_id').lean()
        const likePostIds = new Set(likes.map(l => l.post_id.toString()))

        const formattedPosts = posts.map((post: any) => {
            return {
                ...post,
                is_liked: likePostIds.has(post._id.toString())
            }
        })

        res.status(200).json({ data: formattedPosts })
    } catch (error) {
        console.error(error)
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
                        {
                            folder: 'posts',
                            resource_type: 'auto'
                        },
                        (error, result) => {
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
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

// atlas
// export const deletePost = async (req: any, res: Response) => {
//     const session = await mongoose.startSession();

//     try {
//         session.startTransaction();

//         const userId = req.user!.id
//         const { postId } = req.params

//         const post = await PostModel.findById(postId).session(session)

//         if (!post) {
//             await session.abortTransaction()
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         if (post.author.toString() !== userId) {
//             await session.abortTransaction()
//             return res.status(403).json({ message: 'Not authorized' });
//         }

//         await CommentModel.deleteMany({ post_id: postId }).session(session)
//         await LikeModel.deleteMany({ post_id: postId }).session(session)
//         await PostModel.findByIdAndDelete(postId).session(session)

//         await session.commitTransaction()

//         res.status(200).json({
//             message: 'Delete post successfully'
//         })
//     } catch (error) {
//         await session.abortTransaction()
//         console.error(error)
//         res.status(500).json({ message: 'Server error' })
//     } finally {
//         session.endSession()
//     }
// }

export const deletePost = async (req: any, res: Response) => {
    try {

        const userId = req.user!.id
        const { postId } = req.params

        const post = await PostModel.findById(postId)

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await CommentModel.deleteMany({ post_id: postId })
        await LikeModel.deleteMany({ post_id: postId })
        await PostModel.findByIdAndDelete(postId)

        res.status(200).json({
            message: 'Delete post successfully'
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getFollowingPosts = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id

        const follows = await FollowModel.find({ follower: userId })
            .select('following')
            .lean()

        const followingIds = follows.map(f => f.following)

        const posts = await PostModel.find({ author: { $in: followingIds } })
            .populate('author', '_id username profile_picture')
            .sort({ createdAt: -1 })
            .lean()

        const postIds = posts.map(post => post._id)

        const likes = await LikeModel.find({ user_id: userId, post_id: { $in: postIds } }).select('post_id').lean()
        const likePostIds = new Set(likes.map(l => l.post_id.toString()))

        const formattedPosts = posts.map((post: any) => {
            return {
                ...post,
                is_liked: likePostIds.has(post._id.toString())
            }
        })

        res.status(200).json({ data: formattedPosts })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getLikedPosts = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id

        const likes = await LikeModel.find({ user_id: userId })
            .select('post_id')
            .lean()

        const postIds = likes.map(l => l.post_id)

        const posts = await PostModel.find({ _id: { $in: postIds } })
            .populate('author', '_id username profile_picture')
            .sort({ createdAt: -1 })
            .lean()

        const formattedPosts = posts.map((post: any) => {
            return {
                ...post,
                is_liked: true
            }
        })

        res.status(200).json({ data: formattedPosts })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
import { Request, Response } from 'express'
import { PostModel } from '../models/Post'
import { UserModel } from '../models/User'

export const getPosts = async (req: Request, res: Response) => {
    const posts = await PostModel.find()
        .populate('user_id', 'username profile_picture')
        .sort({ createdAt: -1 })
        .limit(20)

    res.json({ success: true, data: posts })
}
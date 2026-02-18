import { Response } from "express";
import { LikeModel } from "../models/Like";
import { PostModel } from "../models/Post";

export const toggleLikePost = async (req: any, res: Response) => {
    try {
        const { postId } = req.params
        const userId = req.user!.id

        const existingLike = await LikeModel.findOne({
            post_id: postId,
            user_id: userId
        })

        if (existingLike) {
            // unlike
            await LikeModel.findByIdAndDelete(existingLike._id)
            await PostModel.findByIdAndUpdate(postId, { $inc: { likes_count: -1 } })
            return res.status(200).json({ liked: false })
        } else {
            // like
            await LikeModel.create({ post_id: postId, user_id: userId })
            await PostModel.findByIdAndUpdate(postId, { $inc: { likes_count: 1 } })
            return res.status(200).json({ liked: true })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
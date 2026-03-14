import { Response } from "express";
import { CommentModel } from "../models/Comment";
import { PostModel } from "../models/Post";

export const createComment = async (req: any, res: Response) => {
    try {
        const { postId } = req.params
        const { content } = req.body
        const userId = req.user!.id

        if (!content) {
            return res.status(400).json({ message: "Content is required" })
        }

        const comment = await CommentModel.create({
            comment: content,
            user_id: userId,
            post_id: postId
        })

        await PostModel.findByIdAndUpdate(postId, { $inc: { comments_count: 1 } })

        res.status(201).json({ message: "Comment created successfully", comment })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
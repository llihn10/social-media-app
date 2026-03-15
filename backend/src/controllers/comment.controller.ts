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

export const deleteComment = async (req: any, res: Response) => {
    try {
        const { commentId } = req.params
        const userId = req.user!.id

        const comment = await CommentModel.findById(commentId)

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        if (comment.user_id !== userId) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        await CommentModel.findByIdAndDelete(commentId)
        await PostModel.findByIdAndUpdate(comment.post_id, { $inc: { comments_count: -1 } })

        res.status(200).json({ message: "Comment deleted successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
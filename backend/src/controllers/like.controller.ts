import { Response } from "express";
import { LikeModel } from "../models/Like";
import { PostModel } from "../models/Post";
import { sendNotificationToUser } from "../configs/socket";
import { NotificationModel } from "../models/Notification";

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

            const post = await PostModel.findById(postId)

            if (post && post.author.toString() !== userId) {
                const newNotif = await NotificationModel.create({
                    receiver: post.author,
                    sender: userId,
                    type: 'LIKE_POST',
                    post: postId,
                    isRead: false
                });

                const populatedNotif = await NotificationModel.findById(newNotif._id)
                    .populate('sender', 'username profile_picture');

                if (populatedNotif) {
                    sendNotificationToUser(post.author.toString(), {
                        receiver: post.author.toString(),
                        sender: userId,
                        senderName: (populatedNotif.sender as any).username,
                        senderAvatar: (populatedNotif.sender as any).profile_picture,
                        type: 'LIKE_POST',
                        post: postId,
                        message: 'liked your post'
                    })
                }
            }

            return res.status(200).json({ liked: true })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
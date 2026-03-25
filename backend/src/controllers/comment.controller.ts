import { Response } from "express";
import { CommentModel } from "../models/Comment";
import { PostModel } from "../models/Post";
import { IReply } from "../interfaces/comment.interface";
import { Types } from "mongoose";
import { sendNotificationToUser } from "../configs/socket";
import { NotificationModel } from "../models/Notification";

export const createComment = async (req: any, res: Response) => {
    try {
        const { postId } = req.params
        const { content } = req.body
        const userId = req.user!.id

        if (!content) {
            return res.status(400).json({ message: "Content is required" })
        }

        const comment = await CommentModel.create({
            content: content,
            user_id: userId,
            post_id: postId
        })

        await PostModel.findByIdAndUpdate(postId, { $inc: { comments_count: 1 } })

        const post = await PostModel.findById(postId);
        if (post && post.author.toString() !== userId) {
            const newNotif = await NotificationModel.create({
                receiver: post.author,
                sender: userId,
                type: 'COMMENT_POST',
                post: postId,
                comment: comment._id,
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
                    type: 'COMMENT_POST',
                    post: postId,
                    comment: comment._id.toString(),
                    message: 'commented on your post'
                })
            }
        }

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

        if (comment.user_id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const amountToDecrement = 1 + (comment.replies ? comment.replies.length : 0)

        await CommentModel.findByIdAndDelete(commentId)
        await PostModel.findByIdAndUpdate(comment.post_id, { $inc: { comments_count: -amountToDecrement } })

        res.status(200).json({ message: "Comment deleted successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const likeComment = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id;
        const { commentId } = req.params;

        const comment = await CommentModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const likeIndex = comment.likes.findIndex(id => id.toString() === userId);

        if (likeIndex === -1) {
            comment.likes.push(userId);
            if (comment.user_id.toString() !== userId) {
                const newNotif = await NotificationModel.create({
                    receiver: comment.user_id,
                    sender: userId,
                    type: 'LIKE_COMMENT',
                    comment: commentId,
                    post: comment.post_id,
                    isRead: false
                });

                const populatedNotif = await NotificationModel.findById(newNotif._id)
                    .populate('sender', 'username profile_picture')

                if (populatedNotif) {
                    sendNotificationToUser(comment.user_id.toString(), {
                        receiver: comment.user_id.toString(),
                        sender: userId,
                        senderName: (populatedNotif.sender as any).username,
                        senderAvatar: (populatedNotif.sender as any).profile_picture,
                        type: 'LIKE_COMMENT',
                        comment: commentId,
                        post: comment.post_id?.toString(),
                        message: 'liked your comment'
                    })
                }
            }
        } else {
            comment.likes.splice(likeIndex, 1);

            await NotificationModel.findOneAndDelete({
                sender: userId,
                comment: commentId,
                type: 'LIKE_COMMENT'
            });
        }

        await comment.save();

        res.json({ message: 'Comment like updated', likesCount: comment.likes.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const replyComment = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id
        const { commentId } = req.params
        const { content } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Reply content is required' });
        }

        const comment = await CommentModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const reply: IReply = {
            author_id: userId,
            content,
            likes: [] as Types.ObjectId[],
        };

        comment.replies.push(reply);

        await comment.save();

        await PostModel.findByIdAndUpdate(comment.post_id, { $inc: { comments_count: 1 } })

        if (comment.user_id.toString() !== userId) {
            const newNotif = await NotificationModel.create({
                receiver: comment.user_id,
                sender: userId,
                type: 'REPLY_COMMENT',
                comment: commentId,
                post: comment.post_id,
                reply: reply._id,
                isRead: false
            });

            const populatedNotif = await NotificationModel.findById(newNotif._id)
                .populate('sender', 'username profile_picture');

            if (populatedNotif) {
                sendNotificationToUser(comment.user_id.toString(), {
                    receiver: comment.user_id.toString(),
                    sender: userId,
                    senderName: (populatedNotif.sender as any).username,
                    senderAvatar: (populatedNotif.sender as any).profile_picture,
                    type: 'REPLY_COMMENT',
                    comment: commentId,
                    post: comment.post_id?.toString(),
                    message: 'replied to your comment'
                })
            }
        }

        res.status(201).json({ message: 'Reply added successfully', reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteReply = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id;
        const { commentId, replyId } = req.params;

        const comment = await CommentModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const reply = comment.replies.find(
            r => r._id?.toString() === replyId
        );

        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        if (reply.author_id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this reply' });
        }

        await NotificationModel.deleteMany({ reply: replyId });

        (reply as any).deleteOne();
        await comment.save();

        await PostModel.findByIdAndUpdate(comment.post_id, { $inc: { comments_count: -1 } })

        return res.json({
            message: 'Reply deleted successfully'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const likeReply = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id;
        const { commentId, replyId } = req.params;

        const comment = await CommentModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const reply = comment.replies.find(
            r => r._id?.toString() === replyId
        );

        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        const likeIndex = reply.likes.findIndex(id => id.toString() === userId);

        if (likeIndex === -1) {
            reply.likes.push(userId);
            if (reply.author_id.toString() !== userId) {
                const newNotif = await NotificationModel.create({
                    receiver: reply.author_id,
                    sender: userId,
                    type: 'LIKE_REPLY',
                    comment: commentId,
                    reply: replyId,
                    post: comment.post_id,
                    isRead: false
                });

                const populatedNotif = await NotificationModel.findById(newNotif._id)
                    .populate('sender', 'username profile_picture');

                if (populatedNotif) {
                    sendNotificationToUser(reply.author_id.toString(), {
                        receiver: reply.author_id.toString(),
                        sender: userId,
                        senderName: (populatedNotif.sender as any).username,
                        senderAvatar: (populatedNotif.sender as any).profile_picture,
                        type: 'LIKE_REPLY',
                        comment: commentId,
                        reply: replyId,
                        post: comment.post_id?.toString(),
                        message: 'liked your reply'
                    })
                }
            }
        } else {
            reply.likes.splice(likeIndex, 1);

            await NotificationModel.findOneAndDelete({
                sender: userId,
                comment: commentId,
                reply: replyId,
                type: 'LIKE_REPLY'
            });
        }

        await comment.save();

        res.json({ message: 'Reply like updated', likesCount: reply.likes.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
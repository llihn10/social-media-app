import { Response } from "express";
import { sendChatMessageToUser } from "../configs/socket";
import { ConversationModel } from "../models/Conversation";
import { MessageModel } from "../models/Message";
import { isMutualFollow } from "../utils/checkMutual";

export const getInbox = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id

        const conversations = await ConversationModel.find({ participants: userId })
            .populate('participants', 'username profile_picture')
            .populate({
                path: 'lastMessage',
                select: 'content sender createdAt',
            })
            .sort({ updatedAt: -1 });

        // check mutual follow status for each conversation
        const conversationsWithMutual = await Promise.all(
            conversations.map(async (conv) => {
                const otherUser = conv.participants.find(
                    (p: any) => p._id.toString() !== userId
                );
                const mutual = otherUser
                    ? await isMutualFollow(userId, otherUser._id.toString())
                    : false;
                return { ...conv.toObject(), isMutual: mutual };
            })
        );

        res.status(200).json(conversationsWithMutual)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getMessages = async (req: any, res: Response) => {
    try {
        const { conversationId } = req.params
        const { limit = 20, skip = 0 } = req.query

        const messages = await MessageModel.find({ conversation_id: conversationId })
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .populate('sender', 'username profile_picture');

        res.status(200).json(messages)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const accessConversation = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id
        const { targetUserId } = req.body

        if (!targetUserId) {
            return res.status(400).json({ message: "Target User ID is required" })
        }

        const canChat = await isMutualFollow(userId, targetUserId)
        if (!canChat) {
            return res.status(403).json({
                message: "You can only chat with people who follow you back"
            })
        }

        let conversation = await ConversationModel.findOne({
            participants: { $all: [userId, targetUserId] }
        }).populate('participants', 'username profile_picture')

        if (conversation) {
            return res.status(200).json(conversation);
        }

        const newConversation = await ConversationModel.create({
            participants: [userId, targetUserId]
        })

        const populatedConversation = await ConversationModel.findById(newConversation._id)
            .populate('participants', 'username profile_picture')

        return res.status(200).json(populatedConversation)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const sendMessage = async (req: any, res: Response) => {
    try {
        const senderId = req.user!.id
        const { conversationId, content, receiverId } = req.body

        if (!content || !conversationId || !receiverId) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        const canChat = await isMutualFollow(senderId, receiverId)
        if (!canChat) {
            return res.status(403).json({
                message: "You can only chat with people who follow you back"
            })
        }

        const newMessage = await MessageModel.create({
            conversation_id: conversationId,
            sender: senderId,
            content
        })

        await ConversationModel.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id,
            updatedAt: new Date()
        })

        const populatedMessage = await MessageModel.findById(newMessage._id)
            .populate('sender', 'username profile_picture')

        sendChatMessageToUser(receiverId, populatedMessage)

        return res.status(200).json(populatedMessage)

    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
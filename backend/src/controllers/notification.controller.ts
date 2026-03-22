import { Response } from 'express';
import { NotificationModel } from '../models/Notification';

export const getNotifications = async (req: any, res: Response) => {
    try {
        const notifications = await NotificationModel.find({ receiver: req.user.id })
            .populate('sender', 'username profile_picture')
            .sort({ createdAt: -1 })
            .limit(30);
        res.status(200).json(notifications);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
};

export const getUnreadCount = async (req: any, res: Response) => {
    try {
        const count = await NotificationModel.countDocuments({ receiver: req.user.id, isRead: false });
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
};

export const markAllAsRead = async (req: any, res: Response) => {
    try {
        await NotificationModel.updateMany(
            { receiver: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'Updated' });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
};
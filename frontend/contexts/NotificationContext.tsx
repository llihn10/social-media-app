import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { authFetch } from '@/services/authFetch';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface NotifContextType {
    unreadCount: number;
    fetchUnreadCount: () => void;
    markAsReadLocal: () => void;
}

const NotificationContext = createContext<NotifContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, token, logout } = useAuth();
    const { socket } = useSocket();

    const fetchUnreadCount = async () => {
        if (!token) return;
        try {
            const res = await authFetch(`${API_URL}/notifications/unread`, {
                method: 'GET',
            },
                token,
                logout
            );
            if (!res) return;
            const data = await res.json();
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error(error);
        }
    };

    const markAsReadLocal = () => setUnreadCount(0);

    // Get the number of notifications when the app starts
    useEffect(() => {
        fetchUnreadCount();
    }, [user]);

    // Listen to socket: When there is a new notification -> Increase the count by 1
    useEffect(() => {
        if (!socket) return;
        socket.on('newNotification', () => {
            setUnreadCount(prev => prev + 1);
        });
        return () => { socket.off('newNotification'); };
    }, [socket]);

    return (
        <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount, markAsReadLocal }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext)!;
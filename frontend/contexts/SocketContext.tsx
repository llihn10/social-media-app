import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface SocketContextData {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextData>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user?._id) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(API_URL);

        newSocket.on('connect', () => {
            // console.log('Socket connected:', newSocket.id);
            newSocket.emit('register', user._id);
        });

        // listen notification from backend
        newSocket.on('newNotification', (data) => {
            // console.log('Receive new notification:', data);

            Toast.show({
                type: 'interaction',
                text1: data.senderName,
                text2: data.message,
                topOffset: 60,
                props: {
                    senderAvatar: data.senderAvatar,
                    type: data.type
                },
                onPress: () => {
                    router.push({ pathname: '/post/[id]', params: { id: data.post } });
                    Toast.hide();
                }
            });
        });

        setSocket(newSocket);

        // cleanup when component unmount
        return () => {
            newSocket.disconnect();
        };
    }, [user?._id]); // run effect if user changes (login/logout)

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer;

// using Map to store online users: key is userId, value is socketId
const onlineUsers: Map<string, string> = new Map();

export interface INotificationData {
    receiver: string;
    sender: string;
    senderName?: string;
    senderAvatar?: string;
    type: 'LIKE_POST' | 'LIKE_COMMENT' | 'REPLY_COMMENT' | 'FOLLOW' | 'COMMENT_POST' | 'LIKE_REPLY';
    post?: string;
    comment?: string;
    reply?: string;
    message: string;
    [key: string]: any;
}

export const initSocket = (server: HttpServer): void => {
    // initialize server socket with SocketIOServer type
    io = new SocketIOServer(server, {
        cors: { origin: "*" },
    });

    io.on("connection", (socket: Socket) => {
        console.log("A user connected:", socket.id);

        // listen event when user login/open app send userId
        socket.on("register", (userId: string) => {
            onlineUsers.set(String(userId), socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });

        socket.on("disconnect", () => {
            // remove user from Map when they turn off app/lose connection
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });
    });
};

export const sendNotificationToUser = (targetUserId: string | undefined, notificationData: INotificationData): void => {
    if (!targetUserId) return;

    const socketId = onlineUsers.get(String(targetUserId));
    if (socketId && io) {
        // send event 'newNotification' to target user
        io.to(socketId).emit("newNotification", notificationData);
    }
};
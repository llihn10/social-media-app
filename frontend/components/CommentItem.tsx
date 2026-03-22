import { Heart, MessagesSquare } from "lucide-react-native";
import { View, Text, Image, Pressable, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/services/authFetch";
import defaultAvatar from '@/assets/images/profile.png'

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const timeAgo = (createdAt: string) => {
    if (!createdAt) return "";
    const now = new Date();
    const created = new Date(createdAt);

    const diffMs = now.getTime() - created.getTime();
    if (diffMs < 0) return "Just now";

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    const day = created.getDate();
    const month = created.getMonth() + 1;
    const year = created.getFullYear();
    const currentYear = now.getFullYear();

    if (year === currentYear) {
        return `${day}/${month}`;
    }

    return `${day}/${month}/${year.toString().slice(-2)}`;
};

function ReplyItem({ reply, commentId, onRefresh }: any) {
    const { user, token, logout } = useAuth();

    const currentUserId = user?._id;

    const [isLiked, setIsLiked] = useState(() =>
        reply.likes?.includes(currentUserId) ?? false
    );

    const [likesCount, setLikesCount] = useState(() =>
        reply.likesCount ?? 0
    );

    useEffect(() => {
        setIsLiked(reply.likes?.includes(currentUserId) ?? false);
    }, [reply.likes, currentUserId]);

    useEffect(() => {
        if (reply.likesCount !== undefined) {
            setLikesCount(reply.likesCount);
        }
    }, [reply.likesCount]);

    const handleLikeReply = async () => {
        const previousIsLiked = isLiked;
        const previousCount = likesCount;

        setIsLiked(!previousIsLiked);
        setLikesCount(previousIsLiked ? previousCount - 1 : previousCount + 1);

        try {
            const res = await authFetch(`${API_URL}/comment/${commentId}/replies/${reply._id}/like`, {
                method: 'POST'
            }, token, logout);

            if (!res.ok) {
                // revert
                setIsLiked(previousIsLiked);
                setLikesCount(previousCount);
            }
        } catch (e) {
            setIsLiked(previousIsLiked);
            setLikesCount(previousCount);
        }
    };

    return (
        <View className="flex-row mb-3 mt-3">
            <Image
                source={
                    reply.author.profile_picture &&
                        reply.author.profile_picture.trim() !== ''
                        ? { uri: reply.author.profile_picture }
                        : defaultAvatar
                }
                className='w-11 h-11 rounded-full mt-1'
            />
            <View className='ml-3 flex-1'>
                <View className='flex-row items-baseline'>
                    <Text className='text-base font-semibold text-dark-100'>
                        {reply.author?.username || 'User'}
                    </Text>
                    <Text className='ml-1 text-sm font-normal text-dark-200'> {timeAgo(reply.createdAt)}</Text>
                </View>

                <Text className='text-base text-dark-100 mt-1'>
                    {reply.content}
                </Text>

                <View className='flex-row items-center mt-2'>
                    <Pressable onPress={handleLikeReply} className="flex-row items-center gap-2 p-1 -m-1">
                        <Heart size={16} color={isLiked ? '#F43F5E' : '#6B7280'} fill={isLiked ? '#F43F5E' : 'none'} />
                        {likesCount > 0 && (
                            <Text className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                                {likesCount}
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

export default function CommentItem({ comment, onRefresh, activeReplyCommentId, setActiveReplyCommentId }: any) {
    const { user, token, logout } = useAuth();

    const currentUserId = user?._id;

    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isReplying = activeReplyCommentId === comment._id;

    useEffect(() => {
        if (!comment) return;

        setIsLiked(comment.likes?.includes(currentUserId) ?? false);
        setLikesCount(comment.likesCount ?? 0);
    }, [comment, currentUserId]);

    const handleLikeComment = async () => {
        const prevLiked = isLiked;
        const prevCount = likesCount;

        setIsLiked(!prevLiked);
        setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

        try {
            const res = await authFetch(`${API_URL}/comment/${comment._id}/like`, {
                method: 'POST'
            }, token, logout);

            if (!res.ok) {
                setIsLiked(prevLiked);
                setLikesCount(prevCount);
            }
        } catch (e) {
            setIsLiked(prevLiked);
            setLikesCount(prevCount);
        }
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await authFetch(`${API_URL}/comment/${comment._id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: replyContent.trim() })
            }, token, logout);

            if (res.ok) {
                setReplyContent('');
                setActiveReplyCommentId(null);
                onRefresh?.();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const replies = comment?.replies || [];

    return (
        <View className="px-3 py-4 border-t border-gray-100">
            <View className="flex-row">
                {/* <Image source={{ uri: comment.user?.profile_picture }}
                    className='w-12 h-12 rounded-full'
                /> */}

                <Image
                    source={
                        comment.user.profile_picture &&
                            comment.user.profile_picture.trim() !== ''
                            ? { uri: comment.user.profile_picture }
                            : defaultAvatar
                    }
                    className='w-12 h-12 rounded-full mt-1'
                />

                <View className='px-3 flex-1'>
                    <View className='flex-row items-baseline'>
                        <Text className='text-base font-semibold text-dark-100'>
                            {comment.user?.username}
                        </Text>
                        <Text className='ml-1 text-sm font-normal text-dark-200'> {timeAgo(comment.createdAt)}</Text>
                    </View>

                    <Text className='text-base text-dark-100 mt-1'>
                        {comment.content}
                    </Text>

                    <View className='flex-row items-baseline mt-2 pb-3 gap-3'>
                        <Pressable onPress={handleLikeComment} className="flex-row items-center gap-2">
                            <Heart
                                size={18}
                                color={isLiked ? '#F43F5E' : '#6B7280'}
                                fill={isLiked ? '#F43F5E' : 'none'}
                            />
                            {likesCount > 0 && (
                                <Text className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>{likesCount}</Text>
                            )}
                        </Pressable>

                        <Pressable onPress={() => {
                            setActiveReplyCommentId(
                                isReplying ? null : comment._id
                            );
                        }}
                            className="flex-row items-center gap-2 ml-5"
                        >
                            <MessagesSquare
                                size={17}
                                color={'#6B7280'}
                                fill='none'
                            />
                        </Pressable>
                    </View>

                    {/* Reply Input */}
                    {isReplying && (
                        <View className="mt-2 mb-3 flex-row items-end">
                            <TextInput
                                className="flex-1 rounded-3xl px-5 py-4 text-base text-gray-900 border border-gray-200"
                                style={{ textAlignVertical: 'center' }}
                                placeholder="Write a reply..."
                                placeholderTextColor="#9CA3AF"
                                value={replyContent}
                                onChangeText={setReplyContent}
                                multiline
                                maxLength={200}
                                autoFocus={true}
                            />
                            <TouchableOpacity
                                className={`ml-2 mb-0.5 rounded-full items-center justify-center h-10 w-10 ${(!replyContent.trim() || isReplying) ? 'bg-gray-200' : 'bg-[#7B4A2E]'}`}
                                onPress={handleReplySubmit}
                                disabled={!replyContent.trim() || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text className={`font-semibold text-sm ${(!replyContent.trim() || isReplying) ? 'text-gray-400' : 'text-white'}`}>Post</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* ===== REPLIES ===== */}
            {replies.length > 0 && (
                <View className="ml-6 mt-3 pl-5 relative">
                    <View
                        style={{
                            position: 'absolute',
                            left: 1,
                            top: 0,
                            bottom: 0,
                            width: 1.5,
                            backgroundColor: '#E5E7EB',
                        }}
                    />
                    {replies.map((reply: any, index: number) => (
                        <ReplyItem key={index} reply={reply} commentId={comment._id} onRefresh={onRefresh} />
                    ))}
                </View>
            )}
        </View>

    );
}
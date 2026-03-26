import { Heart, MessagesSquare, MoreHorizontal, Send } from "lucide-react-native";
import { View, Text, Image, Pressable, TextInput, TouchableOpacity, ActivityIndicator, Modal, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/services/authFetch";
import defaultAvatar from '@/assets/images/profile.png'
import { API_URL } from "@/config/api";

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

    const isOwnReply = user?._id?.toString() === reply.author?._id?.toString();
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [modalVisible, setModalVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

            if (!res) return

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

    const handleDeleteReply = async () => {
        try {
            setDeleting(true);
            const res = await authFetch(
                `${API_URL}/comment/${commentId}/replies/${reply._id}`,
                { method: 'DELETE' },
                token,
                logout
            );
            if (!res) return
            if (res.ok) {
                setModalVisible(false);
                onRefresh?.();
            } else {
                const data = await res.json();
                Alert.alert('Error', data.message || 'Delete failed');
            }
        } catch (err) {
            // console.error(err);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <View className="flex-row mb-3 mt-3">
                <Image
                    source={
                        reply.author.profile_picture &&
                            reply.author.profile_picture.trim() !== ''
                            ? { uri: reply.author.profile_picture }
                            : defaultAvatar
                    }
                    className='w-11 h-11 rounded-full mt-1 bg-gray-100'
                />
                <View className='ml-3 flex-1 relative'>
                    <View className='flex-row items-baseline'>
                        <Text className='text-base font-semibold text-dark-100'>
                            {reply.author?.username || 'User'}
                        </Text>
                        <Text className='ml-1 text-sm font-normal text-dark-200'> {timeAgo(reply.createdAt)}</Text>

                        {isOwnReply && (
                            <TouchableOpacity
                                onPress={(event) => {
                                    const { pageX, pageY } = event.nativeEvent;
                                    setMenuPosition({ x: pageX, y: pageY });
                                    setMenuVisible(true);
                                }}
                                style={{ position: 'absolute', right: 9, top: -5 }}
                                className="p-2 rounded-full active:bg-gray-100"
                            >
                                <MoreHorizontal size={20} color="#374151" />
                            </TouchableOpacity>
                        )}
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

            {/* Options modal */}
            <Modal
                transparent
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-gray/30"
                    onPress={() => setMenuVisible(false)}
                >
                    <View
                        style={{
                            position: 'absolute',
                            top: menuPosition.y + 20,
                            right: 30,
                        }}
                        className="bg-white rounded-xl shadow-md w-40"
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setMenuVisible(false);
                                setModalVisible(true);
                            }}
                            className="px-4 py-3"
                        >
                            <Text className="text-red-500 font-medium">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Confirm delete modal */}
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/40 px-6">
                    <View className="bg-white w-full rounded-2xl p-6">
                        <Text className="text-lg font-bold text-gray-900 mb-2">
                            Delete Comment
                        </Text>

                        <Text className="text-gray-500 mb-6">
                            Are you sure you want to delete this comment?
                        </Text>

                        <View className="flex-row justify-end space-x-3 gap-2">
                            {/* Cancel */}
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200"
                            >
                                <Text className="text-gray-700 font-medium">Cancel</Text>
                            </TouchableOpacity>

                            {/* Delete */}
                            <TouchableOpacity
                                onPress={handleDeleteReply}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg bg-red-500"
                            >
                                {deleting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white font-medium">Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
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

    const isOwnComment = user?._id.toString() === comment.user?._id.toString()
    const [modalVisible, setModalVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

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
            if (!res) return
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
            if (!res) return
            if (res.ok) {
                setReplyContent('');
                setActiveReplyCommentId(null);
                onRefresh?.();
            }
        } catch (e) {
            // console.error(e);
            Alert.alert('Error', 'Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async () => {
        try {
            setDeleting(true);

            const res = await authFetch(
                `${API_URL}/comment/${comment._id}`,
                { method: 'DELETE' },
                token,
                logout
            );
            if (!res) return
            if (res.ok) {
                setModalVisible(false);
                onRefresh?.();
            } else {
                const data = await res.json();
                Alert.alert('Error', data.message || 'Delete failed');
            }
        } catch (err) {
            // console.error(err);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setDeleting(false);
        }
    };

    const replies = comment?.replies || [];

    return (
        <>
            <View className="px-3 py-4 border-t border-gray-100">
                <View className="flex-row">
                    <Image
                        source={
                            comment.user.profile_picture &&
                                comment.user.profile_picture.trim() !== ''
                                ? { uri: comment.user.profile_picture }
                                : defaultAvatar
                        }
                        className='w-12 h-12 rounded-full mt-1 bg-gray-100'
                    />

                    <View className='px-3 flex-1 relative'>
                        <View className='flex-row items-baseline'>
                            <Text className='text-base font-semibold text-dark-100'>
                                {comment.user?.username}
                            </Text>
                            <Text className='ml-1 text-sm font-normal text-dark-200'>
                                {timeAgo(comment.createdAt)}
                            </Text>

                            {/* <View className="flex-1" /> */}

                            {isOwnComment && (
                                <TouchableOpacity
                                    onPress={(event) => {
                                        const { pageX, pageY } = event.nativeEvent;

                                        setMenuPosition({
                                            x: pageX,
                                            y: pageY,
                                        });

                                        setMenuVisible(true);
                                    }}
                                    style={{ position: 'absolute', right: 0, top: -6 }}
                                    className="p-2 rounded-full active:bg-gray-100"
                                >
                                    <MoreHorizontal size={20} color="#374151" />
                                </TouchableOpacity>
                            )}
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
                            <View className="mt-3 mb-2 animate-fade-in">
                                <View className="flex-row items-stretch bg-white rounded-2xl border border-gray-200 p-2 shadow-gray-500/10">
                                    <TextInput
                                        className="flex-1 px-3 py-2 text-base text-gray-800"
                                        style={{
                                            textAlignVertical: 'top',
                                            maxHeight: 120,
                                        }}
                                        placeholder="Write a reply..."
                                        placeholderTextColor="#9CA3AF"
                                        value={replyContent}
                                        onChangeText={setReplyContent}
                                        multiline
                                        maxLength={100}
                                        autoFocus={true}
                                    />

                                    <View className="flex-col items-center justify-end ml-2 pb-1">
                                        <Text className={`text-[10px] mb-1 ${replyContent.length >= 100 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {replyContent.length}/100
                                        </Text>

                                        <TouchableOpacity
                                            onPress={handleReplySubmit}
                                            disabled={!replyContent.trim() || isSubmitting}
                                            className={`rounded-full px-4 py-2 flex-row items-center justify-center ${!replyContent.trim() ? 'bg-gray-100' : 'bg-[#7B4A2E]'}`}
                                        >
                                            {isSubmitting ? (
                                                <ActivityIndicator size="small" color="#FFF" />
                                            ) : (
                                                <Send size={20} color={(!replyContent.trim() || isSubmitting) ? "#9CA3AF" : "#FFF"} style={{ marginLeft: -2, marginTop: 2 }} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setActiveReplyCommentId(null)}
                                    className="mt-2 self-start px-2"
                                >
                                    <Text className="text-sm text-gray-400">Cancel</Text>
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

            {/* Options modal */}
            <Modal
                transparent
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-gray/30"
                    onPress={() => setMenuVisible(false)}
                >
                    <View
                        style={{
                            position: 'absolute',
                            top: menuPosition.y + 20,
                            right: 30,
                        }}
                        className="bg-white rounded-xl shadow-md w-40"
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setMenuVisible(false);
                                setModalVisible(true);
                            }}
                            className="px-4 py-3"
                        >
                            <Text className="text-red-500 font-medium">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Confirm delete modal */}
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/40 px-6">
                    <View className="bg-white w-full rounded-2xl p-6">
                        <Text className="text-lg font-bold text-gray-900 mb-2">
                            Delete Comment
                        </Text>

                        <Text className="text-gray-500 mb-6">
                            Are you sure you want to delete this comment?
                        </Text>

                        <View className="flex-row justify-end space-x-3 gap-2">
                            {/* Cancel */}
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200"
                            >
                                <Text className="text-gray-700 font-medium">Cancel</Text>
                            </TouchableOpacity>

                            {/* Delete */}
                            <TouchableOpacity
                                onPress={handleDeleteComment}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg bg-red-500"
                            >
                                {deleting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white font-medium">Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
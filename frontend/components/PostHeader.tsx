import { View, Text, Image, TouchableOpacity, Pressable, Alert, ActivityIndicator, Modal, TextInput } from "react-native";
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react-native';
import ImageViewing from "react-native-image-viewing";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import defaultAvatar from '@/assets/images/profile.png'
import { authFetch } from "@/services/authFetch";
import { router, usePathname, useLocalSearchParams } from "expo-router";
import { PostVideo } from "./PostVideo";
import { VideoViewer } from "./VideoViewer";
import { API_URL } from "@/config/api";

const timeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);

    const diffMs = now.getTime() - created.getTime();
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

interface PostItemProps {
    post: {
        _id: string,
        content: string;
        author: {
            _id: string,
            username: string;
            profile_picture?: string;
        };
        media?: string[],
        likes_count: number;
        comments_count: number,
        comments?: [],
        createdAt: string,
        is_liked?: boolean,
        is_followed: boolean,
        isEdited?: boolean;
    };
    onUpdatePost?: (postId: string, newContent: string) => void;
}

export default function PostHeader({ post, onUpdatePost }: PostItemProps) {

    const { user, token, logout } = useAuth()
    const pathname = usePathname()
    const { id: currentRouteId } = useLocalSearchParams()
    const [visible, setVisible] = useState(false)
    const [index, setIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [liked, setLiked] = useState<boolean>(!!post.is_liked)
    const [likesCount, setLikesCount] = useState<number>(post.likes_count)
    const [isFollowed, setIsFollowed] = useState(post?.is_followed ?? false)
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
    const [videoViewerVisible, setVideoViewerVisible] = useState(false)

    const postId = post._id
    const isOwnPost = user?._id === post.author?._id

    const [modalVisible, setModalVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [editError, setEditError] = useState<string | null>(null);
    const [canEdit, setCanEdit] = useState(false);
    const [displayContent, setDisplayContent] = useState(post.content);
    const [isEdited, setIsEdited] = useState(post.isEdited ?? false);

    // like/unlike post
    const handleToggleLike = async () => {
        const nextLiked = !liked
        setLiked(nextLiked)
        setLikesCount(prev => prev + (nextLiked ? 1 : -1))

        try {
            const method = liked ? 'DELETE' : 'POST'
            const res = await authFetch(`${API_URL}/post/${postId}/like`,
                { method },
                token,
                logout
            )
            if (!res) return
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || 'Like failed')
            }
        } catch (error) {
            setLiked(liked)
            setLikesCount(prev => prev + (liked ? 1 : -1))
            // console.error(error)
            Alert.alert('Error', 'Failed to like post')
        }
    }

    // follow/unfollow action
    const handleFollow = async () => {
        setLoading(true);
        try {
            const method = isFollowed ? 'DELETE' : 'POST'
            const res = await authFetch(`${API_URL}/users/follow/${post.author._id}`,
                { method },
                token,
                logout
            )
            if (!res) return
            if (!res.ok) throw new Error('Follow failed')
            setIsFollowed(!isFollowed)
        } catch (err) {
            // console.error(err);
            Alert.alert('Error', 'Follow failed')
        } finally {
            setLoading(false)
        }
    }

    const navigateToUser = () => {
        if (post.author?._id) {
            if (pathname.includes('/profile') && post.author._id === user?._id) return;
            if (currentRouteId === post.author._id || pathname === `/user/${post.author._id}`) return;

            router.push({
                pathname: '/user/[id]',
                params: { id: post.author._id },
            });
        }
    }

    const isVideo = (url: string) => {
        return url.match(/\.(mp4|mov|webm|m4v)$/i)
    }

    const imageUris = (post?.media || []).filter(url => !isVideo(url));

    const handleMediaPress = (url: string, idx: number) => {
        if (isVideo(url)) {
            setSelectedVideo(url);
            setVideoViewerVisible(true);
        } else {
            const imageIndex = imageUris.indexOf(url);
            setIndex(imageIndex !== -1 ? imageIndex : 0);
            setVisible(true);
        }
    };

    const handleDeletePost = async () => {
        try {
            setDeleting(true);

            const res = await authFetch(
                `${API_URL}/posts/delete/${post._id}`,
                { method: 'DELETE' },
                token,
                logout
            );
            if (!res) return
            if (res.ok) {
                setModalVisible(false);
                router.back();
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

    useEffect(() => {
        if (!isOwnPost) return;

        const checkEditability = () => {
            const postTime = new Date(post.createdAt).getTime();
            const now = new Date().getTime();
            const diffInMinutes = (now - postTime) / (1000 * 60);

            if (diffInMinutes < 5) {
                setCanEdit(true);

                const timeRemaining = (5 * 60 * 1000) - (now - postTime);
                const timer = setTimeout(() => {
                    setCanEdit(false);
                    setMenuVisible(false);
                }, timeRemaining);
                return () => clearTimeout(timer);
            } else {
                setCanEdit(false);
            }
        };

        const cleanup = checkEditability();
        return cleanup;
    }, [post.createdAt, isOwnPost])

    const handleEditContentChange = (text: string) => {
        setEditContent(text);
        if (text.length > 300) {
            setEditError(`Content exceeds limit (-${text.length - 300})`);
        } else {
            setEditError(null);
        }
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) {
            Alert.alert('Error', 'Content is required');
            return;
        }
        if (editContent.length > 300) {
            Alert.alert('Error', 'Content must be at most 300 characters');
            return;
        }
        if (editContent === displayContent) {
            setEditModalVisible(false);
            return;
        }

        setEditing(true);
        try {
            const res = await authFetch(
                `${API_URL}/posts/update/${post._id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ content: editContent })
                },
                token,
                logout
            );

            if (!res) return;

            if (res.ok) {
                setDisplayContent(editContent);
                setIsEdited(true);
                setEditModalVisible(false);
                if (onUpdatePost) {
                    onUpdatePost(post._id, editContent);
                }
            } else {
                const data = await res.json();
                Alert.alert('Error', data.message || 'Could not update post.');
            }
        } catch (error) {
            Alert.alert('Error', 'Please check your network connection.');
        } finally {
            setEditing(false);
        }
    }

    return (
        <>
            <View className="px-4 pt-4 bg-white">
                {/* Author Section */}
                {post.author && (
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center flex-1">
                            <Pressable onPress={navigateToUser}>
                                <Image
                                    source={
                                        post.author.profile_picture && post.author.profile_picture.trim() !== ''
                                            ? { uri: post.author.profile_picture }
                                            : defaultAvatar
                                    }
                                    className="w-12 h-12 rounded-full bg-gray-100"
                                />
                            </Pressable>
                            <View className="ml-3 justify-center flex-1 pr-2">
                                <Pressable onPress={navigateToUser}>
                                    <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                        {post.author.username}
                                    </Text>
                                </Pressable>
                                <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                                    {timeAgo(post.createdAt)}
                                </Text>
                            </View>
                        </View>

                        {/* Follow Button */}
                        {isOwnPost ? (
                            <TouchableOpacity
                                onPress={(event) => {
                                    const { pageX, pageY } = event.nativeEvent;

                                    setMenuPosition({
                                        x: pageX,
                                        y: pageY,
                                    });

                                    setMenuVisible(true);
                                }}
                                className="ml-auto p-2 rounded-full active:bg-gray-100"
                            >
                                <MoreHorizontal size={22} color="#374151" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={handleFollow}
                                disabled={loading}
                                activeOpacity={0.7}
                                className={`px-4 py-1.5 rounded-full border ${isFollowed ? 'border-gray-300 bg-white' : 'border-[#7B4A2E] bg-[#7B4A2E]'}`}
                            >
                                <Text className={`text-sm font-semibold ${isFollowed ? 'text-gray-700' : 'text-white'}`}>
                                    {isFollowed ? 'Following' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Content */}
                <Text className="text-base text-gray-800 my-3 leading-6">
                    {displayContent}
                </Text>
                {isEdited && (
                    <Text className="text-xs text-gray-400 mb-2 italic">Edited</Text>
                )}

                {/* Media */}
                {post?.media && post.media.length > 0 && (
                    <View className="mt-2 mb-1">
                        {post.media.map((url: string, index: number) => (
                            <Pressable
                                key={url}
                                onPress={() => handleMediaPress(url, index)}
                                className="w-full mb-3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100"
                            >

                                {isVideo(url) ? (
                                    <PostVideo uri={url} />
                                ) : (
                                    <Image
                                        source={{ uri: url }}
                                        style={{ width: "100%", height: 300 }}
                                        resizeMode="cover"
                                    />
                                )}
                            </Pressable>
                        ))}
                        <ImageViewing
                            images={imageUris.map((uri: string) => ({ uri }))}
                            imageIndex={index}
                            visible={visible}
                            onRequestClose={() => setVisible(false)}
                        />

                        {selectedVideo && (
                            <VideoViewer
                                uri={selectedVideo}
                                visible={videoViewerVisible}
                                onClose={() => setVideoViewerVisible(false)}
                            />
                        )}
                    </View>
                )}

                {/* Post Actions: like + comment */}
                <View className="flex-row items-center border-t border-gray-100 pt-3 pb-1 mt-1">
                    <TouchableOpacity
                        className="flex-row items-center mr-6 px-1 py-2 active:opacity-70"
                        onPress={handleToggleLike}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Heart
                            size={22}
                            color={liked ? '#F43F5E' : '#4B5563'}
                            fill={liked ? '#F43F5E' : 'transparent'}
                            strokeWidth={liked ? 0 : 1.8}
                        />
                        <Text className={`text-sm font-medium ml-2 ${liked ? 'text-rose-500' : 'text-gray-600'}`}>
                            {likesCount > 0 ? likesCount : 'Like'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center px-1 py-2 active:opacity-70"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MessageCircle
                            size={22}
                            color="#4B5563"
                            strokeWidth={1.8}
                        />
                        <Text className="text-sm font-medium text-gray-600 ml-2">
                            {post.comments_count > 0 ? post.comments_count : 'Comment'}
                        </Text>
                    </TouchableOpacity>
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
                            top: menuPosition.y + 12,
                            right: 16,
                        }}
                        className="bg-white rounded-xl shadow-md w-40"
                    >
                        {canEdit && (
                            <TouchableOpacity
                                onPress={() => {
                                    setMenuVisible(false);
                                    setEditContent(displayContent);
                                    setEditError(null);
                                    setEditModalVisible(true);
                                }}
                                className="px-4 py-3 border-b border-gray-100"
                            >
                                <Text className="text-[#7B4A2E] font-medium">Edit</Text>
                            </TouchableOpacity>
                        )}
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
                            Delete Post
                        </Text>

                        <Text className="text-gray-500 mb-6">
                            Are you sure you want to delete this post?
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
                                onPress={handleDeletePost}
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

            {/* Edit post modal */}
            <Modal
                animationType="fade"
                transparent
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/40 px-6">
                    <View className="bg-white w-full rounded-2xl p-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">
                            Edit Post
                        </Text>

                        <TextInput
                            value={editContent}
                            onChangeText={handleEditContentChange}
                            multiline
                            placeholder="Edit your post..."
                            placeholderTextColor="#A0A0A0"
                            className="text-base text-gray-800 border border-gray-200 rounded-xl p-3 min-h-[100px]"
                            textAlignVertical="top"
                        />

                        <View className="flex-row justify-between items-center mt-2">
                            {editError ? (
                                <Text className="text-red-500 text-sm">{editError}</Text>
                            ) : (
                                <Text className="text-gray-400 text-sm">{editContent.length}/300</Text>
                            )}
                        </View>

                        <View className="flex-row justify-end space-x-3 gap-2 mt-4">
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200"
                            >
                                <Text className="text-gray-700 font-medium">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSaveEdit}
                                disabled={editing || !!editError || !editContent.trim()}
                                className={`px-4 py-2 rounded-lg ${editing || !!editError || !editContent.trim() ? 'bg-gray-300' : 'bg-[#7B4A2E]'}`}
                            >
                                {editing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white font-medium">Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
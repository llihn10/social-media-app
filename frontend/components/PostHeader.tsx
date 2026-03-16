import { View, Text, Image, TouchableOpacity, Pressable, Alert } from "react-native";
import { Heart, MessageCircle } from 'lucide-react-native';
import ImageViewing from "react-native-image-viewing";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import defaultAvatar from '@/assets/images/profile.png'
import { authFetch } from "@/services/authFetch";
import { router } from "expo-router";
import { PostVideo } from "./PostVideo";
import { VideoViewer } from "./VideoViewer";

const API_URL = process.env.EXPO_PUBLIC_API_URL

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
        is_followed: boolean
    },
}

export default function PostHeader({ post }: PostItemProps) {

    const { user, token, logout } = useAuth()
    const [visible, setVisible] = useState(false)
    const [index, setIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [liked, setLiked] = useState<boolean>(!!post.is_liked)
    const [likesCount, setLikesCount] = useState<number>(post.likes_count)
    const [isFollowed, setIsFollowed] = useState(post?.is_followed ?? false)
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
    const [videoViewerVisible, setVideoViewerVisible] = useState(false)
    const postId = post._id
    const isOwnPost = user?._id === post.author?._id

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
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || 'Like failed')
            }
        } catch (error) {
            setLiked(liked)
            setLikesCount(prev => prev + (liked ? 1 : -1))
            console.error(error)
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
            if (!res.ok) throw new Error('Follow failed')
            setIsFollowed(!isFollowed)
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Follow failed')
        } finally {
            setLoading(false)
        }
    }

    const navigateToUser = () => {
        if (post.author?._id) {
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

    return (
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
                                className="w-11 h-11 rounded-full bg-gray-100"
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
                    {!isOwnPost && (
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
                {post.content}
            </Text>

            {/* Media */}
            {post?.media && post.media.length > 0 && (
                <View className="mt-2 mb-1">
                    {post.media.map((url: string, index: number) => (
                        <Pressable
                            key={url}
                            onPress={() => handleMediaPress(url, index)}
                            className="w-full mb-3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100"
                        >
                            {/* <Image
                                source={{ uri: url }}
                                style={{ width: "100%", height: 300 }}
                                resizeMode="cover"
                            /> */}

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
    );
}
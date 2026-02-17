import { View, Text, Image, TouchableOpacity, Pressable, Alert } from "react-native";
import { Heart, MessageCircle } from 'lucide-react-native';
import ImageViewing from "react-native-image-viewing";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import defaultAvatar from '@/assets/images/profile.png'
import { authFetch } from "@/services/authFetch";
import { router } from "expo-router";

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
        is_followed: boolean
    },
}

export default function PostHeader({ post }: PostItemProps) {

    const { user, token, logout } = useAuth()
    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowed, setIsFollowed] = useState(post?.is_followed ?? false)
    const isOwnPost = user?._id === post.author?._id

    // follow/unfollow action
    const handleFollow = async () => {
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

    return (

        <View className='px-3 pt-3'>

            {/* Author */}
            {post.author && (
                <View className='items-center flex-row'>
                    <Pressable onPress={() => router.push({
                        pathname: '/user/[id]',
                        params: { id: post.author._id },
                    })}>
                        <Image
                            source={
                                post.author.profile_picture &&
                                    post.author.profile_picture.trim() !== ''
                                    ? { uri: post.author.profile_picture }
                                    : defaultAvatar
                            }
                            className='w-12 h-12 rounded-full mt-1'
                        />
                    </Pressable>
                    <View className='flex-row items-baseline'>
                        <Pressable onPress={() => router.push({
                            pathname: '/user/[id]',
                            params: { id: post.author._id },
                        })}>
                            <Text className='text-lg font-semibold text-dark-100 ml-3'>{post.author.username}</Text>
                        </Pressable>
                        <Text className='ml-3 text-sm font-normal text-dark-200'> {timeAgo(post.createdAt)}</Text>

                        {/* Follow Button */}
                        {!isOwnPost && (
                            <TouchableOpacity
                                onPress={handleFollow}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-baseline">
                                    <Text className="mx-3 text-dark-200">•</Text>
                                    {isFollowed ? (
                                        <Text className="text-success font-bold text-sm">Followed</Text>
                                    ) : (
                                        <Text className="text-accent font-bold text-sm">Follow</Text>
                                    )}
                                </View>

                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Content */}
            <Text className='text-base text-dark-100 my-3'>{post.content}</Text>

            {/* Media */}
            {post?.media?.map((url: string, index: number) => (
                <Pressable
                    key={url}
                    onPress={() => {
                        setIndex(index);
                        setVisible(true);
                    }}
                >
                    <Image
                        source={{ uri: url }}
                        style={{ width: "100%", height: 300, marginTop: 8 }}
                        resizeMode="cover"
                    />
                </Pressable>
            ))}

            <ImageViewing
                images={(post?.media ?? []).map((uri: string) => ({ uri }))}
                imageIndex={index}
                visible={visible}
                onRequestClose={() => setVisible(false)}
            />

            {/* Post Actions: like + comment */}
            <View className='flex-row gap-5 py-2'>
                <Pressable className="flex-row items-center gap-2 p-2">
                    <Heart
                        size={19}
                        color={'#000'}
                        fill='none'
                    />
                    <Text className="text-base text-dark-100 font-medium">{post.likes_count}</Text>
                </Pressable>

                <Pressable className="flex-row items-center gap-2 p-2">
                    <MessageCircle
                        size={19}
                        color={'#000'}
                        fill='none'
                    />
                    <Text className="text-base text-dark-100 font-medium">{post.comments_count}</Text>
                </Pressable>

            </View>
        </View>
    );
}
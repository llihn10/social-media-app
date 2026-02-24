import { View, Text, Image, Pressable, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useState, memo } from 'react'
import { Heart, MessageCircle, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext'
import ImageViewing from "react-native-image-viewing";
import defaultAvatar from '@/assets/images/profile.png'
import { authFetch } from '@/services/authFetch';

const API_URL = process.env.EXPO_PUBLIC_API_URL

interface PostItemProps {
    post: {
        _id: string,
        content: string;
        author: {
            _id: string,
            username: string;
            profile_picture?: string;
        };
        media: string[],
        likes_count: number;
        comments_count: number,
        is_liked?: boolean,
        createdAt: string,
    },
}

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

const PostCard = memo(({ post }: PostItemProps) => {

    const { user, token, logout } = useAuth()
    const [visible, setVisible] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [liked, setLiked] = useState<boolean>(!!post.is_liked)
    const [likesCount, setLikesCount] = useState<number>(post.likes_count)

    const images = post.media.map((url: string) => ({ uri: url }))
    const postId = post._id

    const handleToggleLike = async () => {
        const nextLiked = !liked

        // Optimistic update
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

    return (

        <View className='py-3 bg-secondary relative'>
            <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => router.push(`/post/${post._id}`)}
                className='active:bg-gray-100/10'
            />

            {/* Avatar + Username + Post Content */}
            <View className='px-4 flex-row'>
                {/* Avatar */}
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

                <View className='px-3 flex-1'>
                    <View className='flex-row items-baseline'>
                        <Text className='text-lg font-semibold text-dark-100'>
                            {post.author.username}
                        </Text>
                        <Text className='ml-3 text-sm font-normal text-dark-200'>{timeAgo(post.createdAt)}</Text>
                    </View>

                    <Text className='text-lg text-dark-100 mt-1'>
                        {post.content}
                    </Text>
                </View>
            </View>

            {/* Image Content */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                decelerationRate="fast"
                snapToAlignment="start"
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingLeft: 66, paddingRight: 12, gap: 4 }}
                style={{ marginTop: 12 }}
            >
                {post.media.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.9}
                        onPress={() => {
                            setImageIndex(index);
                            setVisible(true);
                        }}
                    >
                        <Image
                            key={index}
                            source={{ uri: item }}
                            style={{ width: 250, height: 270 }}
                            className="rounded-md overflow-hidden shadow-sm"
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ImageViewing
                images={images}
                imageIndex={imageIndex}
                visible={visible}
                onRequestClose={() => setVisible(false)}
                HeaderComponent={() => (
                    <TouchableOpacity
                        onPress={() => setVisible(false)}
                        style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
                    >
                        <X color="white" size={30} />
                    </TouchableOpacity>
                )}
            />

            {/* Post Actions: like + comment */}
            <View className='flex-row mt-2 gap-6' style={{ marginLeft: 58 }}>
                <Pressable
                    className="flex-row items-center gap-2 p-2"
                    onPress={handleToggleLike}
                >
                    <Heart
                        size={17}
                        color={liked ? '#ff2d55' : '#000'}
                        fill={liked ? '#ff2d55' : 'none'}
                    />
                    <Text className="text-sm text-dark-100 font-medium">{likesCount}</Text>
                </Pressable>

                <Pressable className="flex-row items-center gap-2 p-2">
                    <MessageCircle
                        size={17}
                        color={'#000'}
                        fill='none'
                    />
                    <Text className="text-sm text-dark-100 font-medium">{post.comments_count}</Text>
                </Pressable>

            </View>
        </View>
    )
})

export default PostCard
import { View, Text, Image, FlatList, Pressable } from 'react-native'
import React from 'react'
import { Heart, MessageCircle } from 'lucide-react-native';
import { router } from 'expo-router';

interface PostItemProps {
    post: {
        _id: string,
        content: string;
        author: {
            username: string;
            profile_picture?: string;
        };
        media: string,
        likes_count: number;
        comments_count: number,
        created_at: string
    }
}

const timeAgo = (created_at: string) => {
    const now = new Date();
    const created = new Date(created_at);

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

const PostCard = ({ post }: PostItemProps) => {

    return (
        <Pressable
            onPress={() => router.push(`/post/${post._id}`)}
        >
            <View className='py-3 bg-secondary'>

                {/* Avatar + Username + Post Content */}
                <View className='px-4 flex-row'>
                    {/* Avatar */}
                    <Image source={{ uri: post.author.profile_picture }}
                        className='w-12 h-12 rounded-full mt-1'
                    />

                    <View className='px-3 flex-1'>
                        <View className='flex-row items-baseline'>
                            <Text className='text-lg font-semibold text-dark-100'>
                                {post.author.username}
                            </Text>
                            <Text className='ml-3 text-sm font-normal text-dark-200'> {timeAgo(post.created_at)}</Text>
                        </View>

                        <Text className='text-base text-dark-100 mt-1'>
                            {post.content}
                        </Text>
                    </View>
                </View>

                {/* Image Content */}
                <FlatList
                    style={{ marginTop: 12 }}
                    data={post.media}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={{ paddingLeft: 66, paddingRight: 12, gap: 4 }}
                    renderItem={({ item }) => (
                        <Image
                            source={{ uri: item }}
                            style={{ width: 250, height: 270 }}
                            className="rounded-md overflow-hidden shadow-sm"
                            resizeMode="cover"
                        />
                    )}
                />

                {/* Post Actions: like + comment */}
                <View className='flex-row mt-2 gap-6' style={{ marginLeft: 58 }}>
                    <Pressable className="flex-row items-center gap-2 p-2">
                        <Heart
                            size={17}
                            color={'#000'}
                            fill='none'
                        />
                        <Text className="text-sm text-dark-100 font-medium">{post.likes_count}</Text>
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
        </Pressable>

    )
}

export default PostCard
import { router } from 'expo-router';
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react-native';
import ImageViewing from "react-native-image-viewing";
import { useState } from 'react';

const Header = () => (
    <View className='flex-row items-center pt-7 pb-2 mb-2 ml-1 border-b border-gray-100'>
        <ArrowLeft
            size={23}
            color="#7B4A2E"
            strokeWidth={2.2}
            onPress={() => router.back()}
        />
        <Text className='ml-5 text-2xl font-semibold text-dark-100'>The Hut</Text>
    </View>
)

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

export default function PostHeader({ post }: any) {

    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);


    return (

        <View className='px-3 pt-3'>

            <Header />

            {/* Author */}
            <View className='items-center flex-row'>
                <Image source={{ uri: post.author.profile_picture }}
                    className='w-12 h-12 rounded-full mt-1'
                />
                <View className='flex-row items-baseline'>
                    <Text className='text-lg font-semibold text-dark-100 ml-3'>{post.author.username}</Text>
                    <Text className='ml-3 text-sm font-normal text-dark-200'> {timeAgo(post.created_at)}</Text>

                    <Text className="mx-3 text-dark-200">•</Text>

                    {/* Follow Button */}
                    <TouchableOpacity
                        onPress={() => { }}
                        activeOpacity={0.7}
                    >
                        <Text className="text-accent font-bold text-sm">Follow</Text>
                        {/* <Text className="text-success font-bold text-sm">Followed</Text> */}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <Text className='text-base text-dark-100 my-3'>{post.content}</Text>

            {/* Media */}
            {post.media.map((url: string, index: number) => (
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
                images={post.media.map((uri: string) => ({ uri }))}
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
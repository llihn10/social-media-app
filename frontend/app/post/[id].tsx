import CommentItem from '@/components/CommentItem';
import PostHeader from '@/components/PostHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PostDetail({ route }: any) {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`${API_URL}/api/posts/${id}`);
                const json = await res.json();
                setPost(json);
            } catch (err) {
                console.error(err);
                setError('Failed to load posts')
            } finally {
                setLoading(false);
            }
        }

        fetchPost();
    }, [id])

    const Header = () => (
        <View className='flex-row items-center pb-2 ml-3 border-b border-gray-100'>
            <ArrowLeft
                size={24}
                color="#7B4A2E"
                strokeWidth={2.2}
                onPress={() => router.back()}
            />
            <Text className='ml-4 text-2xl font-semibold text-dark-100'>The Hut</Text>
        </View>
    )

    if (loading) {
        return <ActivityIndicator />
    }

    if (!post) {
        return <Text>Post not found.</Text>
    }

    return (
        <SafeAreaView className='flex-1 bg-secondary' edges={['top']}>
            <Header />

            <FlatList
                className='bg-secondary'
                data={post.comments}
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={<PostHeader post={post} />}
                renderItem={({ item }) => <CommentItem comment={item} />}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </SafeAreaView>

    )
}

import CommentItem from '@/components/CommentItem';
import PostHeader from '@/components/PostHeader';
import { useLocalSearchParams } from 'expo-router';
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

    if (loading) {
        return <ActivityIndicator />
    }

    if (!post) {
        return <Text>Post not found.</Text>
    }

    return (
        <SafeAreaView edges={['bottom']}>
            <FlatList
                className='bg-secondary'
                data={post.comments}
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={<PostHeader post={post} />}
                renderItem={({ item }) => <CommentItem comment={item} />}
            />
        </SafeAreaView>

    )
}

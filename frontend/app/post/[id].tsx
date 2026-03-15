import CommentItem from '@/components/CommentItem';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import PostHeader from '@/components/PostHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Text, View, FlatList, Alert, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PostDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, token, logout } = useAuth()
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPost = useCallback(async () => {
        try {
            const res = await authFetch(`${API_URL}/posts/${id}`,
                {},
                token,
                logout
            );
            const json = await res.json();
            setPost(json);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to load posts')
        } finally {
            setLoading(false);
        }
    }, [id, token, logout]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost])

    const handleComment = async () => {
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            const res = await authFetch(`${API_URL}/post/${id}/comment`, {
                method: 'POST',
                body: JSON.stringify({ content: comment.trim() })
            }, token, logout);

            if (res.ok) {
                setComment('');
                fetchPost();
            } else {
                const data = await res.json();
                Alert.alert('Error', data.message || 'Failed to post comment');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

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

    const keyboardOffset = Platform.OS === 'ios' ? 40 : 0;

    return (
        <SafeAreaView className='flex-1 bg-secondary' edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={keyboardOffset}
            >
                <Header />

                <FlatList
                    className='flex-1 bg-secondary'
                    data={post.comments}
                    overScrollMode="never"
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    ListHeaderComponent={<PostHeader post={post} />}
                    renderItem={({ item }) => <CommentItem comment={item} />}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />

                <View className="flex-row items-center px-4 py-3 border-t border-gray-200 bg-secondary">
                    <TextInput
                        className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 text-base max-h-32"
                        placeholder="Add a comment..."
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        className="ml-3 p-2 rounded-full items-center justify-center h-10 w-10"
                        style={{ backgroundColor: (!comment.trim() || submitting) ? '#D1D5DB' : '#7B4A2E' }}
                        onPress={handleComment}
                        disabled={!comment.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Send size={18} color="#FFF" style={{ marginLeft: 3 }} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

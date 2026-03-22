import CommentItem from '@/components/CommentItem';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import PostHeader from '@/components/PostHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertCircle, ArrowLeft, Send } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Text, View, FlatList, Alert, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PostDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user, token, logout } = useAuth();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

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
            Alert.alert('Error', 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    }, [id, token, logout]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPost();
        setRefreshing(false);
    }, [fetchPost]);

    const handleComment = async () => {
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            const res = await authFetch(`${API_URL}/comment/${id}`, {
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

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#7B4A2E" />
            </SafeAreaView>
        );
    }

    if (!post) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
                <AlertCircle size={48} color="#9CA3AF" />
                <Text className="mt-4 text-xl font-semibold text-gray-800">Post not found</Text>
                <Text className="mt-2 text-center text-gray-500 mb-6">The post you are looking for doesn't exist or has been removed.</Text>
                <TouchableOpacity
                    className="px-8 py-3 bg-[#7B4A2E] rounded-full active:bg-[#5A3622]"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-semibold text-base">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const keyboardOffset = Platform.OS === 'ios' ? 0 : 0;

    return (
        <>
            <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={keyboardOffset}
                >
                    {/* Header */}
                    <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100 z-10">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="p-2 -ml-2 rounded-full active:bg-gray-100"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <ArrowLeft size={24} color="#1F2937" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Text className="ml-3 text-lg font-bold text-gray-900">Comments</Text>
                    </View>

                    {/* Content */}
                    <FlatList
                        className="flex-1 bg-gray-50"
                        data={post.comments}
                        overScrollMode="never"
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => item?._id || index.toString()}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#7B4A2E"]} tintColor="#7B4A2E" />
                        }
                        ListHeaderComponent={
                            <View className="bg-white mb-2 pb-2 border-b border-gray-100">
                                <PostHeader post={post} />
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View className="bg-white px-4 border-b border-gray-50">
                                <CommentItem
                                    comment={item}
                                    onRefresh={fetchPost}
                                    activeReplyCommentId={activeReplyCommentId}
                                    setActiveReplyCommentId={setActiveReplyCommentId}
                                />
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        ListEmptyComponent={
                            <View className="py-12 items-center justify-center">
                                <Text className="text-gray-400 text-base">No comments yet. Be the first to reply!</Text>
                            </View>
                        }
                    />

                    {/* Comment Input Area */}
                    {!activeReplyCommentId && (
                        <View className="flex-row items-end px-4 py-3 border-t border-gray-200 bg-white">
                            <TextInput
                                className="flex-1 bg-gray-100 rounded-3xl px-5 pt-3.5 pb-3.5 text-base text-gray-900 max-h-32 border border-gray-200"
                                placeholder="Add a comment..."
                                placeholderTextColor="#9CA3AF"
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                maxLength={500}
                                textAlignVertical="center"
                            />
                            <TouchableOpacity
                                className={`ml-3 mb-1 rounded-full items-center justify-center h-12 w-12 ${(!comment.trim() || submitting) ? 'bg-gray-200' : 'bg-[#7B4A2E]'
                                    }`}
                                onPress={handleComment}
                                disabled={!comment.trim() || submitting}
                                activeOpacity={0.8}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Send size={20} color={(!comment.trim() || submitting) ? "#9CA3AF" : "#FFF"} style={{ marginLeft: -2, marginTop: 2 }} />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

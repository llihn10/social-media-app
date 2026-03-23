import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import PostCard from '@/components/PostCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LikedPostsScreen() {
    const { token, logout } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLikedPosts = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await authFetch(`${API_URL}/posts/liked`, {}, token, logout);
            if (!res) return
            if (!res.ok) throw new Error('Failed to fetch liked posts');
            const json = await res.json();
            setPosts(json.data || []);
        } catch (err) {
            console.error(err);
            setError('Could not load liked posts');
        } finally {
            if (!isRefresh) setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLikedPosts(true);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchLikedPosts();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary">
                <ActivityIndicator size="large" color="#7B4A2E" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-secondary">
                <Text className="text-red-500">{error}</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-secondary">
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <PostCard post={item} />}

                contentContainerStyle={{
                    paddingVertical: 10,
                    flexGrow: 1
                }}
                ItemSeparatorComponent={() => <View className="border-t border-gray-100" />}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center px-8">
                        <Text className="text-gray-500 text-lg font-medium text-center">
                            No liked posts yet.
                        </Text>
                        <Text className="text-gray-400 text-sm text-center mt-2">
                            Like posts to save them here.
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7B4A2E" colors={["#7B4A2E"]} />
                }
            />
        </View>
    );
}

import PostCard from '@/components/PostCard';
import ProfileCard from '@/components/ProfileCard';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import { Frown, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { API_URL } from '@/config/api'

export default function SearchScreen() {
    const { token, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    const fetchResult = async (isRefreshing = false) => {
        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery) {
            setUsers([]);
            setPosts([]);
            return;
        }

        try {
            if (!isRefreshing) setLoading(true);

            const res = await authFetch(`${API_URL}/search?searchQuery=${encodeURIComponent(trimmedQuery)}`, {}, token, logout);
            if (!res) return
            const json = await res.json();

            setUsers(json.data.users || [])
            setPosts(json.data.posts || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load result')
        } finally {
            if (!isRefreshing) setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchResult(true);
        setRefreshing(false);
    }, [searchQuery]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setLoading(false);
            setUsers([]);
            setPosts([]);
            return;
        }

        const timeout = setTimeout(() => {
            fetchResult();
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchQuery])

    return (
        <SafeAreaView className='flex-1 bg-secondary' edges={['top']}>
            <SearchBar
                placeholder='Search'
                value={searchQuery}
                onChangeText={handleSearch}
            />

            {/* Result: Posts */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (<PostCard post={item} />)}

                ItemSeparatorComponent={() => (<View className="border-t border-gray-200" />)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={posts.length === 0 ? { flexGrow: 1 } : {}}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#D88A3D"]} tintColor="#D88A3D" />
                }

                ListEmptyComponent={() => {
                    const hasQuery = searchQuery.trim().length > 0;

                    if (loading) return null;

                    if (!hasQuery) {
                        return (
                            <View className="flex-1 items-center justify-center px-10">
                                <View className="bg-orange-100 p-6 rounded-full mb-4">
                                    <Search size={40} color="#D88A3D" strokeWidth={1.5} />
                                </View>
                                <Text className="text-dark-100 text-xl font-bold text-center">
                                    Discover something new
                                </Text>
                                <Text className="text-gray-500 text-center mt-2 leading-5">
                                    Search for your favorite topics or trends.
                                </Text>
                            </View>
                        );
                    }

                    if (users.length === 0 && posts.length === 0) {
                        return (
                            <View className="flex-1 items-center justify-center px-10">
                                <View className="bg-gray-100 p-6 rounded-full mb-4">
                                    <Frown size={40} color="#9CA3AF" strokeWidth={1.5} />
                                </View>
                                <Text className="text-dark-100 text-xl font-bold text-center">
                                    No results found
                                </Text>
                                <Text className="text-gray-500 text-center mt-2 leading-5">
                                    We couldn't find anything for "<Text className="font-semibold text-dark-100">{searchQuery}</Text>". Try a different keyword.
                                </Text>
                            </View>
                        );
                    }
                    return null;
                }}

                ListHeaderComponent={
                    <View>
                        {users && users.length > 0 && (
                            <View className='py-4'>
                                <Text className="px-4 mb-2 font-semibold text-lg text-light-400">Suggested Profiles</Text>

                                {/* Result: Profiles */}
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={users}
                                    keyExtractor={(item) => item._id}
                                    renderItem={({ item }) => (<ProfileCard user={item} />)}
                                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                                />
                                <View className="mt-4 border-t border-gray-200" />
                            </View>
                        )}

                        {/* Loading indicator */}
                        {loading && searchQuery.trim() !== '' && (
                            <ActivityIndicator
                                size="large"
                                color="#D88A3D"
                                className="my-3"
                            />
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    )
}
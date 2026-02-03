import PostCard from '@/components/PostCard';
import ProfileCard from '@/components/ProfileCard';
import SearchBar from '@/components/SearchBar'
import { ChevronDown } from 'lucide-react-native';
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState('Top posts');

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    useEffect(() => {
        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery.trim()) {
            setUsers([]);
            setPosts([]);
            return;
        }

        const fetchResult = async () => {
            try {
                setLoading(true);

                const res = await fetch(`${API_URL}/search?searchQuery=${encodeURIComponent(trimmedQuery)}`);
                const json = await res.json();

                setUsers(json.data.users || [])
                setPosts(json.data.posts || []);
            } catch (err) {
                console.error(err);
                setError('Failed to load result')
            } finally {
                setLoading(false);
            }
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

                ListEmptyComponent={() => {
                    const hasQuery = searchQuery.trim().length > 0;

                    if (!loading && users.length === 0 && hasQuery) {
                        return (
                            <View className="flex-1 items-center justify-center pt-20">
                                <Text className="text-gray-500 text-lg">No results found for "{searchQuery}"</Text>
                            </View>
                        )
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

                        {/* Sort options */}
                        {!loading && searchQuery.trim().length > 0 && (
                            <View>
                                {posts && posts.length > 0 && (
                                    <TouchableOpacity
                                        className='flex-row items-center'
                                    >
                                        <Text className='text-lg font-bold text-dark-100 mr-1'>Top post</Text>
                                        <ChevronDown size={20} color='#1c1c1c' strokeWidth={2.5} />
                                    </TouchableOpacity>
                                )}
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
                        {/* <View className='px-4'>
                            {searchQuery && loading && (
                                <ActivityIndicator
                                    size="large"
                                    color="#D88A3D"
                                    className="my-3"
                                />
                            )}
                            {error && (
                            <Text className="text-red-500 px-5 my-3">
                                Error: { }
                            </Text>
                        )}

                        {!loading && !error && searchQuery.trim() && posts?.length! > 0 && (
                            <Text className="text-xl text-white font-bold">
                                Search Results for{" "}
                                <Text className="text-accent">{searchQuery}</Text>
                            </Text>
                        )}
                        </View> */}
                    </View>
                }
            />
        </SafeAreaView>
    )
}
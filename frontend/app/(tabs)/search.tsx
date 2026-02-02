import PostCard from '@/components/PostCard';
import SearchBar from '@/components/SearchBar'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setUsers([]);
            setPosts([]);
            return;
        }

        const fetchResult = async () => {
            try {
                setLoading(true);

                const res = await fetch(`${API_URL}/search?searchQuery=${encodeURIComponent(searchQuery)}`);
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
            if (searchQuery.trim()) {
                fetchResult();
            }
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

            {/* Result: Profiles */}

            {/* Result: Posts */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (<PostCard post={item} />)}
                ItemSeparatorComponent={() => (<View className="border-t border-gray-200" />)}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        {searchQuery && loading && (
                            <ActivityIndicator
                                size="large"
                                color="#D88A3D"
                                className="my-3"
                            />
                        )}

                        {/* {error && (
                            <Text className="text-red-500 px-5 my-3">
                                Error: { }
                            </Text>
                        )}

                        {!loading && !error && searchQuery.trim() && posts?.length! > 0 && (
                            <Text className="text-xl text-white font-bold">
                                Search Results for{" "}
                                <Text className="text-accent">{searchQuery}</Text>
                            </Text>
                        )} */}
                    </>
                }
            />
        </SafeAreaView>
    )
}
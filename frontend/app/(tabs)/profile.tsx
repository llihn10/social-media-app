import React, { useState, useEffect } from 'react'
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { MoreHorizontal } from 'lucide-react-native'
import PostCard from '@/components/PostCard'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export default function ProfileScreen() {
    const { user, token } = useAuth()

    const [profile, setProfile] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return

        const fetchData = async () => {
            try {
                setLoading(true);

                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                const [profileRes, postsRes] = await Promise.all([
                    fetch(`${API_URL}/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }),
                    fetch(`${API_URL}/api/posts/my-posts`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    })

                ])

                if (!profileRes.ok || !postsRes.ok) {
                    throw new Error('Fetch failed');
                }

                if (!profileRes.ok) {
                    console.log('Profile error:', profileRes.status);
                    throw new Error('Profile fetch failed');
                }

                if (!postsRes.ok) {
                    console.log('Posts error:', postsRes.status);
                    throw new Error('Posts fetch failed');
                }

                const profileJson = await profileRes.json()
                const postsJson = await postsRes.json()

                setProfile(profileJson)
                setPosts(postsJson || [])
            } catch (err) {
                console.error(err);
                setError('Failed to load data')
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [token])

    if (!user) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>Please login</Text>
            </SafeAreaView>
        )
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </SafeAreaView>
        )
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>{error}</Text>
                <Text>{user.username}</Text>
            </SafeAreaView>
        )
    }

    // Header profile
    const renderHeader = () => (
        <View className='bg-primary'>

            {/* Top bar */}
            <View className='flex-row justify-end px-4 py2'>
                <TouchableOpacity>
                    <MoreHorizontal color='black' size={28} />
                </TouchableOpacity>
            </View>

            {/* User info */}
            <View className='items-center'>
                <Text className="text-xl font-semibold text-dark-100 mt-3">
                    {profile?.username}
                </Text>
            </View>

            {/* Stats */}
            <View className='flex-row justify-around mt-4'>
                <View className='items-center'>
                    <Text className="font-semibold">{posts.length}</Text>
                    <Text className="text-dark-200">Posts</Text>
                </View>
            </View>
        </View>
    )

    return (
        <SafeAreaView className='flex-1 bg-secondary'>
            <Text>{user.username}</Text>
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (<PostCard post={item} />)}
                ListHeaderComponent={renderHeader}
                ItemSeparatorComponent={() => (<View className="border-t border-gray-200" />)}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    )
}
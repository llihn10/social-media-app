import React, { useState, useEffect } from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { MoreHorizontal } from 'lucide-react-native'
import PostCard from '@/components/PostCard'
import { authFetch } from '@/services/authFetch'
import defaultAvatar from '@/assets/images/profile.png'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export default function ProfileScreen() {
    const { user, token, logout } = useAuth()

    const [profile, setProfile] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return
        const loadData = async () => {
            try {

                const [profileRes, postsRes] = await Promise.all([
                    authFetch(`${API_URL}/profile`,
                        {},
                        token,
                        logout
                    ),
                    authFetch(`${API_URL}/posts/my-posts`,
                        {},
                        token,
                        logout)

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

                setProfile(profileJson.data)
                setPosts(postsJson.data || [])
            } catch (err) {
                console.error(err);
                setError('Failed to load data')
            } finally {
                setLoading(false);
            }
        }

        loadData()
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
        <View className='bg-secondary px-4 pt-2 pb-6 border-b border-gray-200'>

            {/* Top bar */}
            <View className='flex-row justify-end'>
                <TouchableOpacity>
                    <MoreHorizontal color='#333' size={26} />
                </TouchableOpacity>
            </View>

            {/* Avatar + Username */}
            <View className='flex-row items-start gap-4 ml-2'>
                <Image source={profile?.profile_picture
                    ? { uri: profile.profile_picture }
                    : defaultAvatar}
                    className='w-20 h-20 rounded-full'
                />

                <View>
                    <View className="w-full mt-1">
                        <Text className="text-3xl font-bold text-dark-100">{profile.username}</Text>
                    </View>

                    {/* Bio */}
                    <View>
                        <Text className='text-base font-normal text-dark-200 mt-3'>{profile.bio}</Text>
                    </View>
                </View>
            </View>

            {/* Stats */}
            <View className="flex-row justify-around mt-6">
                <View className="items-center">
                    <Text className="text-2xl font-semibold text-dark-400">{posts?.length}</Text>
                    <Text className="text-light-400">stories</Text>
                </View>
                <View className="items-center">
                    <Text className="text-2xl font-semibold text-dark-400">{profile.followers_count}</Text>
                    <Text className="text-light-400">followers</Text>
                </View>
                <View className="items-center">
                    <Text className="text-2xl font-semibold text-dark-400">{profile.following_count}</Text>
                    <Text className="text-light-400">following</Text>
                </View>
            </View>
        </View>
    )

    return (
        <SafeAreaView className='flex-1 bg-secondary' edges={['top']}>
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
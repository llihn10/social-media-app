import React, { useState, useEffect } from 'react'
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import PostCard from '@/components/PostCard'
import { authFetch } from '@/services/authFetch'
import ProfileHeader from '@/components/ProfileHeader'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export default function ProfileScreen() {
    const { user, token, logout } = useAuth()

    const [profile, setProfile] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const postNum = posts?.length

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
                Alert.alert('Error', 'Failed to load data')
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

    return (
        <SafeAreaView className='flex-1 bg-secondary' edges={['top']}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (<PostCard post={item} />)}
                ListHeaderComponent={<ProfileHeader profile={profile} postNum={postNum} />}
                ItemSeparatorComponent={() => (<View className="border-t border-gray-200" />)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </SafeAreaView>
    )
}
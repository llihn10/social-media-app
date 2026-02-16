import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { authFetch } from '@/services/authFetch'
import defaultAvatar from '@/assets/images/profile.png'
import UserItem from '@/components/UserItem'

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface FollowUser {
    _id: string,
    username: string,
    profile_picture?: string,
    is_followed: boolean
}

export default function FollowScreen() {
    const { user: currentUser, token, logout } = useAuth()
    const { userId, tab = 'followers' } = useLocalSearchParams<{ userId?: string, tab?: string }>()
    const [activeTab, setActiveTab] = useState(tab)
    const [data, setData] = useState<FollowUser[]>([])
    const [loading, setLoading] = useState(true)

    const isMe = !userId || userId === currentUser?._id

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                const endpoint = activeTab === 'followers'
                    ? (isMe ? 'followers/me' : `followers/${userId}`)
                    : (isMe ? 'following/me' : `following/${userId}`)

                const res = await authFetch(`${API_URL}/users/${endpoint}`,
                    {},
                    token,
                    logout
                );

                const result = await res.json();
                if (res.ok) {
                    setData(result.data);
                }
            } catch (err) {
                console.error(err);
                Alert.alert('Error', 'Failed to load data')
            } finally {
                setLoading(false);
            }
        }

        fetchData()
    }, [activeTab, userId])

    const Header = () => (
        <View className='flex-row border-b border-gray-200'>
            <Pressable onPress={() => setActiveTab('followers')}>
                <Text className={activeTab === 'followers' ? 'font-bold' : ''}>
                    Followers
                </Text>
            </Pressable>

            <Pressable onPress={() => setActiveTab('following')}>
                <Text className={activeTab === 'following' ? 'font-bold' : ''}>
                    Following
                </Text>
            </Pressable>
        </View>
    )

    return (
        <SafeAreaView className='flex-1 bg-secondary' edges={['top']}>
            {/* Header */}
            <Header />

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#7B4A2E" />
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <UserItem user={item} />}
                    overScrollMode="never"
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="flex-1 items-center mt-20">
                            <Text className="text-gray-400">No users found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    )
}


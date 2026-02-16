import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { authFetch } from '@/services/authFetch'
import defaultAvatar from '@/assets/images/profile.png'
import UserItem from '@/components/UserItem'

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface FollowUser {
    _id: string,
    username: string,
    profile_picture?: string,
    is_followed: boolean
}

export default function FollowScreen() {
    const { user: currentUser, token, logout } = useAuth()
    const { id, tab = 'followers' } = useLocalSearchParams<{ id?: string, tab?: string }>()
    const [activeTab, setActiveTab] = useState(tab)
    const [data, setData] = useState<FollowUser[]>([])
    const [loading, setLoading] = useState(true)

    const isMe = id === undefined || id === currentUser?._id


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                let endpoint: string

                if (activeTab === 'followers') {
                    endpoint = isMe ? 'followers/me' : `followers/${id}`;
                } else {
                    endpoint = isMe ? 'following/me' : `following/${id}`;
                }

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
    }, [activeTab, id, isMe])

    const Header = () => (
        <View className='flex-row justify-center gap-16 py-4 border-b border-gray-200'>
            <Pressable onPress={() => setActiveTab('followers')}>
                <Text className={`text-lg ${activeTab === 'followers' ? 'font-bold text-primary' : 'text-gray-500'}`}>
                    Followers
                </Text>
            </Pressable>

            <Pressable onPress={() => setActiveTab('following')}>
                <Text className={`text-lg ${activeTab === 'following' ? 'font-bold text-primary' : 'text-gray-500'}`}>
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
                    renderItem={({ item }) => <UserItem item={item} isMe={isMe} />}
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


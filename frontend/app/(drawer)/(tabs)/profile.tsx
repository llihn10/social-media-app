import React, { useState, useEffect, useCallback, useRef } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { ActivityIndicator, Alert, FlatList, Text, View, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import PostCard from '@/components/PostCard'
import { authFetch } from '@/services/authFetch'
import ProfileHeader from '@/components/ProfileHeader'
import { ImagePlus, Plus } from 'lucide-react-native'
import { API_URL } from '@/config/api'

export default function ProfileScreen() {
    const { user, token, logout } = useAuth()

    const [profile, setProfile] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const postNum = posts?.length;

    const firstLoad = useRef(true);

    useEffect(() => {
        if (user) {
            setProfile((prev: any) => ({ ...prev, ...user }))
        }
    }, [user])

    const loadData = async (isRefresh = false) => {
        if (!token) return;
        try {
            if (!isRefresh) setLoading(true);
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
            if (!profileRes || !postsRes) return;

            if (!profileRes.ok || !postsRes.ok) {
                // throw new Error('Fetch failed');
                Alert.alert('Error', 'Failed to load data');
            }

            if (!profileRes.ok) {
                // console.log('Profile error:', profileRes.status);
                // throw new Error('Profile fetch failed');
                Alert.alert('Error', 'Failed to load profile');
            }

            if (!postsRes.ok) {
                // console.log('Posts error:', postsRes.status);
                // throw new Error('Posts fetch failed');
                Alert.alert('Error', 'Failed to load posts');
            }

            const profileJson = await profileRes.json()
            const postsJson = await postsRes.json()

            setProfile(profileJson.data)
            setPosts(postsJson.data || [])
        } catch (err) {
            // console.error(err);
            Alert.alert('Error', 'Failed to load data')
        } finally {
            setLoading(false);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData(true);
        setRefreshing(false);
    }

    useFocusEffect(
        useCallback(() => {
            if (!token) return;
            if (firstLoad.current) {
                firstLoad.current = false;
                loadData(false);
            } else {
                loadData(true);
            }
        }, [token])
    );

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
                renderItem={({ item }) => (<PostCard post={item} profileId={profile?._id} />)}

                contentContainerStyle={{
                    paddingBottom: 40,
                    flexGrow: 1
                }}

                ListHeaderComponent={<ProfileHeader profile={profile} postNum={postNum} />}
                ItemSeparatorComponent={() => (<View className="border-t border-gray-200" />)}

                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center px-10 py-12">
                        <View className="bg-gray-100 p-8 rounded-full mb-6">
                            <ImagePlus size={48} color="#9CA3AF" strokeWidth={1.5} />
                        </View>

                        <Text className="text-dark-100 text-xl font-bold text-center">
                            Share your first story
                        </Text>

                        <Text className="text-gray-500 text-center mt-3 leading-5 text-base">
                            Your profile looks a bit quiet. Start capturing and sharing your moments with others!
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.push('/(drawer)/(tabs)/newPost')}
                            activeOpacity={0.7}
                            className="mt-8 flex-row items-center px-8 py-4 bg-[#7B4A2E] rounded-full shadow-md"
                        >
                            <Plus size={20} color="white" strokeWidth={3} className="mr-3" />
                            <Text className="text-white font-semibold text-lg ml-2">Create Post</Text>
                        </TouchableOpacity>
                    </View>
                }

                showsVerticalScrollIndicator={false}

                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7B4A2E" colors={["#7B4A2E"]} />
                }
            />
        </SafeAreaView>
    )
}
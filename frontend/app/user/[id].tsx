import PostCard from "@/components/PostCard";
import ProfileHeader from "@/components/ProfileHeader";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/services/authFetch";
import { useLocalSearchParams } from "expo-router";
import { Layers } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function UserProfile() {
    const { user, token, logout } = useAuth()
    const { id } = useLocalSearchParams<{ id: string }>()
    const [profile, setProfile] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const postNum = posts?.length

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, postsRes] = await Promise.all([
                    authFetch(`${API_URL}/user/${id}`,
                        {},
                        token,
                        logout
                    ),
                    authFetch(`${API_URL}/posts/user/${id}`,
                        {},
                        token,
                        logout
                    )
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
            } catch (error) {
                console.error(error)
                Alert.alert('Error', 'Failed to load data')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [id])

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

                contentContainerStyle={{
                    paddingBottom: 40,
                    flexGrow: 1
                }}

                ListHeaderComponent={<ProfileHeader profile={profile} postNum={postNum} />}
                ItemSeparatorComponent={() => (<View className="border-t border-gray-200" />)}
                showsVerticalScrollIndicator={false}

                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center px-10 py-20">
                        <View className="bg-gray-100/50 p-6 rounded-full mb-4 border border-gray-100">
                            <Layers size={42} color="#9CA3AF" strokeWidth={1.2} />
                        </View>

                        <Text className="text-dark-100 text-lg font-semibold text-center">
                            No posts yet
                        </Text>

                        <Text className="text-gray-400 text-center mt-2 leading-5 text-sm">
                            When <Text className="font-medium text-gray-500">@{profile?.username}</Text> shares posts, they will appear here.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    )
}
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import defaultAvatar from '@/assets/images/profile.png'
import { router } from 'expo-router';
import { FollowUser } from '@/app/follow';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';

const API_URL = process.env.EXPO_PUBLIC_API_URL

interface UserItemProps {
    item: FollowUser,
    isMe: boolean
}

const UserItem: React.FC<UserItemProps> = ({ item, isMe }) => {

    const { user, token, logout } = useAuth()
    const [isFollowing, setIsFollowing] = useState(item.is_followed)
    const [loading, setLoading] = useState(false)

    const navigateToProfile = () => {
        router.push({
            pathname: '/user/[id]',
            params: { id: item._id }
        });
    };

    // follow/unfollow action
    const handleFollow = async () => {
        try {
            const method = isFollowing ? 'DELETE' : 'POST'

            const res = await authFetch(`${API_URL}/users/follow/${item._id}`,
                { method },
                token,
                logout
            )

            if (!res.ok) throw new Error('Follow failed')

            setIsFollowing(!isFollowing)
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Follow failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <View className='flex-row items-center justify-between px-6 py-4 bg-secondary border-b border-gray-50 gap-3'>
            <TouchableOpacity
                onPress={navigateToProfile}
                activeOpacity={0.7}
            >
                <View className='flex-row items-center flex-1 gap-3'>
                    <Image source={item.profile_picture
                        ? { uri: item.profile_picture }
                        : defaultAvatar}
                        className='w-16 h-16 rounded-full'
                    />
                    <Text className='font-semibold text-lg'>{item.username}</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleFollow}
                disabled={loading}
                className={`px-5 py-2 rounded-xl border ${isFollowing ? 'bg-secondary border-gray-300' : 'bg-primary border-primary'}`}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={isFollowing ? "#000" : "#fff"} />
                ) : (
                    <Text className={`font-bold ${isFollowing ? 'text-dark-100' : 'text-white'}`}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                )}
            </TouchableOpacity>

        </View>

    )
}

export default UserItem
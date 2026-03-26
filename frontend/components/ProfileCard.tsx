import { Image, Pressable, Text, View, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import defaultAvatar from '@/assets/images/profile.png';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import { API_URL } from '@/config/api'

interface ProfileCardProps {
    user: {
        _id: string,
        username: string;
        profile_picture?: string;
        is_followed?: boolean;
    }
}

const ProfileCard = ({ user }: ProfileCardProps) => {
    const { token, logout, user: currentUser } = useAuth();
    const [isFollowed, setIsFollowed] = useState(user.is_followed || false);
    const [loading, setLoading] = useState(false);

    const handleFollow = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const method = isFollowed ? 'DELETE' : 'POST';
            const res = await authFetch(`${API_URL}/users/follow/${user._id}`, { method }, token, logout);
            if (!res) return
            if (!res.ok) throw new Error('Follow failed');
            setIsFollowed(!isFollowed);
        } catch (err) {
            // console.error(err);
            Alert.alert('Error', 'Failed to follow user');
        } finally {
            setLoading(false);
        }
    };

    const navigateToUser = () => {
        if (currentUser?._id === user._id) {
            router.push('/(drawer)/(tabs)/profile');
        } else {
            router.push({
                pathname: '/user/[id]',
                params: { id: user._id },
            });
        }
    };

    return (
        <Pressable onPress={navigateToUser} className='w-44 bg-light-50 rounded-xl py-4 active:opacity-80'>
            {/* Avatar */}
            <View className='items-center mt-2'>
                <Image
                    source={user.profile_picture
                        ? { uri: user.profile_picture }
                        : defaultAvatar}
                    className="w-20 h-20 rounded-full bg-gray-100"
                />
            </View>

            {/* Username */}
            <Text
                className='text-center font-semibold text-lg mt-3'
                numberOfLines={1}>
                {user.username}
            </Text>

            {/* Follow button */}
            {currentUser?._id !== user._id && (
                <Pressable
                    onPress={handleFollow}
                    disabled={loading}
                    className={`rounded-lg py-3 mx-5 mt-2 mb-1 ${isFollowed ? 'bg-gray-200' : 'bg-[#7B4A2E]'}`}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={isFollowed ? '#374151' : '#fff'} />
                    ) : (
                        <Text className={`text-center font-semibold ${isFollowed ? 'text-gray-700' : 'text-white'}`}>
                            {isFollowed ? 'Following' : 'Follow'}
                        </Text>
                    )}
                </Pressable>
            )}
        </Pressable>
    )
}

export default ProfileCard
import { Image, Pressable, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react-native'
import defaultAvatar from '@/assets/images/profile.png'
import { router, useSegments } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { authFetch } from '@/services/authFetch'
import { API_URL } from '@/config/api'

interface ProfileHeaderProps {
    profile: {
        _id: string,
        username: string,
        email: string,
        profile_picture?: string,
        bio?: string,
        followers_count: number,
        following_count: number,
        createdAt: string,
        is_followed?: boolean
    },
    postNum: number
}

const ProfileHeader = ({ profile, postNum }: ProfileHeaderProps) => {
    const { user: currentUser, token, logout } = useAuth()
    const [isFollowed, setIsFollowed] = useState(profile?.is_followed ?? false)
    const [followLoading, setFollowLoading] = useState(false)
    const [followersCount, setFollowersCount] = useState(profile.followers_count)

    const segments = useSegments()
    const isProfileTab = segments[segments.length - 1] === 'profile'
    const showBackButton = !isProfileTab
    const isOwnProfile = currentUser?._id === profile._id

    const handleFollow = async () => {
        setFollowLoading(true)
        try {
            const method = isFollowed ? 'DELETE' : 'POST'
            const res = await authFetch(
                `${API_URL}/users/follow/${profile._id}`,
                { method },
                token,
                logout
            )
            if (!res) return
            if (!res.ok) throw new Error('Follow failed')
            setIsFollowed(!isFollowed)
            setFollowersCount(prev => prev + (isFollowed ? -1 : 1))
        } catch (err) {
            // console.error(err)
            Alert.alert('Error', 'Follow action failed')
        } finally {
            setFollowLoading(false)
        }
    }

    return (
        <View className='bg-secondary px-4 pt-4 pb-8 border-b border-gray-200'>

            {/* Top bar */}
            <View className='flex-row justify-between mb-3'>
                {showBackButton ? (
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft color='#333' size={26} />
                    </TouchableOpacity>
                ) : (
                    <View />
                )}
            </View>

            {/* Avatar + Username */}
            <View className='flex-row items-start gap-4 ml-2'>
                <Image source={profile?.profile_picture
                    ? { uri: profile.profile_picture }
                    : defaultAvatar}
                    className='w-20 h-20 rounded-full bg-gray-100'
                />

                <View className='flex-1'>
                    <View className="flex-row items-center justify-between mt-1 pr-2">
                        <Text className="text-2xl font-bold text-dark-100">{profile.username}</Text>

                        {!isOwnProfile && (
                            <TouchableOpacity
                                onPress={handleFollow}
                                disabled={followLoading}
                                activeOpacity={0.7}
                                className={`px-5 py-2 rounded-full border ${isFollowed ? 'border-gray-300 bg-gray-200' : 'border-[#7B4A2E] bg-[#7B4A2E]'}`}
                            >
                                {followLoading ? (
                                    <ActivityIndicator size="small" color={isFollowed ? '#374151' : '#fff'} />
                                ) : (
                                    <Text className={`text-sm font-semibold ${isFollowed ? 'text-gray-700' : 'text-white'}`}>
                                        {isFollowed ? 'Following' : 'Follow'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Bio */}
                    <Text className='text-base font-normal text-dark-200 mt-3'>{profile.bio}</Text>
                </View>
            </View>

            {/* Stats */}
            <View className="flex-row justify-around mt-6">
                <View className="items-center">
                    <Text className="text-xl font-semibold text-dark-400">{postNum}</Text>
                    <Text className="text-light-400">stories</Text>
                </View>
                <Pressable onPress={() => router.push({
                    pathname: '/follow',
                    params: { id: profile._id, tab: 'followers' }
                })}>
                    <View className="items-center">
                        <Text className="text-xl font-semibold text-dark-400">{followersCount}</Text>
                        <Text className="text-light-400">followers</Text>
                    </View>
                </Pressable>

                <Pressable onPress={() => router.push({
                    pathname: '/follow',
                    params: { id: profile._id, tab: 'following' }
                })}>
                    <View className="items-center">
                        <Text className="text-xl font-semibold text-dark-400">{profile.following_count}</Text>
                        <Text className="text-light-400">following</Text>
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

export default ProfileHeader
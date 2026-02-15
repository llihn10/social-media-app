import { Image, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { MoreHorizontal } from 'lucide-react-native'
import defaultAvatar from '@/assets/images/profile.png'

interface ProfileHeaderProps {
    profile: {
        _id: string,
        username: string;
        email: string,
        profile_picture?: string;
        bio?: string,
        followers_count: number,
        following_count: number,
        createdAt: string
    },
    postNum: number
}

const ProfileHeader = ({ profile, postNum }: ProfileHeaderProps) => {
    return (
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
                        <Text className="text-2xl font-bold text-dark-100">{profile.username}</Text>
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
                    <Text className="text-xl font-semibold text-dark-400">{postNum}</Text>
                    <Text className="text-light-400">stories</Text>
                </View>
                <View className="items-center">
                    <Text className="text-xl font-semibold text-dark-400">{profile.followers_count}</Text>
                    <Text className="text-light-400">followers</Text>
                </View>
                <View className="items-center">
                    <Text className="text-xl font-semibold text-dark-400">{profile.following_count}</Text>
                    <Text className="text-light-400">following</Text>
                </View>
            </View>
        </View>
    )
}

export default ProfileHeader
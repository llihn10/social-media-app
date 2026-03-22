import { Image, Pressable, Text, View } from 'react-native'
import React from 'react'
import defaultAvatar from '@/assets/images/profile.png'

interface ProfileCardProps {
    user: {
        _id: string,
        username: string;
        profile_picture?: string;
    }
}

const ProfileCard = ({ user }: ProfileCardProps) => {
    return (
        <View className='w-44 bg-light-50 rounded-xl py-4'>
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
            <Pressable className='bg-primary rounded-lg py-3 mx-5 mt-2 mb-1'>
                <Text className='text-white text-center font-semibold'>Follow</Text>
            </Pressable>
        </View>
    )
}

export default ProfileCard
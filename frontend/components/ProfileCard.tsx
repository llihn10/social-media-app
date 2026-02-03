import { Image, Pressable, Text, View } from 'react-native'
import React from 'react'

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
                    source={{ uri: user.profile_picture }}
                    className="w-20 h-20 rounded-full"
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
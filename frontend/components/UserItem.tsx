import { Image, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import defaultAvatar from '@/assets/images/profile.png'

interface UserItemProps {
    user: {
        _id: string,
        username: string,
        profile_picture?: string,
        is_followed: boolean
    }
}
const UserItem = ({ user }: UserItemProps) => {
    return (
        <TouchableOpacity>
            <View>
                <Image source={user?.profile_picture
                    ? { uri: user.profile_picture }
                    : defaultAvatar}
                    className='w-20 h-20 rounded-full'
                />
            </View>
            <Text>{user.username}</Text>
        </TouchableOpacity>
    )
}

export default UserItem
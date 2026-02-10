import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileScreen() {
    const { user } = useAuth()

    if (!user) return <Text>Please login</Text>

    return (
        <SafeAreaView>
            <Text>{user.username}</Text>
            <Text>{user.email}</Text>
        </SafeAreaView>
    )
}
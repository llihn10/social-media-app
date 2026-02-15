import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function FollowScreen() {
    return (
        <View>
            {/* Header */}
            <View>
                <Pressable>
                    <Text> Followers</Text>
                </Pressable>

                <Pressable>
                    <Text>Following</Text>
                </Pressable>

            </View>

        </View >
    )
}
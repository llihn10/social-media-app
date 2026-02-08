import { Link } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const profile = () => {
    return (
        <SafeAreaView>
            <Text>profile</Text>

            <Link href="/login" className="text-8xl text-blue-500">
                Login
            </Link>
        </SafeAreaView>


    )
}

export default profile

const styles = StyleSheet.create({})
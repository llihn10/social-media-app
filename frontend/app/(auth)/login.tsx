import { Image, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '@/constants/icons'
import AuthInput from '@/components/AuthInput'
import { router } from 'expo-router'

const LoginScreen = () => {
    return (
        <SafeAreaView className='flex-1 bg-secondary'>
            <View className='flex-1 items-center justify-center'>

                {/* Logo */}
                <Image
                    source={icons.hut_512}
                    className='w-44 h-44'
                    resizeMode='contain'
                />
                <Text className='text-6xl font-semibold text-primary mt-8 mb-9'>The Hut</Text>

                {/* Input fields */}
                <View className='w-10/12 gap-3'>

                    <View className='gap-3'>
                        <Text className='text-[#555] text-lg font-medium'>Username or email</Text>
                        <AuthInput placeholder='Enter your username or email address' />
                    </View>

                    <View className='gap-3'>
                        <Text className='text-[#555] text-lg font-medium'>Password</Text>
                        <AuthInput placeholder='Enter your password' />
                    </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    className="bg-primary w-10/12 h-14 rounded-xl items-center justify-center mt-8 shadow-sm"
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-lg font-semibold">Log in</Text>
                </TouchableOpacity>

                {/* Forgot Password Links */}
                <TouchableOpacity className='mt-10' activeOpacity={0.8}>
                    <Text className='text-dark-200 font-semibold text-base'>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Signup Navigation */}
                <View className='flex-row mt-5 gap-1'>
                    <Text className='text-dark-200'>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                        <Text className='font-semibold text-success'>Sign up</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    )
}

export default LoginScreen

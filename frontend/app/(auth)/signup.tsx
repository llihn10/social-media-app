import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '@/constants/icons'
import AuthInput from '@/components/AuthInput'
import { router } from 'expo-router'

const SignupScreen = () => {

    const [form, setForm] = useState({
        email: '',
        username: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSignup = async () => {
        if (!form.email || !form.username || !form.password) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }

        try {
            setLoading(true)

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: form.email,
                    username: form.username,
                    password: form.password
                })
            })
            const data = await response.json()

            if (response.ok) {
                console.log('Signup successfully: ', data)
                router.replace('/(tabs)/home')
            } else {
                Alert.alert('Signup failed', data.message || 'Invalid credentials')
            }
        } catch (error) {
            console.error(error)
            Alert.alert('Error', 'Something went wrong. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

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
                        <Text className='text-[#555] text-lg font-medium'>Email</Text>
                        <AuthInput
                            placeholder='Enter your email address'
                            value={form.email}
                            onChangeText={(text: string) => setForm({ ...form, email: text })}
                        />
                    </View>

                    <View className='gap-3'>
                        <Text className='text-[#555] text-lg font-medium'>Username</Text>
                        <AuthInput
                            placeholder='Enter your username'
                            value={form.username}
                            onChangeText={(text: string) => setForm({ ...form, username: text })}
                        />
                    </View>

                    <View className='gap-3'>
                        <Text className='text-[#555] text-lg font-medium'>Password</Text>
                        <AuthInput
                            secureTextEntry
                            placeholder='Enter your password'
                            value={form.password}
                            onChangeText={(text: string) => setForm({ ...form, password: text })}
                        />
                    </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    className="bg-primary w-10/12 h-14 rounded-xl items-center justify-center mt-8 shadow-sm"
                    activeOpacity={0.8}
                    onPress={handleSignup}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-lg font-semibold">Sign up</Text>
                    )}
                </TouchableOpacity>

                {/* Login Navigation */}
                <View className='flex-row mt-8 gap-1'>
                    <Text className='text-dark-200'>Have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text className='font-semibold text-success'>Log in</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    )
}

export default SignupScreen

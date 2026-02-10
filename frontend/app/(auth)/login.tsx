import { Alert, Image, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '@/constants/icons'
import AuthInput from '@/components/AuthInput'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'

const LoginScreen = () => {

    const [form, setForm] = useState({
        identifier: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()

    const handleLogin = async () => {
        if (!form.identifier || !form.password) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }

        try {
            setLoading(true)

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: form.identifier,
                    password: form.password
                })
            })
            const data = await response.json()

            if (response.ok) {
                console.log('Login successfully: ', data)
                login(data.token, data.user)
                router.replace('/(tabs)')
            } else {
                Alert.alert('Login failed', data.message || 'Invalid credentials')
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
                        <Text className='text-[#555] text-lg font-medium'>Username or email</Text>
                        <AuthInput
                            placeholder='Enter your username or email address'
                            value={form.identifier}
                            onChangeText={(text: string) => setForm({ ...form, identifier: text })}
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
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-lg font-semibold">Log in</Text>
                    )}
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

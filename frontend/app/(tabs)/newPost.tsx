import { router } from 'expo-router'
import { Camera, ImageIcon } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { authFetch } from '@/services/authFetch'
import defaultAvatar from '@/assets/images/profile.png'
import * as ImagePicker from 'expo-image-picker'

const API_URL = process.env.EXPO_PUBLIC_API_URL

const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
    })

    if (!result.canceled) {
        const images = result.assets
        console.log(images)
    }
}

export default function NewPostScreen() {
    const { user, token, logout } = useAuth()
    const [content, setContent] = useState('')

    const uploadImages = async (images: any[]) => {
        const formData = new FormData()

        images.forEach((img, index) => {
            formData.append('media', {
                uri: img.uri,
                name: `photo_${index}.jpg`,
                type: 'image/jpeg',
            } as any)
        })

        const response = await fetch(`${API_URL}/api/posts/create`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        })

        return response.json()
    }


    // useEffect(() => {
    //     if (!token) return
    //     const loadData = async () => {
    //         try {

    //             const profileRes = await authFetch(`${API_URL}/profile`,
    //                 {},
    //                 token,
    //                 logout
    //             )

    //             if (!profileRes.ok) {
    //                 throw new Error('Fetch failed');
    //             }

    //             const profileJson = await profileRes.json()

    //             setProfile(profileJson.data)
    //         } catch (err) {
    //             console.error(err);
    //             setError('Failed to load data')
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     loadData()
    // }, [token])

    // if (!user) {
    //     return (
    //         <SafeAreaView className="flex-1 items-center justify-center">
    //             <Text>Please login</Text>
    //         </SafeAreaView>
    //     )
    // }

    // if (loading) {
    //     return (
    //         <SafeAreaView className="flex-1 items-center justify-center">
    //             <ActivityIndicator size="large" />
    //         </SafeAreaView>
    //     )
    // }

    // if (error) {
    //     return (
    //         <SafeAreaView className="flex-1 items-center justify-center">
    //             <Text>{error}</Text>
    //             <Text>{user.username}</Text>
    //         </SafeAreaView>
    //     )
    // }

    return (
        <SafeAreaView className='flex-1 bg-secondary'>

            {/* Header */}
            <View className='flex-row items-center justify-between px-6 py-4 border-b border-gray-200'>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className='text-lg text-dark-200'>Cancel</Text>
                </TouchableOpacity>

                <Text className='text-lg font-bold'>New story</Text>

                <TouchableOpacity>
                    <Text className='text-lg font-semibold text-accent'>Post</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className='flex-1'
            >
                <View className='flex-1 px-4 py-5'>
                    <View className='flex-row'>
                        {/* User avatar */}
                        {/* <Image source={profile?.profile_picture
                            ? { uri: profile.profile_picture }
                            : defaultAvatar}
                            className='w-20 h-20 rounded-full'
                        /> */}
                        <Image source={defaultAvatar} className='w-10 h-10 rounded-full' />

                        <View className='flex-1 ml-3'>
                            {/* Username */}
                            <Text className='text-lg font-semibold text-dark-100 ml-1'>{user?.username}</Text>

                            {/* Input field */}

                            <TextInput
                                value={content}
                                onChangeText={setContent}
                                placeholder='Tell a story...'
                                placeholderTextColor="#A0A0A0"
                                multiline
                                className="text-lg text-dark-100"
                                textAlignVertical='top'
                                style={{ minHeight: 60 }}
                            />

                            {/* Media icons */}
                            <View className='flex-row gap-6 mt-2 ml-1'>
                                {/* Upload photos */}
                                <TouchableOpacity>
                                    <ImageIcon size={25} color="#B2B2B2" />
                                </TouchableOpacity>

                                {/* Take photos  */}
                                <TouchableOpacity>
                                    <Camera size={27} color="#B2B2B2" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

            </KeyboardAvoidingView>

        </SafeAreaView>
    )
}
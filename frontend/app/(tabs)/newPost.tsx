import { router } from 'expo-router'
import { Camera, ImageIcon } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { authFetch } from '@/services/authFetch'
import defaultAvatar from '@/assets/images/profile.png'
import * as ImagePicker from 'expo-image-picker'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export default function NewPostScreen() {
    const { user, token, logout } = useAuth()
    const [content, setContent] = useState('')
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const avatarUri =
        user?.profile_picture && user.profile_picture.trim() !== ''
            ? user.profile_picture
            : null

    const uploadPost = async () => {
        try {
            const formData = new FormData()

            // append content
            formData.append('content', content)

            // append images
            images.forEach((img, index) => {
                formData.append('media', {
                    uri: img.uri,
                    name: img.fileName || `photo_${index}.jpg`,
                    type: img.type === 'image' ? 'image/jpeg' : img.mimeType || 'image/jpeg',
                } as any)
            })

            const res = await authFetch(`${API_URL}/posts/create`,
                {
                    method: 'POST',
                    body: formData
                },
                token,
                logout
            )

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Upload failed')
            }

            return data

        } catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    const handlePost = async () => {
        if (!content.trim()) {
            Alert.alert('Content is required')
            return
        }

        try {
            setLoading(true)

            const result = await uploadPost()

            if (result) {
                Alert.alert('Success', 'Post created successfully!')

                setContent('')
                setImages([])

                router.replace('/(tabs)')
            }
        } catch (error: any) {
            Alert.alert('Error', error.message)
        } finally {
            setLoading(false)
        }
    }

    // pick image from library - open device's library
    const pickImage = async () => {
        // ask for permission
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            Alert.alert('Permission required', 'Please allow access to photos')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            allowsEditing: false,
            quality: 1,
        })

        if (!result.canceled) {
            const validAssets = result.assets.filter(asset => asset.uri)

            setImages(prev => {
                const newImages = [...prev, ...validAssets]
                return newImages.slice(0, 5)
            })
        }
    }

    // take photo - open device's camera
    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()

        if (!permission.granted) {
            Alert.alert('Permission required', 'Please allow camera access')
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 1,
        })

        if (!result.canceled) {
            const validAssets = result.assets.filter(asset => asset.uri)

            setImages(prev => {
                const newImages = [...prev, ...validAssets]
                return newImages.slice(0, 5)
            })
        }
    }

    return (
        <SafeAreaView className='flex-1 bg-secondary'>

            {/* Header */}
            <View className='flex-row items-center justify-between px-6 py-4 border-b border-gray-200'>
                <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                    <Text className='text-lg text-dark-200'>Cancel</Text>
                </TouchableOpacity>

                <Text className='text-lg font-bold'>New story</Text>

                <TouchableOpacity
                    onPress={handlePost}
                    disabled={!content.trim()}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#3B82F6" />
                    ) : (
                        <Text className={`text-lg font-semibold ${content.trim() ? 'text-accent' : 'text-gray-400'}`}                    >
                            Post
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className='flex-1'
            >
                <View className='flex-1 px-4 py-5'>
                    <View className='flex-row'>
                        {/* User avatar */}
                        <Image
                            source={avatarUri ? { uri: avatarUri } : defaultAvatar}
                            className='w-10 h-10 rounded-full'
                        />

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
                                style={{ minHeight: 50 }}
                            />
                        </View>
                    </View>

                    {images.length > 0 && (
                        <ScrollView
                            horizontal
                            className="max-h-64 mb-2"
                            showsHorizontalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            decelerationRate="fast"
                            snapToAlignment="start"
                            scrollEventThrottle={16}
                            contentContainerStyle={{ paddingLeft: 48, paddingRight: 12, gap: 4 }}
                        >
                            {images
                                .filter(img => img?.uri)
                                .map((img, index) => (
                                    <Image
                                        key={index}
                                        source={{ uri: img.uri }}
                                        className="w-64 h-64 rounded-lg"
                                    />
                                ))}
                        </ScrollView>
                    )}

                    {/* Media icons */}
                    <View className='flex-row gap-6 mt-2 ml-14'>
                        {/* Upload photos */}
                        <TouchableOpacity onPress={pickImage}>
                            <ImageIcon size={25} color="#B2B2B2" />
                        </TouchableOpacity>

                        {/* Take photos  */}
                        <TouchableOpacity onPress={takePhoto}>
                            <Camera size={27} color="#B2B2B2" />
                        </TouchableOpacity>
                    </View>
                </View>

            </KeyboardAvoidingView>

        </SafeAreaView >
    )
}
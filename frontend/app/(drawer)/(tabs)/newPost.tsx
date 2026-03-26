import { useNavigation } from '@react-navigation/native'
import { Camera, ImageIcon } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { authFetch } from '@/services/authFetch'
import defaultAvatar from '@/assets/images/profile.png'
import * as ImagePicker from 'expo-image-picker'
import { VideoPreview } from '@/components/VideoPreview'
import { API_URL } from '@/config/api'
import { X } from 'lucide-react-native'

export default function NewPostScreen() {
    const { user, token, logout } = useAuth()
    const [content, setContent] = useState('')
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [contentError, setContentError] = useState<string | null>(null)
    const navigation = useNavigation()

    const avatarUri =
        user?.profile_picture && user.profile_picture.trim() !== ''
            ? user.profile_picture
            : null

    const handleContentChange = (text: string) => {
        if (text.length > 300) {
            const extra = text.length - 300;
            setContentError(`Content exceeds limit (-${extra})`);
        } else {
            setContentError(null);
        }
        setContent(text);
    };

    const uploadPost = async () => {
        try {
            const formData = new FormData()

            // append content
            formData.append('content', content)

            images.forEach((img, index) => {
                formData.append('media', {
                    uri: img.uri,
                    name: img.fileName || `media_${index}`,
                    type: img.mimeType || (img.type === "video" ? "video/mp4" : "image/jpeg"),
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

            if (!res) return;

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
                setContent('')
                setImages([])

                Alert.alert('Success', 'Post created successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('index' as never)
                        }
                    }
                ])
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
            // mediaTypes: ['images'],
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: true,
            allowsEditing: false,
            quality: 1,
        })

        if (!result.canceled) {
            const validAssets = result.assets.filter(asset => {
                if (!asset.uri) return false

                // limit video duration to 15s
                if (asset.type === "video" && asset.duration && asset.duration > 15000) {
                    Alert.alert("Video too long", "Video must be under 15 seconds")
                    return false
                }

                // limit file size
                if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
                    Alert.alert("File too large", "File must be under 50MB")
                    return false
                }

                return true
            })

            setImages(prev => {
                const currentVideos = prev.filter(i => i.type === 'video').length
                const newVideos = validAssets.filter(a => a.type === 'video')
                const newImages = validAssets.filter(a => a.type !== 'video')

                const allowedVideoCount = Math.max(0, 3 - currentVideos)
                if (newVideos.length > allowedVideoCount) {
                    Alert.alert('Video limit', `You can only add ${3 - currentVideos} more video(s). Maximum 3 videos per post.`)
                }

                const accepted = [...newImages, ...newVideos.slice(0, allowedVideoCount)]
                return [...prev, ...accepted].slice(0, 5)
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
            // mediaTypes: ['images'],
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        })

        if (!result.canceled) {
            const validAssets = result.assets.filter(asset => {
                if (!asset.uri) return false

                // limit video duration to 15s
                if (asset.type === "video" && asset.duration && asset.duration > 15000) {
                    Alert.alert("Video too long", "Video must be under 15 seconds")
                    return false
                }

                if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
                    Alert.alert("File too large", "File must be under 50MB")
                    return false
                }

                return true
            })

            setImages(prev => {
                const currentVideos = prev.filter(i => i.type === 'video').length
                const newVideos = validAssets.filter(a => a.type === 'video')
                const newImages = validAssets.filter(a => a.type !== 'video')

                const allowedVideoCount = Math.max(0, 3 - currentVideos)
                if (newVideos.length > allowedVideoCount) {
                    Alert.alert('Video limit', `You can only add ${3 - currentVideos} more video(s). Maximum 3 videos per post.`)
                }

                const accepted = [...newImages, ...newVideos.slice(0, allowedVideoCount)]
                return [...prev, ...accepted].slice(0, 5)
            })
        }
    }

    return (
        <SafeAreaView className='flex-1 bg-secondary'>

            {/* Header */}
            <View className='flex-row items-center justify-between border-b border-gray-100'>
                <View className="px-5 py-3">
                    <Text className="text-2xl font-bold text-gray-900">New story</Text>
                </View>

                <TouchableOpacity
                    className='px-8 py-3'
                    onPress={handlePost}
                    disabled={!!contentError || !content.trim() || loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#D88A3D" />
                    ) : (
                        <Text
                            className={`text-lg font-semibold ${!content.trim() || contentError ? 'text-gray-400' : 'text-accent'
                                }`}
                        >
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
                            className='w-11 h-11 rounded-full bg-gray-100'
                        />

                        <View className='flex-1 ml-3'>
                            {/* Username */}
                            <Text className='text-lg font-semibold text-dark-100 ml-1'>{user?.username}</Text>

                            {/* Input field */}

                            <TextInput
                                value={content}
                                onChangeText={handleContentChange}
                                placeholder='Tell a story...'
                                placeholderTextColor="#A0A0A0"
                                multiline
                                className="text-lg text-dark-100"
                                textAlignVertical='top'
                                style={{ minHeight: 50 }}
                            />

                            {contentError && (
                                <Text style={{ color: '#f05b62', marginTop: 15 }}>
                                    {contentError}
                                </Text>
                            )}
                        </View>
                    </View>

                    {images.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            decelerationRate="fast"
                            snapToAlignment="start"
                            scrollEventThrottle={16}
                            contentContainerStyle={{ paddingLeft: 48, paddingRight: 12, gap: 8 }}
                            style={{ marginBottom: 8, maxHeight: 270 }}
                        >
                            {images
                                .filter(img => img?.uri)
                                .map((img, index) => (
                                    <View key={img.uri || index} style={{ position: 'relative' }}>
                                        {img.type === "video" ? (
                                            <View style={{ width: 200, height: 250, borderRadius: 12, overflow: 'hidden' }}>
                                                <VideoPreview uri={img.uri} />
                                            </View>
                                        ) : (
                                            <Image
                                                source={{ uri: img.uri }}
                                                style={{ width: 200, height: 250, borderRadius: 12 }}
                                            />
                                        )}

                                        {/* Remove button */}
                                        <TouchableOpacity
                                            onPress={() => setImages(prev => prev.filter((_, i) => i !== index))}
                                            style={{
                                                position: 'absolute', top: 6, right: 6,
                                                backgroundColor: 'rgba(0,0,0,0.55)',
                                                borderRadius: 12, width: 24, height: 24,
                                                alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <X size={14} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
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
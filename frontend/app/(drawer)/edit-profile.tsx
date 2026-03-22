import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import * as ImagePicker from 'expo-image-picker';
import defaultAvatar from '@/assets/images/profile.png';
import { Camera } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EditProfileScreen() {
    const { user, token, logout, updateUser } = useAuth();

    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatar, setAvatar] = useState<string | null>(user?.profile_picture || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setBio((user as any).bio || '');
            setAvatar(user.profile_picture || null);
        }
    }, [user]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('bio', bio);

            if (avatar && avatar !== user?.profile_picture) {
                const filename = avatar.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('profile_picture', {
                    uri: avatar,
                    name: filename,
                    type,
                } as any);
            }

            const res = await authFetch(`${API_URL}/profile`, {
                method: 'PATCH',
                body: formData,
            }, token, logout);

            const jsonResponse = await res.json();

            if (!res.ok) {
                throw new Error(jsonResponse.message || 'Update failed');
            }

            // Sync user data in context
            if (jsonResponse.data) {
                await updateUser(jsonResponse.data);
            }

            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>Please login</Text>
            </SafeAreaView>
        )
    }

    return (
        <ScrollView className="flex-1 bg-white px-8 pt-12">
            <View className="items-center mb-8">
                <TouchableOpacity onPress={pickImage} className="relative">
                    <Image
                        source={avatar ? { uri: avatar } : defaultAvatar}
                        className="w-24 h-24 rounded-full bg-gray-50"
                    />
                    <View className="absolute bottom-0 right-0 bg-[#7B4A2E] p-2 rounded-full border-2 border-white">
                        <Camera size={16} color="white" />
                    </View>
                </TouchableOpacity>
            </View>

            <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-4 w-full">Username</Text>
                <TextInput
                    value={username}
                    onChangeText={setUsername}
                    className="border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900 bg-gray-50 focus:border-[#7B4A2E] w-full"
                    placeholder="Enter username"
                    maxLength={30}
                />
            </View>

            <View className="mb-8">
                <Text className="text-gray-700 font-medium mb-4 w-full">Bio</Text>
                <TextInput
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 h-28 focus:border-[#7B4A2E] w-full"
                    placeholder="Write something about yourself..."
                    textAlignVertical="top"
                    maxLength={100}
                />
            </View>

            <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className="bg-[#7B4A2E] rounded-full py-4 items-center mb-[200px]" // extra margin bottom
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-lg font-bold">Save Changes</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

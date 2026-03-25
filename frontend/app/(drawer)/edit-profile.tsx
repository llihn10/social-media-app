import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import * as ImagePicker from 'expo-image-picker';
import defaultAvatar from '@/assets/images/profile.png';
import { Camera } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@/config/api'

export default function EditProfileScreen() {
    const { user, token, logout, updateUser } = useAuth();

    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatar, setAvatar] = useState<string | null>(user?.profile_picture || null);
    const [loading, setLoading] = useState(false);

    const [usernameError, setUsernameError] = useState<string>('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setBio((user as any).bio || '');
            setAvatar(user.profile_picture || null);
        }
    }, [user]);

    useEffect(() => {
        const trimmed = username.trim();

        if (!trimmed) {
            setUsernameError('Username is required');
            setIsCheckingUsername(false);
            return;
        }

        // if username is empty or same as old username, do not check
        if (trimmed === user?.username) {
            setUsernameError('');
            setIsCheckingUsername(false);
            return;
        }

        const usernameRegex = /^[a-z0-9._]{3,30}$/;
        if (!usernameRegex.test(trimmed)) {
            setUsernameError('Only letters, numbers, dots, and underscores allowed (3-30 chars).');
            return;
        }

        // Delay 500ms after stop typing to call API
        const delayDebounceFn = setTimeout(async () => {
            setIsCheckingUsername(true);
            setUsernameError('');

            try {
                const res = await authFetch(`${API_URL}/check-username?username=${trimmed}`, {
                    method: 'GET',
                }, token, logout);

                if (!res) return
                if (!res.ok) {
                    const json = await res.json();
                    setUsernameError(json.message || 'Username already exists');
                }
            } catch (error) {
                console.error('Check username error:', error);
            } finally {
                setIsCheckingUsername(false);
            }
        }, 500);

        // Cleanup function to clear timeout if user continues to type
        return () => clearTimeout(delayDebounceFn);
    }, [username, user?.username, token]);

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
            if (!res) return
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

    const isUsernameValid = username.trim() !== '' && !usernameError && !isCheckingUsername;

    const hasChanges =
        username !== (user?.username || '') ||
        bio !== ((user as any).bio || '') ||
        avatar !== (user?.profile_picture || null);

    const isSaveDisabled = loading || !isUsernameValid || !hasChanges;

    if (!user) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>Please login</Text>
            </SafeAreaView>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    className="flex-1 bg-white px-8 pt-12"
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
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

                        {isCheckingUsername && (
                            <Text className="text-gray-500 text-sm mt-2">Checking availability...</Text>
                        )}
                        {!isCheckingUsername && usernameError ? (
                            <Text className="text-red-500 text-sm mt-2">{usernameError}</Text>
                        ) : null}
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
                        disabled={isSaveDisabled || loading}
                        className={`rounded-full py-4 items-center mb-[200px] ${isSaveDisabled ? 'bg-gray-400' : 'bg-[#7B4A2E]'}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

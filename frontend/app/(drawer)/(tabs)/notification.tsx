import { useState, useEffect } from 'react'
import { Text, View, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import NotificationItem from '@/components/NotificationItem';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { authFetch } from '@/services/authFetch';
import { BellOff } from 'lucide-react-native';
import { API_URL } from '@/config/api'

export default function NotificationScreen() {
    const { user, token, logout } = useAuth()
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { markAsReadLocal } = useNotifications();

    const fetchNotifications = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await authFetch(`${API_URL}/notifications`,
                {
                    method: 'GET',
                },
                token,
                logout
            )
            if (!res) return;

            const data = await res.json();

            setNotifications(data);
        } catch (error) {
            // console.error(error);
            Alert.alert('Error', 'Failed to load notifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchNotifications();

        // call API to mark all notifications as read when just entering the page
        authFetch(`${API_URL}/notifications/mark-read`, {
            method: 'POST',
        },
            token,
            logout
        );

        // Reset state Badge on Tab Bar immediately
        markAsReadLocal();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-secondary" edges={['top']}>
            <View className="px-5 py-3 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <NotificationItem
                        item={item}
                        onPress={() => item.post && router.push(`/post/${item.post}`)}
                    />
                )}
                contentContainerStyle={notifications.length === 0 ? { flexGrow: 1 } : {}}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7B4A2E" />
                }
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center px-10">
                        <View className="bg-gray-100 p-6 rounded-full mb-6">
                            <BellOff size={48} color="#9CA3AF" strokeWidth={1.5} />
                        </View>

                        <Text className="text-gray-900 text-xl font-bold text-center">
                            No notifications yet
                        </Text>

                        <Text className="text-gray-400 text-center mt-3 leading-5 text-base">
                            When you get likes, comments or new followers, they'll show up right here.
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.push('/(drawer)/(tabs)')}
                            className="mt-8 px-8 py-3 bg-[#7B4A2E] rounded-full"
                        >
                            <Text className="text-white font-semibold">Explore Feed</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
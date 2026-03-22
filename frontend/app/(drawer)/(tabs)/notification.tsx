import { useState, useEffect } from 'react'
import { Text, View, FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import NotificationItem from '@/components/NotificationItem';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { authFetch } from '@/services/authFetch';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
            const data = await res.json();
            // console.log(data);
            setNotifications(data);
        } catch (error) {
            console.error(error);
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
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
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
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7B4A2E" />
                }
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center mt-20">
                        <Text className="text-gray-400 text-base">No notifications yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity, Alert } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { API_URL } from '@/config/api'
import { authFetch } from '@/services/authFetch';
import { useNavigation } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/routers';

const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
    <View className="p-5 rounded-2xl m-2 flex-1" style={{ backgroundColor: color }}>
        <Text className="text-white text-sm opacity-80">{title}</Text>
        <Text className="text-white text-2xl font-bold mt-1">{value.toLocaleString()}</Text>
    </View>
);

export default function AdminDashboard() {
    const { user, token, logout } = useAuth()
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const navigation = useNavigation()

    const fetchStats = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await authFetch(`${API_URL}/admin/stats`,
                {
                    method: 'GET',
                },
                token,
                logout
            )
            if (!res) return;

            const data = await res.json();

            setStats(data);
        } catch (error) {
            // console.error(error);
            Alert.alert('Error', 'Failed to fetch stats');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchStats();
    }, [token]);

    return (
        <SafeAreaView className="flex-1 bg-secondary">
            <ScrollView className="p-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7B4A2E" />
                }
            >

                <View className='flex-row items-center justify-between px-4 mb-4'>
                    <Text className='text-2xl font-semibold text-dark-100'>Admin Insights</Text>
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="p-1">
                        <Menu size={26} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                {/* Summary Cards */}
                <View className="flex-row justify-between">
                    <StatCard title="Total Users" value={stats?.summary.totalUsers || 0} color="#4F46E5" />
                    <StatCard title="Total Posts" value={stats?.summary.totalPosts || 0} color="#10B981" />
                </View>
                <View className="flex-row justify-between">
                    <StatCard title="Comments" value={stats?.summary.totalComments || 0} color="#F59E0B" />
                    <StatCard title="Reports" value={0} color="#EF4444" />
                </View>

                {/* Trending Posts List */}
                <View className="mt-8 m-2 bg-white p-5 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-3">Trending Posts</Text>
                    {stats?.trendingPosts.map((post: any) => (
                        <View key={post._id} className="flex-row justify-between py-5 border-b border-gray-100">
                            <View className="flex-1 pr-4">
                                <Text numberOfLines={1} className="font-medium">{post.content}</Text>
                                <Text className="text-sm text-gray-400 mt-1">by @{post.author.username}</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-primary font-bold">{post.likes_count} likes</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
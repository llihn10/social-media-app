import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import { API_URL } from '@/config/api';
import { MessageCircle, MessageSquarePlus } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';

export default function ChatInboxScreen() {
    const { user, token, logout } = useAuth();
    const params = useLocalSearchParams();

    const [listData, setListData] = useState<any[]>([]);
    const [loadingInbox, setLoadingInbox] = useState(true);

    const fetchData = async () => {
        try {
            setLoadingInbox(true);
            const [inboxRes, mutualRes] = await Promise.all([
                authFetch(`${API_URL}/messages/inbox`, {}, token, logout),
                authFetch(`${API_URL}/users/mutual`, {}, token, logout)
            ]);

            if (inboxRes && inboxRes.ok && mutualRes && mutualRes.ok) {
                const inboxData = await inboxRes.json();
                const mutualData = await mutualRes.json();

                // Get all user IDs we already have conversations with
                const conversationsUserIds = new Set();
                inboxData.forEach((conv: any) => {
                    const otherUser = conv.participants.find((p: any) => p._id !== user?._id) || conv.participants[0];
                    if (otherUser) {
                        conversationsUserIds.add(String(otherUser._id));
                    }
                });

                // Filter out mutual users who already have a conversation
                const newMutuals = mutualData.filter((u: any) => !conversationsUserIds.has(String(u._id)));

                // Format mutuals so they can be rendered in the same FlatList
                const suggestions = newMutuals.map((u: any) => ({
                    _id: `suggestion_${u._id}`,
                    isSuggestion: true,
                    targetUser: u
                }));

                setListData([...inboxData, ...suggestions]);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoadingInbox(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const handleStartConversation = async (targetUserId: string) => {
        try {
            setLoadingInbox(true);
            const res = await authFetch(`${API_URL}/messages/conversation`, {
                method: 'POST',
                body: JSON.stringify({ targetUserId })
            }, token, logout);

            if (res && res.ok) {
                const conversation = await res.json();
                router.setParams({ targetUserId: '' });
                router.push({
                    pathname: "/chat/[id]",
                    params: { id: conversation._id },
                });
            } else if (res && res.status === 403) {
                const errorData = await res.json();
                Alert.alert("Permission Denied", errorData.message || "You cannot chat with this user.");
            }
        } catch (error) {
            console.error("Failed to start conversation:", error);
        } finally {
            setLoadingInbox(false);
        }
    };

    useEffect(() => {
        if (params.targetUserId && user) {
            handleStartConversation(params.targetUserId as string);
        }
    }, [params.targetUserId, user]);

    // Render components
    const renderInboxItem = ({ item }: { item: any }) => {
        const defaultAvatar = 'https://via.placeholder.com/150';

        if (item.isSuggestion) {
            const otherUser = item.targetUser;
            return (
                <TouchableOpacity
                    className="flex-row items-center p-4 bg-white border-b border-gray-100"
                    onPress={() => handleStartConversation(otherUser._id)}
                >
                    <Image
                        source={{ uri: otherUser?.profile_picture || defaultAvatar }}
                        className="w-14 h-14 rounded-full bg-gray-200"
                    />
                    <View className="ml-4 flex-1">
                        <Text className="text-lg font-semibold text-dark-100">{otherUser?.username || 'User'}</Text>
                        <Text className="text-[#7B4A2E] mt-1 font-medium italic">Start a conversation...</Text>
                    </View>
                    <MessageSquarePlus size={20} color="#7B4A2E" />
                </TouchableOpacity>
            );
        }

        const otherUser = item.participants.find((p: any) => p._id !== user?._id) || item.participants[0];
        const lastMessage = item.lastMessage;

        return (
            <TouchableOpacity
                className="flex-row items-center p-4 bg-white border-b border-gray-100"
                onPress={() => router.push({
                    pathname: "/chat/[id]",
                    params: { id: item._id },
                })}
            >
                <Image
                    source={{ uri: otherUser?.profile_picture || defaultAvatar }}
                    className="w-14 h-14 rounded-full bg-gray-200"
                />
                <View className="ml-4 flex-1">
                    <Text className="text-lg font-semibold text-dark-100">{otherUser?.username || 'User'}</Text>
                    {lastMessage ? (
                        <Text className="text-gray-500 mt-1" numberOfLines={1}>
                            {lastMessage.sender === user?._id ? 'You: ' : ''}{lastMessage.content}
                        </Text>
                    ) : (
                        <Text className="text-gray-400 mt-1 italic">No messages yet</Text>
                    )}
                </View>

                {lastMessage?.createdAt && !isNaN(new Date(lastMessage.createdAt).getTime()) && (
                    <Text className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-secondary items-center justify-center">
                <Text>Please login</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-secondary" edges={['top']}>
            <View className="pt-4 pb-4 px-4 border-b border-gray-100 bg-secondary">
                <Text className="text-2xl font-bold text-dark-100">Messages</Text>
            </View>
            {loadingInbox ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#7B4A2E" />
                </View>
            ) : listData.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                    <MessageCircle size={60} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-4 text-center">No messages yet.{'\n'}Find some friends!</Text>
                </View>
            ) : (
                <FlatList
                    data={listData}
                    keyExtractor={(item) => item._id}
                    renderItem={renderInboxItem}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
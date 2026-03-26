import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator, Image, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import { API_URL } from '@/config/api';
import { MessageCircle, MessageSquarePlus } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';
import defaultAvatar from '@/assets/images/profile.png';

export default function ChatInboxScreen() {
    const { user, token, logout } = useAuth();
    const params = useLocalSearchParams();

    const [sections, setSections] = useState<any[]>([]);
    const [loadingInbox, setLoadingInbox] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

                const conversationsUserIds = new Set();
                inboxData.forEach((conv: any) => {
                    const otherUser = conv.participants.find((p: any) => p._id !== user?._id) || conv.participants[0];
                    if (otherUser) {
                        conversationsUserIds.add(String(otherUser._id));
                    }
                });

                // sort conversations by last message time (newest first)
                const sortedInbox = [...inboxData].sort((a: any, b: any) => {
                    const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
                    const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
                    return timeB - timeA;
                });

                // filter out mutual users who already have a conversation
                const newMutuals = mutualData.filter((u: any) => !conversationsUserIds.has(String(u._id)));
                const suggestions = newMutuals.map((u: any) => ({
                    _id: `suggestion_${u._id}`,
                    isSuggestion: true,
                    targetUser: u
                }));

                const newSections: any[] = [];
                if (sortedInbox.length > 0) {
                    newSections.push({ title: 'Conversations', data: sortedInbox });
                }
                if (suggestions.length > 0) {
                    newSections.push({ title: 'Suggested', data: suggestions });
                }
                setSections(newSections);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            Alert.alert("Error", "Failed to fetch data");
        } finally {
            setLoadingInbox(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
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

    const renderItem = ({ item }: { item: any }) => {
        if (item.isSuggestion) {
            const otherUser = item.targetUser;
            return (
                <TouchableOpacity
                    className="flex-row items-center px-4 py-3"
                    activeOpacity={0.6}
                    onPress={() => handleStartConversation(otherUser._id)}
                >
                    <Image
                        source={otherUser?.profile_picture ? { uri: otherUser.profile_picture } : defaultAvatar}
                        className="w-14 h-14 rounded-full bg-gray-200"
                    />
                    <View className="ml-4 flex-1">
                        <Text className="text-lg font-semibold text-dark-100">{otherUser?.username || 'User'}</Text>
                        <Text className="text-sm text-[#7B4A2E] mt-0.5 italic">Tap to start chatting</Text>
                    </View>
                    <View className="bg-[#7B4A2E]/10 p-2 rounded-full">
                        <MessageSquarePlus size={18} color="#7B4A2E" />
                    </View>
                </TouchableOpacity>
            );
        }

        const otherUser = item.participants.find((p: any) => p._id !== user?._id) || item.participants[0];
        const lastMessage = item.lastMessage;

        return (
            <TouchableOpacity
                className="flex-row items-center px-4 py-3"
                activeOpacity={0.6}
                onPress={() => router.push({
                    pathname: "/chat/[id]",
                    params: { id: item._id },
                })}
            >
                <Image
                    source={otherUser?.profile_picture ? { uri: otherUser.profile_picture } : defaultAvatar}
                    className="w-14 h-14 rounded-full bg-gray-200"
                />
                <View className="ml-4 flex-1 mr-3">
                    <Text className="text-lg font-semibold text-dark-100">{otherUser?.username || 'User'}</Text>
                    {lastMessage ? (
                        <Text className="text-base text-gray-500 mt-0.5" numberOfLines={1}>
                            {lastMessage.sender === user?._id ? 'You: ' : ''}{lastMessage.content}
                        </Text>
                    ) : (
                        <Text className="text-base text-gray-400 mt-0.5 italic">No messages yet</Text>
                    )}
                </View>
                {lastMessage?.createdAt && !isNaN(new Date(lastMessage.createdAt).getTime()) && (
                    <Text className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = ({ section }: { section: any }) => (
        <View className="bg-secondary px-4 pt-4 pb-2">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">{section.title}</Text>
        </View>
    );

    const renderSeparator = () => (
        <View className="ml-[82px] mr-4 border-b border-gray-100" />
    );

    const totalItems = sections.reduce((acc, s) => acc + s.data.length, 0);

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-secondary items-center justify-center">
                <Text>Please login</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-secondary" edges={['top']}>
            <View className="px-5 py-3 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Messages</Text>
            </View>

            {loadingInbox ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#7B4A2E" />
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    ItemSeparatorComponent={renderSeparator}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}

                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#7B4A2E"
                        />
                    }

                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center px-10">
                            <View className="bg-gray-100 p-6 rounded-full mb-6">
                                <MessageCircle size={48} color="#9CA3AF" strokeWidth={1.5} />
                            </View>

                            <Text className="text-gray-900 text-xl font-bold text-center">
                                No messages yet
                            </Text>

                            <Text className="text-gray-400 text-center mt-3 leading-5 text-base">
                                Start a conversation with your friends. Your chat history will appear here.
                            </Text>

                            <TouchableOpacity
                                onPress={() => router.replace('/')}
                                className="mt-8 px-8 py-3 bg-[#7B4A2E] rounded-full"
                            >
                                <Text className="text-white font-semibold">Find Friends</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    contentContainerStyle={sections.length === 0 ? { flexGrow: 1 } : {}}
                />
            )}
        </SafeAreaView>
    );
}
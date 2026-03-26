import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import { useSocket } from '@/contexts/SocketContext';
import { API_URL } from '@/config/api';
import { ArrowLeft, Send, UserX } from 'lucide-react-native';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import defaultAvatar from '@/assets/images/profile.png';

export default function ActiveChatScreen() {
    const { user, token, logout } = useAuth();
    const { socket } = useSocket();
    const { id: conversationId } = useLocalSearchParams();

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [conversationData, setConversationData] = useState<any>(null);
    const [isMutual, setIsMutual] = useState(true);

    const flatListRef = useRef<FlatList>(null);
    const hasLoadedOnce = useRef(false);

    const fetchConversationAndMessages = useCallback(async (showLoader = false) => {
        if (!user) return;
        try {
            if (showLoader) setLoadingMessages(true);

            const inboxRes = await authFetch(`${API_URL}/messages/inbox`, {}, token, logout);
            if (inboxRes && inboxRes.ok) {
                const inboxData = await inboxRes.json();
                const currentConv = inboxData.find((c: any) => c._id === conversationId);
                if (currentConv) {
                    setConversationData(currentConv);
                    setIsMutual(currentConv.isMutual !== false);
                }
            }

            const msgRes = await authFetch(`${API_URL}/messages/${conversationId}?limit=50&skip=0`, {}, token, logout);
            if (msgRes && msgRes.ok) {
                const msgData = await msgRes.json();
                setMessages(msgData);
            }
        } catch (error) {
            // console.error("Failed to fetch chat data:", error);
            Alert.alert('Error', 'Failed to fetch chat data');
        } finally {
            setLoadingMessages(false);
        }
    }, [conversationId, user]);

    // re-fetch on every focus (after visiting user profile and unfollowing)
    useFocusEffect(
        useCallback(() => {
            const isInitial = !hasLoadedOnce.current;
            hasLoadedOnce.current = true;
            fetchConversationAndMessages(isInitial);
        }, [fetchConversationAndMessages])
    );

    useEffect(() => {
        if (!socket || !conversationId) return;

        const handleNewMessage = (message: any) => {
            if (message.conversation_id === conversationId) {
                setMessages((prev) => [message, ...prev]);
            }
        };

        socket.on('receive_message', handleNewMessage);

        return () => {
            socket.off('receive_message', handleNewMessage);
        };
    }, [socket, conversationId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !conversationData || !user) return;

        const receiver = conversationData.participants.find((p: any) => p._id !== user._id) || conversationData.participants[0];
        const contentToSend = newMessage;
        setNewMessage('');

        try {
            const res = await authFetch(`${API_URL}/messages`, {
                method: 'POST',
                body: JSON.stringify({
                    conversationId: conversationData._id,
                    content: contentToSend,
                    receiverId: receiver._id
                })
            }, token, logout);

            if (res && res.ok) {
                const data = await res.json();
                setMessages((prev) => [data, ...prev]);
            } else if (res && res.status === 403) {
                setIsMutual(false);
                Alert.alert("Cannot send message", "You can only chat with mutual followers.");
            }
        } catch (error) {
            // console.error("Failed to send message:", error);
            Alert.alert("Error", "Could not send message.");
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Format date label
    const formatDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    // Format message time (just hours:minutes)
    const formatMessageTime = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'HH:mm');
        } catch {
            return '';
        }
    };

    const dateSeparatorIndices = useMemo(() => {
        const indices = new Set<number>();
        if (messages.length > 0) {
            indices.add(messages.length - 1);
        }
        for (let i = 0; i < messages.length - 1; i++) {
            const current = new Date(messages[i].createdAt);
            const next = new Date(messages[i + 1].createdAt);
            if (!isSameDay(current, next)) {
                indices.add(i);
            }
        }
        return indices;
    }, [messages]);

    const renderMessageItem = ({ item, index: idx }: { item: any; index: number }) => {
        const isMe = item.sender._id === user?._id || item.sender === user?._id;
        const showDateHeader = dateSeparatorIndices.has(idx);

        return (
            <View>
                {showDateHeader && (
                    <View className="items-center my-4">
                        <View className="bg-gray-200/70 px-4 py-1.5 rounded-full">
                            <Text className="text-xs text-gray-500 font-medium">
                                {formatDateLabel(item.createdAt)}
                            </Text>
                        </View>
                    </View>
                )}

                <View className={`mx-4 mb-2 max-w-[78%] ${isMe ? 'self-end' : 'self-start'}`}>
                    <View className={`rounded-2xl px-4 py-2.5 ${isMe
                        ? 'bg-[#7B4A2E] rounded-br-md'
                        : 'bg-white rounded-bl-md border border-gray-100'
                        }`}
                    >
                        <Text className={`text-[15px] leading-5 ${isMe ? 'text-white' : 'text-gray-800'}`}>
                            {item.content}
                        </Text>
                    </View>
                    <Text className={`text-[10px] text-gray-400 mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-secondary items-center justify-center">
                <Text>Please login</Text>
            </SafeAreaView>
        );
    }

    const otherUserContext = conversationData?.participants?.find((p: any) => p._id !== user._id) || conversationData?.participants?.[0];

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <View className="flex-row items-center px-3 py-3 border-b border-gray-100 bg-white">
                    <TouchableOpacity onPress={handleBack} className="p-2 rounded-full active:bg-gray-100">
                        <ArrowLeft size={22} color="#4B5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-row items-center ml-1 flex-1"
                        activeOpacity={0.7}
                        onPress={() => {
                            if (otherUserContext?._id) {
                                router.push({ pathname: '/user/[id]', params: { id: otherUserContext._id } });
                            }
                        }}
                    >
                        <Image
                            source={otherUserContext?.profile_picture ? { uri: otherUserContext.profile_picture } : defaultAvatar}
                            className="w-10 h-10 rounded-full bg-gray-200"
                        />
                        <View className="ml-3">
                            <Text className="text-lg font-bold text-dark-100">{otherUserContext?.username || 'Loading...'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <View className="flex-1 bg-secondary">
                    {loadingMessages ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#7B4A2E" />
                        </View>
                    ) : messages.length === 0 ? (
                        <View className="flex-1 items-center justify-center px-10">
                            <View className="bg-[#7B4A2E]/10 p-5 rounded-full mb-4">
                                <Send size={28} color="#7B4A2E" />
                            </View>
                            <Text className="text-gray-500 text-center text-sm">
                                Say hi to {otherUserContext?.username || 'your friend'}! 👋
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item._id}
                            renderItem={renderMessageItem}
                            inverted
                            className="flex-1"
                            contentContainerStyle={{ paddingVertical: 10, paddingBottom: 8 }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>

                {/* Input Area */}
                {isMutual ? (
                    <View className="flex-row items-end px-4 py-3 bg-white border-t border-gray-100">
                        <TextInput
                            className="flex-1 bg-gray-100 rounded-3xl px-5 py-3 text-base mr-3 text-dark-100 max-h-28"
                            placeholder="Type a message..."
                            placeholderTextColor="#9CA3AF"
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                        />
                        <TouchableOpacity
                            className={`w-11 h-11 rounded-full items-center justify-center ${newMessage.trim() ? 'bg-[#7B4A2E]' : 'bg-gray-300'}`}
                            onPress={handleSendMessage}
                            disabled={!newMessage.trim()}
                            activeOpacity={0.7}
                        >
                            <Send size={17} color="white" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="px-4 py-4 bg-white border-t border-gray-100 items-center">
                        <View className="flex-row items-center">
                            <UserX size={16} color="#9CA3AF" />
                            <Text className="text-gray-400 text-sm ml-2">You can only chat with mutual followers</Text>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
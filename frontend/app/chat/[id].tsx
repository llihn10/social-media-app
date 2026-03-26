import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import { useSocket } from '@/contexts/SocketContext';
import { API_URL } from '@/config/api';
import { ArrowLeft, Send } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useLocalSearchParams, router } from 'expo-router';

export default function ActiveChatScreen() {
    const { user, token, logout } = useAuth();
    const { socket } = useSocket();
    const { id: conversationId } = useLocalSearchParams();

    // State
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [conversationData, setConversationData] = useState<any>(null);
    
    // Flatlist Ref to auto-scroll to bottom
    const flatListRef = useRef<FlatList>(null);

    // Fetch conversation details (using inbox API to find current conversation metadata)
    useEffect(() => {
        const fetchConversationAndMessages = async () => {
            if (!user) return;
            try {
                // Fetch inbox to get participants
                const inboxRes = await authFetch(`${API_URL}/messages/inbox`, {}, token, logout);
                if (inboxRes && inboxRes.ok) {
                    const inboxData = await inboxRes.json();
                    const currentConv = inboxData.find((c: any) => c._id === conversationId);
                    if (currentConv) {
                        setConversationData(currentConv);
                    }
                }

                // Fetch messages
                const msgRes = await authFetch(`${API_URL}/messages/${conversationId}?limit=50&skip=0`, {}, token, logout);
                if (msgRes && msgRes.ok) {
                    const msgData = await msgRes.json();
                    setMessages(msgData);
                }
            } catch (error) {
                console.error("Failed to fetch chat data:", error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchConversationAndMessages();
    }, [conversationId, user]);

    // Socket listening
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
        setNewMessage(''); // optimistic ui clear

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
                // Add the new message to local state immediately
                setMessages((prev) => [data, ...prev]);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            Alert.alert("Error", "Could not send message.");
        }
    };

    const handleBack = () => {
        router.back();
    };

    const renderMessageItem = ({ item }: { item: any }) => {
        const isMe = item.sender._id === user?._id || item.sender === user?._id;
        
        return (
            <View className={`my-1 mx-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <View className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-[#7B4A2E] rounded-tr-sm' : 'bg-gray-200 rounded-tl-sm'}`}>
                    <Text className={`${isMe ? 'text-white' : 'text-dark-100'} text-base`}>
                        {item.content}
                    </Text>
                </View>
                <Text className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'self-end' : 'self-start'}`}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Text>
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
    const defaultAvatar = 'https://via.placeholder.com/150';

    return (
        <SafeAreaView className="flex-1 bg-secondary" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ArrowLeft size={24} color="#4B5563" />
                </TouchableOpacity>
                <View className="flex-row items-center ml-2">
                    <Image 
                        source={{ uri: otherUserContext?.profile_picture || defaultAvatar }} 
                        className="w-10 h-10 rounded-full"
                    />
                    <Text className="ml-3 text-lg font-bold text-dark-100">{otherUserContext?.username || 'Loading...'}</Text>
                </View>
            </View>

            {/* Messages */}
            {loadingMessages ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#7B4A2E" />
                </View>
            ) : (
                <FlatList 
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessageItem}
                    inverted // Reverses so new messages appear at the bottom automatically
                    className="flex-1"
                    contentContainerStyle={{ paddingVertical: 10, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Input Area */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200 pt-3 pb-6">
                    <TextInput 
                        className="flex-1 bg-gray-100 rounded-3xl px-5 py-3 text-base mr-3 text-dark-100 max-h-32 shadow-sm"
                        placeholder="Type a message..."
                        placeholderTextColor="#9CA3AF"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity 
                        className={`w-12 h-12 rounded-full items-center justify-center shadow-md ${newMessage.trim() ? 'bg-[#7B4A2E]' : 'bg-gray-300'}`}
                        onPress={handleSendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Send size={18} color="white" className="ml-1" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

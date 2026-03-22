import { View, Text, Image, Pressable } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import defaultAvatar from '@/assets/images/profile.png'

export default function NotificationItem({ item, onPress }: { item: any, onPress: () => void }) {
    const getActionText = () => {
        switch (item.type) {
            case 'LIKE_POST': return 'liked your post.';
            case 'LIKE_COMMENT': return 'liked your comment.';
            case 'REPLY_COMMENT': return 'replied to your comment.';
            case 'FOLLOW': return 'started following you.';
            case 'COMMENT_POST': return 'commented on your post.';
            case 'LIKE_REPLY': return 'liked your reply.';
            default: return 'interacted with you.';
        }
    };

    return (
        <Pressable
            onPress={onPress}
            // unread - change background color
            className={`flex-row items-center px-4 py-5 border-b border-gray-50 ${!item.isRead ? 'bg-blue-50/50' : 'bg-white'}`}
        >
            <Image
                source={
                    item.sender.profile_picture &&
                        item.sender.profile_picture.trim() !== ''
                        ? { uri: item.sender.profile_picture }
                        : defaultAvatar
                }
                className="w-12 h-12 rounded-full bg-gray-200"
            />
            <View className="flex-1 ml-4 justify-center">
                <Text className="text-[15px] text-gray-900 leading-5">
                    <Text className="font-bold">{item.sender.username}</Text> {getActionText()}
                </Text>
                <Text className="text-[13px] text-gray-500 mt-0.5">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Text>
            </View>

            {/* unread - blue dot */}
            {!item.isRead && <View className="w-2 h-2 rounded-full bg-blue-500 ml-2" />}
        </Pressable>
    );
}
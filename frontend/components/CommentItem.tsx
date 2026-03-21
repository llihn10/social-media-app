import { Heart, MessagesSquare } from "lucide-react-native";
import { View, Text, Image, Pressable } from "react-native";

const timeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);

    const diffMs = now.getTime() - created.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    const day = created.getDate();
    const month = created.getMonth() + 1;
    const year = created.getFullYear();
    const currentYear = now.getFullYear();

    if (year === currentYear) {
        return `${day}/${month}`;
    }

    return `${day}/${month}/${year.toString().slice(-2)}`;
};

export default function CommentItem({ comment }: any) {
    const replies = comment?.replies || [];

    return (
        <View className="px-3 py-4 border-t border-gray-100">
            <View className="flex-row">
                <Image source={{ uri: comment.user.profile_picture }}
                    className='w-12 h-12 rounded-full'
                />

                <View className='px-3 flex-1'>
                    <View className='flex-row items-baseline'>
                        <Text className='text-base font-semibold text-dark-100'>
                            {comment.user.username}
                        </Text>
                        <Text className='ml-1 text-sm font-normal text-dark-200'> {timeAgo(comment.createdAt)}</Text>
                    </View>

                    <Text className='text-base text-dark-100 mt-1'>
                        {comment.content}
                    </Text>

                    <View className='flex-row items-baseline mt-2 pb-3 gap-3'>
                        <Pressable className="flex-row items-center gap-2">
                            <Heart
                                size={18}
                                color={'#000'}
                                fill='none'
                            />
                            <Text className="text-sm text-dark-100 font-medium">{comment.likesCount || 0}</Text>
                        </Pressable>

                        <Pressable className="flex-row items-center gap-2 ml-5">
                            <MessagesSquare
                                size={17}
                                color={'#000'}
                                fill='none'
                            />
                            <Text className="text-sm text-dark-100 font-medium">{comment.replies.length}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* ===== REPLIES ===== */}
            {replies.length > 0 && (
                <View className="ml-6 mt-3 pl-5 relative">
                    <View
                        style={{
                            position: 'absolute',
                            left: 1,
                            top: 0,
                            bottom: 0,
                            width: 1.5,
                            backgroundColor: '#E5E7EB',
                        }}
                    />
                    {replies.map((reply: any, index: number) => (
                        <View key={index} className="flex-row mb-3 mt-1">

                            <Image
                                source={{ uri: reply.author.profile_picture }}
                                className='w-12 h-12 rounded-full'
                            />

                            <View className='ml-3 flex-1'>
                                <View className='flex-row items-baseline'>
                                    <Text className='text-base font-semibold text-dark-100'>
                                        {reply.author.username}
                                    </Text>
                                    <Text className='ml-1 text-sm font-normal text-dark-200'> {timeAgo(reply.createdAt)}</Text>
                                </View>

                                <Text className='text-base text-dark-100 mt-1'>
                                    {reply.content}
                                </Text>

                                <View className='flex-row items-center mt-2 gap-2'>
                                    <Heart size={18} color={'#000'} />
                                    <Text className="text-sm">
                                        {reply.likesCount || 0}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>

    );
}
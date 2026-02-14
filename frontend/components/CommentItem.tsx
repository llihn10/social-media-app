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
    return (
        <View className="flex-row px-3 py-5 border-t border-gray-100">
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
                    {comment.comment}
                </Text>

                <View className='flex-row items-baseline mt-2 pb-3'>
                    <Pressable className="flex-row items-center gap-2">
                        <Heart
                            size={18}
                            color={'#000'}
                            fill='none'
                        />
                        {/* <Text className="text-base text-dark-100 font-medium">{post.likes_count}</Text> */}
                    </Pressable>

                    <Pressable className="flex-row items-center gap-2 ml-5">
                        <MessagesSquare
                            size={17}
                            color={'#000'}
                            fill='none'
                        />
                        {/* <Text className="text-base text-dark-100 font-medium">{post.comments_count}</Text> */}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
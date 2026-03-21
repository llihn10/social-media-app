import { BaseToast, ErrorToast, InfoToast, ToastConfig } from 'react-native-toast-message';
import { View, Text, Image } from 'react-native';
import { Dimensions } from 'react-native';
import defaultAvatar from '@/assets/images/profile.png'

const screenWidth = Dimensions.get('window').width;

const getIcon = (type: string) => {
    switch (type) {
        case 'LIKE_POST':
        case 'LIKE_COMMENT':
        case 'LIKE_REPLY':
            return '❤️';

        case 'COMMENT_POST':
        case 'REPLY_COMMENT':
            return '💬';

        case 'FOLLOW':
            return '👤';

        default:
            return '🔔';
    }
};

export const toastConfig: ToastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: '#7B4A2E',
                height: 90,
                width: '92%',
                borderRadius: 20,
                backgroundColor: '#FFF',
            }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            text1Style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#1F2937',
            }}
            text2Style={{
                fontSize: 15,
                color: '#4B5563',
            }}
        />
    ),

    interaction: ({ text1, text2, props }: any) => {
        const avatarUri =
            props?.senderAvatar && props.senderAvatar.trim() !== ''
                ? { uri: props.senderAvatar }
                : defaultAvatar;

        return (
            <View
                className="bg-white rounded-2xl shadow-xl border border-gray-100 flex-row items-center p-4"
                style={{
                    width: screenWidth * 0.9,
                    maxWidth: screenWidth * 0.9,
                    shadowColor: "#7B4A2E",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                }}
            >
                <View className="relative">
                    {props.senderAvatar ? (
                        <Image
                            source={avatarUri}
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                borderWidth: 2,
                                borderColor: '#D88A3D'
                            }}
                        />
                    ) : (
                        <View className="w-14 h-14 bg-orange-100 rounded-full items-center justify-center">
                            <Text className="text-2xl">🔔</Text>
                        </View>
                    )}

                    <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <Text style={{ fontSize: 12 }}>{getIcon(props.type)}</Text>
                    </View>
                </View>

                <View className="ml-4 flex-1 justify-center">
                    <Text className="text-[18px] font-bold text-gray-900 leading-6" numberOfLines={1}>
                        {text1}
                    </Text>
                    <Text className="text-[15px] text-gray-600 mt-0.5 leading-5" numberOfLines={2}>
                        {text2}
                    </Text>
                </View>
            </View>
        )
    },

    // custom
    notification: ({ text1, text2, props }: any) => (
        <View className="h-20 w-[90%] bg-white rounded-2xl shadow-lg border border-gray-100 flex-row items-center px-4">
            <View className="w-10 h-10 bg-secondary rounded-full items-center justify-center">
                <Text>🔔</Text>
            </View>
            <View className="ml-3 flex-1">
                <Text className="font-bold text-gray-900">{text1}</Text>
                <Text className="text-gray-600 text-sm" numberOfLines={1}>{text2}</Text>
            </View>
        </View>
    )
};
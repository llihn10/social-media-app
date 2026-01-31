import { View, Text, Image, FlatList, Pressable } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

const images = [
    require('../assets/images/avt-dog.jpg'),
    require('../assets/images/dog-1.jpg'),
    require('../assets/images/dog-2.jpg'),
]

const PostCard = () => {
    return (
        <View className='py-3 bg-secondary'>

            {/* Avatar + Username + Post Content */}
            <View className='px-4 flex-row'>
                {/* Avatar */}
                <Image source={require('../assets/images/avt-dog.jpg')}
                    className='w-12 h-12 rounded-full mt-1'
                />

                <View className='px-3 flex-1'>
                    <View className='flex-row items-baseline'>
                        <Text className='text-lg font-semibold text-dark-100'>
                            pompompurin
                        </Text>
                        <Text className=' ml-4 text-sm font-normal text-dark-200'>10h</Text>
                    </View>

                    <Text className='text-base text-dark-100 mt-1'>
                        Today is my birthday!!!!
                    </Text>
                </View>
            </View>

            {/* Image Content */}
            <FlatList
                style={{ marginTop: 12 }}
                data={images}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ paddingLeft: 66, paddingRight: 12, gap: 4 }}
                renderItem={({ item }) => (
                    <Image
                        source={item}
                        style={{ width: 250, height: 270 }}
                        className="rounded-md overflow-hidden shadow-sm"
                        resizeMode="cover"
                    />
                )}
            />

            {/* Post Actions: like + comment */}
            <View className='flex-row mt-2 gap-6' style={{ marginLeft: 58 }}>
                <Pressable className="flex-row items-center gap-2 p-2">
                    <icons.like
                        width={17}
                        height={17}
                        stroke="#000"
                        fill="none"
                    />
                    <Text className="text-sm text-dark-100 font-medium">128</Text>
                </Pressable>

                <Pressable className="flex-row items-center gap-2 p-2">
                    <icons.comment
                        width={17}
                        height={17}
                        stroke="#000"
                        fill="none"
                    />
                    <Text className="text-sm text-dark-100 font-medium">12</Text>
                </Pressable>

            </View>
        </View>
    )
}

export default PostCard
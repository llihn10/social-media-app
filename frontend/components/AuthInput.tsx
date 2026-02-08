import { TextInput, TextInputProps, View } from 'react-native'
import React from 'react'

type AuthInputProps = TextInputProps;

export default function AuthInput(props: AuthInputProps) {
    return (
        <View className='bg-dark-300 rounded-2xl px-4 py-2'>
            <TextInput
                {...props}
                className='text-base text-dark-100'
                placeholderTextColor="#8A8A8A"
            />
        </View>
    )
}

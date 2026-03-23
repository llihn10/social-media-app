import { TextInput, TextInputProps, View } from 'react-native'
import React from 'react'

type AuthInputProps = TextInputProps;

export default function AuthInput(props: AuthInputProps) {
    return (
        <View className='bg-dark-300 rounded-2xl h-14 px-4 justify-center flex-row items-center'>
            <TextInput
                {...props}
                className='flex-1 text-base text-dark-100 h-full'
                placeholderTextColor="#8A8A8A"
                autoCapitalize={props.secureTextEntry ? 'none' : props.autoCapitalize}
            />
        </View>
    )
}

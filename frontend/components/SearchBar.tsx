import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { Search } from 'lucide-react-native';

interface Props {
    placeholder: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onPress?: () => void;
}

const SearchBar = ({ placeholder, value, onChangeText, onPress }: Props) => {
    return (
        <View className='mx-4 pb-2'>
            <View className='flex-row items-center bg-light-300 rounded-2xl px-4 py-4'>
                <Search
                    size={21}
                    strokeWidth={2.5}
                    color="#8A8A8A"
                />

                <TextInput
                    onPress={onPress}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    className='flex-1 ml-2 text-dark-100'
                    placeholderTextColor='#8A8A8A'
                />
            </View>
        </View>
    )
}

export default SearchBar

const styles = StyleSheet.create({})
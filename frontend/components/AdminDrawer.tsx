import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LogOut, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export const AdminDrawer = (props: DrawerContentComponentProps) => {
    const { logout, user } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <DrawerContentScrollView {...props}>
                <View className="p-6 border-b border-gray-100 items-center">
                    <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-3">
                        <ShieldCheck size={40} color="#7B4A2E" />
                    </View>
                    <Text className="text-xl font-bold text-dark-100">{user?.username || 'Admin'}</Text>
                    <Text className="text-gray-500 text-sm mt-3">System Administrator</Text>
                </View>

                <View className="p-2">
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            <View className="p-6 border-t border-gray-100">
                <TouchableOpacity
                    onPress={logout}
                    className="flex-row items-center bg-red-50 p-4 rounded-2xl"
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="ml-3 text-red-500 font-bold">Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
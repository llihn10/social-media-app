import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from 'react';
import { Image, View } from "react-native";

const TabIcon = ({ focused, icon }: any) => {
    if (focused) {
        return (
            <View className="size-full jusitfy-center items-center mt-4 rounded-full">
                <Image source={icon} tintColor="#7B4A2E" className="size-5" />
            </View>
        )
    }

    return (
        <View className="size-full jusitfy-center items-center mt-4 rounded-full">
            <Image source={icon} tintColor="#C7C7C7" className="size-5" />
        </View>
    )
}

const _Layout = () => {

    return (

        // Navigation Tab
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center'
                }
            }}
        >

            {/* Home */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.home}
                        />
                    )
                }}
            />

            {/* Search */}
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.search}
                        />
                    )
                }}
            />

            {/* New Post */}
            <Tabs.Screen
                name="newPost"
                options={{
                    title: 'New Post',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.add}
                        />
                    )
                }}
            />

            {/* Notification */}
            <Tabs.Screen
                name="notification"
                options={{
                    title: 'Notification',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.bell}
                        />
                    )
                }}
            />

            {/* Profile */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.person}
                        />
                    )
                }}
            />
        </Tabs>
    );
}
export default _Layout

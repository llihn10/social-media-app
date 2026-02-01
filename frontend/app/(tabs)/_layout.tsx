import { Tabs } from "expo-router";
import React from 'react';
import { Home, Search, PlusCircle, Bell, User2 } from 'lucide-react-native';

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
                        <Home
                            size={22}
                            color={focused ? '#7B4A2E' : '#C7C7C7'}
                            strokeWidth={focused ? 3 : 2.5}
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
                        <Search
                            size={22}
                            color={focused ? '#7B4A2E' : '#C7C7C7'}
                            strokeWidth={focused ? 3 : 2.5}
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
                        <PlusCircle
                            size={22}
                            color={focused ? '#7B4A2E' : '#C7C7C7'}
                            strokeWidth={focused ? 3 : 2.5}
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
                        <Bell
                            size={22}
                            color={focused ? '#7B4A2E' : '#C7C7C7'}
                            strokeWidth={focused ? 3 : 2.5}
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
                        <User2
                            size={22}
                            color={focused ? '#7B4A2E' : '#C7C7C7'}
                            strokeWidth={focused ? 3 : 2.5}
                        />
                    )
                }}
            />
        </Tabs>
    );
}
export default _Layout

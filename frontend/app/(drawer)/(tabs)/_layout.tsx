import { Tabs } from "expo-router";
import React from 'react';
import { Home, PlusCircle, Bell, User2, MessageCircle } from 'lucide-react-native';
import { Modal } from 'react-native';
import { useNotifications } from '@/contexts/NotificationContext';
import { SearchProvider, useSearch } from '@/contexts/SearchContext';
import SearchScreen from "@/app/search";

const SearchOverlay = () => {
    const { isSearchVisible, closeSearch } = useSearch();

    return (
        <Modal
            visible={isSearchVisible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={closeSearch}
        >
            <SearchScreen onClose={closeSearch} />
        </Modal>
    );
};

const TabLayout = () => {
    const { unreadCount } = useNotifications()

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        height: 80,
                        paddingBottom: 8,
                        paddingTop: 9,
                        backgroundColor: '#FFFCF9'
                    },
                    tabBarItemStyle: {
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
                                size={25}
                                color={focused ? '#7B4A2E' : '#C7C7C7'}
                                strokeWidth={focused ? 3 : 2.5}
                            />
                        )
                    }}
                />

                {/* Chat */}
                <Tabs.Screen
                    name="chat"
                    options={{
                        title: 'Chat',
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <MessageCircle
                                size={25}
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
                                size={25}
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
                        title: 'Notifications',
                        tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                        tabBarBadgeStyle: {
                            backgroundColor: '#EF4444',
                            color: '#FFFFFF',
                            fontSize: 10,
                        },
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <Bell
                                size={25}
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
                                size={25}
                                color={focused ? '#7B4A2E' : '#C7C7C7'}
                                strokeWidth={focused ? 3 : 2.5}
                            />
                        )
                    }}
                />
            </Tabs>

            <SearchOverlay />
        </>
    );
}

const _Layout = () => {
    return (
        <SearchProvider>
            <TabLayout />
        </SearchProvider>
    );
}
export default _Layout

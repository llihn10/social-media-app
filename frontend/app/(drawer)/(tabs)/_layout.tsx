import { Tabs, usePathname } from "expo-router";
import React, { useEffect } from 'react';
import { Home, PlusCircle, Bell, User2, MessageCircle } from 'lucide-react-native';
import { View } from 'react-native';
import { useNotifications } from '@/contexts/NotificationContext';
import SearchScreen from "@/app/search";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const TabLayout = () => {
    const { unreadCount } = useNotifications()

    return (
        // Navigation Tab
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
    );
}

const RightDrawer = createDrawerNavigator();

// const RightDrawerContent = (props: any) => (
//     <View style={{ flex: 1, backgroundColor: '#fff' }}>
//         <SearchScreen navigation={props.navigation} />
//     </View>
// );

const _Layout = () => {

    const pathname = usePathname();
    const navigation = useNavigation();

    useEffect(() => {
        const rightDrawer = navigation.getParent('RightDrawer');

        if (rightDrawer) {
            rightDrawer.dispatch(DrawerActions.closeDrawer());
        }
    }, [pathname]);

    return (
        <RightDrawer.Navigator
            id="RightDrawer"
            drawerContent={(props) => (
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <SearchScreen navigation={props.navigation} />
                </View>
            )}
            screenOptions={{
                drawerPosition: 'right',
                headerShown: false,
                drawerStyle: { width: '100%' },
                swipeEnabled: false,
            }}
        >

            <RightDrawer.Screen
                name="MainTabs"
                component={TabLayout}
            />
        </RightDrawer.Navigator>
    );
}
export default _Layout

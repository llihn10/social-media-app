import { Drawer } from 'expo-router/drawer';
import { AdminDrawer } from '@/components/AdminDrawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LayoutDashboard } from 'lucide-react-native';

export default function AdminLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <AdminDrawer {...props} />}
                screenOptions={{
                    drawerPosition: 'right',
                    headerShown: false,
                    drawerStyle: {
                        width: '75%',
                    },
                    drawerActiveBackgroundColor: '#F8F4F2',
                    drawerActiveTintColor: '#7B4A2E',
                    drawerInactiveTintColor: '#6B7280',
                    headerRight: () => null,
                }}
            >
                <Drawer.Screen
                    name="dashboard"
                    options={{
                        drawerLabel: 'Dashboard',
                        title: 'Dashboard',
                        headerShown: false,
                        drawerIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
                    }}
                />
                {/* <Drawer.Screen
                    name="users"
                    options={{
                        drawerLabel: 'Manage Users',
                        title: 'Users',
                    }}
                /> */}
            </Drawer>
        </GestureHandlerRootView>
    );
}
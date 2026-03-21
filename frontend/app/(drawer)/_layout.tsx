import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Heart, User, Home } from 'lucide-react-native';
import defaultAvatar from '@/assets/images/profile.png';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Custom Drawer Content
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      router.replace('/(auth)/login');
    } catch (err) {
      console.error(err)
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Header Profile Section */}
        <View className="px-5 py-10 bg-[#7B4A2E] flex-row items-center pt-16">
          <Image
            source={user?.profile_picture ? { uri: user.profile_picture } : defaultAvatar}
            className="w-16 h-16 rounded-full border-2 border-white bg-gray-200"
          />
          <View className="ml-4 flex-1">
            <Text className="text-white text-lg font-bold" numberOfLines={1}>{user?.username || 'User'}</Text>
            <Text className="text-white/80 text-sm mt-1" numberOfLines={1}>{user?.bio || 'Welcome back!'}</Text>
          </View>
        </View>

        {/* Drawer Item List */}
        <View className="flex-1 bg-white pt-2">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={{ paddingBottom: insets.bottom + 10 }} className="p-5 border-t border-gray-100 bg-white">
        <TouchableOpacity onPress={handleLogout} className="flex-row items-center py-2">
          <LogOut size={22} color="#EF4444" />
          <Text className="ml-4 text-base font-medium text-red-500">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: true,
        drawerActiveBackgroundColor: '#F3F4F6',
        drawerActiveTintColor: '#7B4A2E',
        drawerInactiveTintColor: '#4B5563',
        drawerLabelStyle: {
          marginLeft: -10,
          fontSize: 15,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          headerShown: false, // Hide header for tabs because tabs have their own header
          drawerIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="liked"
        options={{
          drawerLabel: 'Liked Posts',
          title: 'Liked Posts',
          headerStyle: { backgroundColor: '#7B4A2E' },
          headerTintColor: '#fff',
          drawerIcon: ({ color }) => <Heart size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="edit-profile"
        options={{
          drawerLabel: 'Edit Profile',
          title: 'Edit Profile',
          headerStyle: { backgroundColor: '#7B4A2E' },
          headerTintColor: '#fff',
          drawerIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Drawer>
  );
}

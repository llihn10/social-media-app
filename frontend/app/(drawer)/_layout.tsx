import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Heart, User, Home } from 'lucide-react-native';
import defaultAvatar from '@/assets/images/profile.png';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Header Profile Section */}
        <View
          className="px-6 pb-10 bg-[#7B4A2E] pt-16 rounded-br-3xl flex-row items-center"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 5 }}
        >
          <Image
            source={user?.profile_picture ? { uri: user.profile_picture } : defaultAvatar}
            className="w-16 h-16 rounded-full border-2 border-white bg-gray-200"
          />
          <View className="ml-4 flex-1">
            <Text className="text-white text-lg font-bold" numberOfLines={1}>{user?.username || 'User'}</Text>
            <Text className="text-white/80 text-base mt-1" numberOfLines={2}>{user?.bio || 'Welcome back!'}</Text>
          </View>
        </View>

        {/* Drawer Item List */}
        <View className="flex-1 px-2 pt-4">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={{ paddingBottom: insets.bottom + 20 }} className="px-5 pt-4 border-t border-gray-50">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center p-4 bg-red-50 rounded-2xl active:bg-red-100"
        >
          <View className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm">
            <LogOut size={20} color="#EF4444" />
          </View>
          <Text className="ml-4 text-base font-bold text-red-600">Sign Out</Text>
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
        drawerType: 'slide',
        drawerStyle: {
          width: '82%',
          backgroundColor: '#fff',
        },
        drawerActiveBackgroundColor: '#F8F4F2',
        drawerActiveTintColor: '#7B4A2E',
        drawerInactiveTintColor: '#6B7280',
        drawerItemStyle: {
          borderRadius: 12,
          paddingHorizontal: 5,
          marginVertical: 4,
        },
        drawerLabelStyle: {
          marginLeft: 5,
          fontSize: 15,
          fontWeight: '600',
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

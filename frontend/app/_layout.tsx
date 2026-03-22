import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import './globals.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SocketProvider } from '@/contexts/SocketContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/config/toastConfig';

function RootLayoutNav() {
  const { token, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  const navigationState = useRootNavigationState()

  useEffect(() => {
    if (isLoading || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)'

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (token && inAuthGroup) {
      router.replace('/(drawer)/(tabs)')
    }

  }, [token, segments, isLoading, navigationState?.key])

  if (isLoading || !navigationState?.key) {
    return (
      <View className="flex-1 justify-center items-center bg-secondary">
        <ActivityIndicator size="large" color="#7B4A2E" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(auth)' />
      <Stack.Screen name='(drawer)' />
      <Stack.Screen name='post/[id]' />
      <Stack.Screen name='user/[id]' />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <RootLayoutNav />
            <Toast config={toastConfig} />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}

import { Redirect, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { View } from 'lucide-react-native';

// export default function RootLayout() {
//   const { token } = useAuth()

//   return (
//     <AuthProvider>
//       <Stack>
//         <Stack.Screen
//           name="(auth)"
//           options={{ headerShown: false }}
//         />

//         <Stack.Screen
//           name="(tabs)"
//           options={{ headerShown: false }}
//         />

//         <Stack.Screen
//           name="post/[id]"
//           options={{ headerShown: false }}
//         />
//       </Stack>
//     </AuthProvider>
//   )
// }

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
      router.replace('/(tabs)')
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
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='post/[id]' />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}

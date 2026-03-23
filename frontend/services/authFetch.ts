import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { Alert } from 'react-native'

export const authFetch = async (
    url: string,
    options: RequestInit = {},
    token: string | null,
    logout: () => void
) => {
    const isFormData = options.body instanceof FormData

    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: token ? `Bearer ${token}` : '',
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            },
        })

        if (res.status === 401) {
            Alert.alert(
                "Session expired",
                "Please login again to continue.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            logout();
                            router.replace('/(auth)/login');
                        }
                    }
                ],
                { cancelable: false }
            )
            return null
        }
        return res
    } catch (error) {
        throw new Error('TOKEN_EXPIRED')
    }
}

import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'

export const authFetch = async (
    url: string,
    options: RequestInit = {},
    token: string | null,
    logout: () => void
) => {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        },
    })

    if (res.status === 401) {
        logout()
        router.replace('/(auth)/login')
        throw new Error('Token expired')
    }

    return res
}

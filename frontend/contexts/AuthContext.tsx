import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface User {
    _id: string,
    username: string,
    email: string,
    profile_picture?: string,
    bio: string,
    followers_count: number,
    following_count: number,
    role: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (token: string, user: User) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken')
                const storedUser = await AsyncStorage.getItem('userData')

                if (storedToken && storedUser) {
                    setToken(storedToken)
                    setUser(JSON.parse(storedUser))
                }
            } catch (error) {
                console.error('Failed to recover session: ', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadStoredData()
    }, [])

    const login = async (token: string, user: User) => {
        setToken(token)
        setUser(user)
        await AsyncStorage.setItem('userToken', token)
        await AsyncStorage.setItem('userData', JSON.stringify(user))
    }

    const logout = async () => {
        setToken(null)
        setUser(null)
        await AsyncStorage.removeItem('userToken')
        await AsyncStorage.removeItem('userData')
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }
    return context
}
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { getUserProfile } from '@/app/api/userProfile'
import { UserProfile } from '@/types'

type AuthContextType = {
    user: User | null
    userProfile: UserProfile | null
    loading: boolean
    emailVerified: boolean
    setUser: (user: User | null) => void
    setLoading: (loading: boolean) => void
    setEmailVerified: (emailVerified: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [emailVerified, setEmailVerified] = useState(false)
    const router = useRouter()
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            setLoading(true)
            supabase.auth.getUser(token).then(({ data }) => {
                if (data.user) {
                    getUserProfile().then((response) => {
                        setUserProfile(response.data as UserProfile)
                    })
                    setUser(data.user)
                }
                setLoading(false)
            }).catch((error) => {
                console.log(error)
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }, [router])

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, emailVerified, setUser, setLoading, setEmailVerified }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 
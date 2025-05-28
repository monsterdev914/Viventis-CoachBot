import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type AuthContextType = {
    user: User | null
    loading: boolean
    emailVerified: boolean
    setUser: (user: User | null) => void
    setLoading: (loading: boolean) => void
    setEmailVerified: (emailVerified: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [emailVerified, setEmailVerified] = useState(false)
    const router = useRouter()
    useEffect(() => {
        const token = localStorage.getItem('token')
        console.log(token)
        if (token) {
            supabase.auth.getUser(token).then(({ data }) => {
                if (data.user) {
                    setUser(data.user)
                }
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }, [router])

    return (
        <AuthContext.Provider value={{ user, loading, emailVerified, setUser, setLoading, setEmailVerified }}>
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
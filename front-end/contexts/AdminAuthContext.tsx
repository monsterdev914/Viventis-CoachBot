'use client'
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { createContext } from "react"
import { getUserProfile } from "@/app/api/userProfile"
type AdminAuthContextType = {
    user: User | null
    loading: boolean
    isSuperAdmin: boolean
    setUser: (user: User | null) => void
    setLoading: (loading: boolean) => void
    setIsSuperAdmin: (isSuperAdmin: boolean) => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    setUser(session.user)
                    console.log(session.user.user_metadata)
                    setIsSuperAdmin(session.user.user_metadata.user_role === 'super_admin')
                }
            } catch (error) {
                console.error('Auth error:', error)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()

        // Set up auth state change listener

    }, [router])

    return (
        <AdminAuthContext.Provider value={{ user, loading, isSuperAdmin, setUser, setLoading, setIsSuperAdmin }}>
            {children}
        </AdminAuthContext.Provider>
    )
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext)
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within a AdminAuthProvider')
    }
    return context
}
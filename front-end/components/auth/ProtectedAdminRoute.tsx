'use client'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
    const { user, loading, isSuperAdmin } = useAdminAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && (!user || !isSuperAdmin)) {
            router.push('/admin/login')
        }
    }, [user, loading, isSuperAdmin, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user || !isSuperAdmin) {
        return null
    }

    return <>{children}</>
} 
'use client'
import { Button } from "@heroui/react"
import { Input } from "@heroui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { signIn } from "@/app/api/auth"
import { supabase } from "@/lib/supabase"
import { useTranslation } from 'react-i18next'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const AdminLoginPage = () => {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const { setUser, setIsSuperAdmin } = useAdminAuth()
    const [showPassword, setShowPassword] = useState(false);
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // First check if user exists in pb_user table
            const response = await signIn(email, password);
            const { data: { user } } = await supabase.auth.getUser(response.data.token)
            if (user?.user_metadata.user_role === 'super_admin') {
                localStorage.setItem('token', response.data.token)
                setUser(user)
                setIsSuperAdmin(true)
                router.push('/admin')
            } else {
                setError(t('errors.unauthorized'))
            }
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-content1 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl text-[#000] font-bold">{t('admin.login.title')}</h1>
                    <p className="text-[#000] mt-2">{t('admin.login.subtitle')}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label={t('Email')}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            placeholder={t('admin.login.emailPlaceholder')}
                        />

                        <Input
                            label={t('Password')}
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                            placeholder={t('admin.login.passwordPlaceholder')}
                            endContent={
                                <Button variant="light" size="sm" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeIcon className="text-2xl text-default-400 pointer-events-none" /> : <EyeSlashIcon className="text-2xl text-default-400 pointer-events-none" />}
                                </Button>
                            }
                        />
                    </div>

                    {error && (
                        <div className="text-danger text-sm text-center">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        color="primary"
                        fullWidth
                        isLoading={loading}
                    >
                        {loading ? t('admin.common.loading') : t('admin.login.signIn')}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default AdminLoginPage
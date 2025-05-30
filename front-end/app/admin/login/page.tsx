'use client'
import { Button } from "@heroui/react"
import { Input } from "@heroui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { signIn } from "@/app/api/auth"
const AdminLoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const { setUser, setIsSuperAdmin } = useAdminAuth()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // First check if user exists in pb_user table
            const response = await signIn(email, password);
            console.log(response)
            if (response.data.user.user_role === 'super_admin') {
                localStorage.setItem('token', response.data.token)
                setUser(response.data.user)
                setIsSuperAdmin(true)
                router.push('/admin')
            } else {
                setError('You are not authorized to access this page')
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
                    <h1 className="text-2xl text-[#000] font-bold">Admin Login</h1>
                    <p className="text-[#000] mt-2">Sign in to access the admin dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            placeholder="Enter your email"
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                            placeholder="Enter your password"
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
                        Sign In
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default AdminLoginPage
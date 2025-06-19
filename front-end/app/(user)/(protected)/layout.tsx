import ProtectedRoute from "@/components/auth/ProtectedRoute"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute>
            <div className="min-h-screen">
                {children}
            </div>
        </ProtectedRoute>
    )
}

export default Layout
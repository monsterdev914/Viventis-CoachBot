import ProtectedRoute from "@/components/auth/ProtectedRoute"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    )
}

export default Layout
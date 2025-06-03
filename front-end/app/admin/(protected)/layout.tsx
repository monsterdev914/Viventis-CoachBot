import ProtectedAdminRoute from "@/components/auth/ProtectedAdminRoute"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedAdminRoute>
            {children}
        </ProtectedAdminRoute>
    )
}

export default Layout
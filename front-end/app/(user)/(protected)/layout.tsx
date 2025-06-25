import ProtectedRoute from "@/components/auth/ProtectedRoute"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute>
            <div className="w-full flex flex-col flex-1">
                {children}
            </div>
        </ProtectedRoute>
    )
}

export default Layout
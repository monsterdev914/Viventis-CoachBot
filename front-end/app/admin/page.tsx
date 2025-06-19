'use client'
import ProtectedAdminRoute from "@/components/auth/ProtectedAdminRoute";
import Dashboard from "@/components/admin/Dashboard";

const Page: React.FC = () => {
    return (
        <ProtectedAdminRoute>
            <div className="container mx-auto px-4 py-8">
                <Dashboard />
            </div>
        </ProtectedAdminRoute>
    )
}

export default Page;
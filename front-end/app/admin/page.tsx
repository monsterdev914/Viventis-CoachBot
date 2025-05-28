'use client'
import ProtectedAdminRoute from "@/components/auth/ProtectedAdminRoute";
const Page: React.FC = () => {
    return (
        <ProtectedAdminRoute>
            <section className="w-full h-full flex items-center justify-center">
                <h1>Admin Dashboard</h1>
            </section>
        </ProtectedAdminRoute>
    )
}

export default Page;
import AdminLayout from "@/components/adminLayout";
import AdminProvider from "./provider";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AdminProvider>
            <AdminLayout>
                {children}
            </AdminLayout>
        </AdminProvider>
    )
}

export default Layout;
'use client'
import Navbar from "./admin/navbar"

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <section className="relative flex flex-col h-screen w-full bg-color">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-4 flex-grow ">
                {children}
            </main>
        </section>
    )
}

export default AdminLayout;
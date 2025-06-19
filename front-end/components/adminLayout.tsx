'use client'
import Navbar from "./admin/navbar"

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <section className="relative flex flex-col h-screen w-full bg-color">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-4 flex-grow ">
                {/* TODO: Add Background Image */}
                <div className="absolute inset-0 z-1"
                    style={{
                        backgroundImage: "url(/images/bg-img.png)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.1, // Set your desired opacity here
                        pointerEvents: "none", // So it doesn't block clicks
                    }}
                />
                {children}
            </main>
        </section>
    )
}

export default AdminLayout;
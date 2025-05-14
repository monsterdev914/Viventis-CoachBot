
import { Link } from "@heroui/link";
import { Navbar } from "./navbar";
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <section className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
                {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
                <Link
                    isExternal
                    className="flex items-center gap-1 text-current"
                    href="#"
                    title="Viventis.com homepage"
                >
                    <span className="text-default-600">Powered by</span>
                    <p className="text-primary">Viventis</p>
                </Link>
            </footer>
        </section>
    )
}

export default Layout;

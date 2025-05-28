import AdminProvider from "../provider"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <section className="w-full h-full flex items-center justify-center">
            {children}
        </section>
    )
}

export default Layout 
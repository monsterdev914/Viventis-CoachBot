const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="w-full h-full flex items-center justify-center">
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
        </div>
    )
}

export default Layout;
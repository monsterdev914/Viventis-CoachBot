import Layout from "@/components/layout";
import { Providers } from "../providers";

const UserLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Providers>
            <Layout>
                {children}
            </Layout>
        </Providers>
    )
}

export default UserLayout;
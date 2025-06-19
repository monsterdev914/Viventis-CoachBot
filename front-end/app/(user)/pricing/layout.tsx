import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

const PricingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SubscriptionProvider>
            {children}
        </SubscriptionProvider>
    );
};

export default PricingLayout; 
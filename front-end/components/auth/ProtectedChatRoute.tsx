'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Button, Spinner } from '@heroui/react'
import { useTranslation } from 'react-i18next'

interface ProtectedChatRouteProps {
    children: React.ReactNode
}

export default function ProtectedChatRoute({ children }: ProtectedChatRouteProps) {
    const { user, loading: authLoading } = useAuth()
    const { subscription, loading: subscriptionLoading, refreshSubscription } = useSubscription()
    const { t } = useTranslation()
    const router = useRouter()
    const [initialCheckComplete, setInitialCheckComplete] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user && !subscriptionLoading && !initialCheckComplete) {
            setInitialCheckComplete(true)
        }
    }, [user, authLoading, subscriptionLoading, router, initialCheckComplete])

    const hasActiveSubscription = () => {
        if (!subscription) return false

        const now = new Date()
        const currentPeriodEnd = new Date(subscription.current_period_end)
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null

        switch (subscription.status) {
            case 'active':
                return currentPeriodEnd > now
            case 'trialing':
                return trialEnd ? trialEnd > now : false
            case 'canceled':
                return currentPeriodEnd > now && !subscription.cancel_at_period_end
            default:
                return false
        }
    }

    const getTrialEndDate = () => {
        if (subscription?.status === 'trialing' && subscription.trial_end) {
            return new Date(subscription.trial_end).toLocaleDateString()
        }
        return null
    }

    // Show loading spinner while checking authentication
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!user) {
        return null
    }

    // Show loading while checking subscription
    if (subscriptionLoading || !initialCheckComplete) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" />
                    <p className="text-gray-600">Checking subscription status...</p>
                </div>
            </div>
        )
    }

    // Show subscription required message if no active subscription
    if (!hasActiveSubscription()) {
        const isTrialExpired = subscription?.status === 'trialing' && subscription.trial_end && new Date(subscription.trial_end) <= new Date()
        const isExpired = subscription?.status === 'expired' || (subscription?.status === 'active' && new Date(subscription.current_period_end) <= new Date())
        
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isTrialExpired ? 'Trial Expired' : 'Subscription Required'}
                        </h2>
                    </CardHeader>
                    <CardBody className="text-center space-y-4">
                        {isTrialExpired ? (
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    Your trial period has ended on {getTrialEndDate()}.
                                </p>
                                <p className="text-gray-600">
                                    Upgrade to a paid plan to continue using the chat.
                                </p>
                            </div>
                        ) : isExpired ? (
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    Your subscription has expired.
                                </p>
                                <p className="text-gray-600">
                                    Renew your subscription to continue using the chat.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-gray-600">
                                    You need an active subscription to access the chat feature.
                                </p>
                                <p className="text-gray-600">
                                    Choose a plan to get started with our AI coach!
                                </p>
                            </div>
                        )}
                        
                        <div className="space-y-3 pt-4">
                            <Button
                                color="primary"
                                variant="solid"
                                size="lg"
                                className="w-full"
                                onClick={() => router.push('/pricing')}
                            >
                                {isTrialExpired || isExpired ? 'Renew Subscription' : 'View Plans'}
                            </Button>
                            
                            <Button
                                color="default"
                                variant="bordered"
                                size="md"
                                className="w-full"
                                                            onClick={() => router.push('/')}
                        >
                            Back to Home
                            </Button>
                        </div>

                        {subscription && (
                            <div className="mt-6 p-3 bg-gray-100 rounded-lg">
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Current Status:</h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p>Status: <span className="font-medium">{subscription.status}</span></p>
                                    {subscription.status === 'trialing' && (
                                        <p>Trial ends: <span className="font-medium">{getTrialEndDate()}</span></p>
                                    )}
                                    {subscription.status !== 'trialing' && (
                                        <p>Period ends: <span className="font-medium">
                                            {new Date(subscription.current_period_end).toLocaleDateString()}
                                        </span></p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        )
    }

    // User has active subscription, render the chat
    return <>{children}</>
} 
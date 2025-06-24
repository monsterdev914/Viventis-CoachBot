'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Skeleton } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { CheckIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { useSubscription } from '@/contexts/SubscriptionContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

const PricingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { createSubscription, upgradeSubscription, convertTrialToPaid, refreshSubscription, error, plans, subscription, loading } = useSubscription();
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      message,
      type,
      visible: true
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleSubscribe = async (plan: typeof plans[0]) => {
    // Redirect to login if user is not authenticated
    if (!user) {
      router.push('/auth/login');
      return;
    }

    console.log('HandleSubscribe called with:', {
      planId: plan.id,
      planName: plan.name,
      planIsTrial: plan.is_trial,
      userSubscription: subscription,
      subscriptionStatus: subscription?.status
    });

    setLoadingPlans(prev => ({ ...prev, [plan.id]: true }));
    try {
      let response;
      
      // If user has no subscription, create new one
      if (!subscription) {
        console.log('Creating new subscription');
        response = await createSubscription(plan.id);
      } else {
        // If user has existing subscription, upgrade it
        console.log('Upgrading existing subscription');
        response = await upgradeSubscription(plan.id);
      }
      
      // Handle response - either redirect to checkout or show success message
      if (response.url) {
        console.log('Redirecting to checkout for payment');
        window.location.href = response.url;
      } else {
        console.log('Plan updated directly:', response.message);
        // Refresh subscription data to show the new plan
        await refreshSubscription();
        // Show success toast for trial plans or direct updates
        showToast(response.message || 'Plan updated successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      // Show error toast
      showToast(err.message || 'Failed to process subscription. Please try again.', 'error');
    } finally {
      setLoadingPlans(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  const isCurrentPlan = (plan: typeof plans[0]) => {
    if (!subscription || !user) return false;
    return subscription.plan_id === plan.id;
  };

  const getBillingText = (plan: typeof plans[0]) => {
    if (plan.is_trial) {
      return `${plan.trial_period_days || 7} days trial`;
    }
    
    const months = plan.billing_period_months;
    if (months === 1) return t('subscription.monthly');
    if (months === 3) return t('subscription.quarterly');
    if (months === 6) return t('subscription.semiAnnual');
    if (months === 12) return t('subscription.annual');
    return `${months} ${t('subscription.months')}`;
  };

  const getCurrentPlan = () => {
    if (!subscription || !user) return null;
    return plans.find(plan => plan.id === subscription.plan_id);
  };

  const isUpgradeOrDowngrade = (targetPlan: typeof plans[0]) => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan || !user || isCurrentPlan(targetPlan)) return null;

    // If current plan is trial and target is paid, it's always an upgrade
    if (currentPlan.is_trial && !targetPlan.is_trial) {
      return 'upgrade';
    }

    // If current plan is paid and target is trial, it's always a downgrade
    if (!currentPlan.is_trial && targetPlan.is_trial) {
      return 'downgrade';
    }

    // Both are paid plans - compare by price
    if (!currentPlan.is_trial && !targetPlan.is_trial) {
      if (targetPlan.price > currentPlan.price) {
        return 'upgrade';
      } else if (targetPlan.price < currentPlan.price) {
        return 'downgrade';
      }
    }

    return null;
  };

  const getButtonContent = (plan: typeof plans[0]) => {
    if (!user) {
      return t('subscription.loginToSubscribe');
    }

    if (isCurrentPlan(plan)) {
      return t('subscription.currentPlan');
    }

    const currentPlan = getCurrentPlan();

    // If trial plan is disabled for paid users, show "Not Available"
    if (currentPlan && !currentPlan.is_trial && plan.is_trial) {
      return t('subscription.notAvailable');
    }

    // Check if it's an upgrade or downgrade
    const upgradeType = isUpgradeOrDowngrade(plan);
    if (upgradeType === 'upgrade') {
      return (
        <div className="flex items-center justify-center gap-2">
          <ArrowUpIcon className="w-5 h-5" />
          {t('subscription.upgrade')}
        </div>
      );
    }
    if (upgradeType === 'downgrade') {
      return (
        <div className="flex items-center justify-center gap-2">
          <ArrowDownIcon className="w-5 h-5" />
          {t('subscription.downgrade')}
        </div>
      );
    }
    
    if (plan.is_trial) {
      return t('subscription.startTrial');
    }
    
    if (subscription?.status === 'trialing' && !plan.is_trial) {
      return t('subscription.upgradeTrial');
    }
    
    return t('subscription.subscribe');
  };

  const canSelectPlan = (plan: typeof plans[0]) => {
    // Always allow selection for non-authenticated users (will redirect to login)
    if (!user) return true;

    // Can't select current plan
    if (isCurrentPlan(plan)) return false;
    
    const currentPlan = getCurrentPlan();
    
    // If user has trial, they can only upgrade to paid plans (not another trial)
    if (subscription?.status === 'trialing' && plan.is_trial) return false;
    
    // If user has PAID subscription (current plan is not trial), they can't downgrade to trial
    if (currentPlan && !currentPlan.is_trial && plan.is_trial) return false;
    
    return true;
  };

  const getTrialEndDate = () => {
    if (subscription?.status === 'trialing' && subscription.trial_end) {
      return new Date(subscription.trial_end).toLocaleDateString();
    }
    return null;
  };

  const getPlanPrice = (plan: typeof plans[0]) => {
    if (plan.is_trial) {
      return 'FREE';
    }
    return `CHF ${plan.price}`;
  };

  const getPlanCardStyle = (plan: typeof plans[0]) => {
    let className = 'relative overflow-visible p-4';
    
    // Add current plan styling (only for authenticated users)
    if (user && isCurrentPlan(plan)) {
      className += ' border-success ring-2 ring-success';
    }
    // Add disabled plan styling for trial plans that can't be selected by paid users
    else if (user && !canSelectPlan(plan) && plan.is_trial) {
      className += ' border-gray-300 opacity-60';
    }
    // Add popular plan styling (Pro plan)
    else if (plan.name.includes('Pro')) {
      className += ' border-primary shadow-lg scale-105';
    }
    // Add trial plan styling
    else if (plan.is_trial) {
      className += ' border-2 border-dashed border-primary';
    }
    
    return className;
  };

  if (loading) {
    return (
      <div className="flex flex-col mt-10 w-full items-center justify-center gap-8">
        <div className="text-center">
          <Skeleton className="h-14 w-[400px] rounded-lg mb-4 bg-default-200" />
          <Skeleton className="h-6 w-[300px] rounded-lg bg-default-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="relative p-4">
              <CardHeader className="flex flex-col gap-2">
                <Skeleton className="h-8 w-[180px] rounded-lg bg-default-200" />
                <Skeleton className="h-16 w-full rounded-lg bg-default-200" />
                <div className="mt-4">
                  <Skeleton className="h-12 w-[120px] rounded-lg bg-default-200" />
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full bg-default-200" />
                      <Skeleton className="h-5 w-full rounded-lg bg-default-200" />
                    </div>
                  ))}
                </div>
              </CardBody>
              <CardFooter>
                <Skeleton className="h-12 w-full rounded-lg bg-default-200" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('subscription.choosePlan')}</h1>
        <p className="text-lg text-gray-600">{t('subscription.selectBestPlan')}</p>
        
        {!user && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mt-4">
            {t('subscription.loginRequired')}
          </div>
        )}
        
        {user && subscription?.status === 'trialing' && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mt-4">
            {t('subscription.trialActive')} {getTrialEndDate() && `until ${getTrialEndDate()}`}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* All Plans in One Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={getPlanCardStyle(plan)}
          >
            {plan.name.includes('Pro') && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                {t('subscription.popular')}
              </div>
            )}

            {plan.is_trial && (
              <div className="absolute -top-3 right-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                {t('subscription.trial')}
              </div>
            )}
            <CardHeader className="flex flex-col items-center pb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-center">
                <span className={`text-4xl font-bold ${plan.is_trial ? 'text-secondary' : 'text-default'}`}>
                  {getPlanPrice(plan)}
                </span>
                <span className="text-gray-500 ml-2">/ {getBillingText(plan)}</span>
              </div>
              {plan.description && (
                <p className="text-gray-600 text-center mt-2">{plan.description}</p>
              )}
            </CardHeader>

            <CardBody className="pt-0">
              {plan.features && (
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                color={
                  !user
                    ? "primary"
                    : isCurrentPlan(plan) 
                      ? "success" 
                      : !canSelectPlan(plan)
                        ? "default"
                        : isUpgradeOrDowngrade(plan) === 'upgrade'
                          ? "primary"
                          : isUpgradeOrDowngrade(plan) === 'downgrade'
                            ? "warning"
                            : plan.is_trial 
                              ? "secondary" 
                              : plan.name.includes('Pro') 
                                ? "primary" 
                                : "default"
                }
                variant={
                  user && isCurrentPlan(plan) 
                    ? "bordered" 
                    : !canSelectPlan(plan) && user
                      ? "bordered"
                      : "solid"
                }
                className={`w-full text-lg py-6 ${!canSelectPlan(plan) ? 'cursor-not-allowed opacity-50' : ''}`}
                size="lg"
                isLoading={loadingPlans[plan.id]}
                onClick={() => handleSubscribe(plan)}
                disabled={!canSelectPlan(plan)}
              >
                {getButtonContent(plan)}
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 text-gray-600">
        <p>{t('subscription.cancelAnytime')}</p>
      </div>

      {/* HeroUI Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Card
            key={toast.id}
            className={`
              min-w-[300px] max-w-[400px] p-4 shadow-lg transition-all duration-300 ease-in-out
              ${toast.type === 'success' ? 'bg-success-50 border-success-200' : ''}
              ${toast.type === 'error' ? 'bg-danger-50 border-danger-200' : ''}
              ${toast.type === 'info' ? 'bg-primary-50 border-primary-200' : ''}
              ${toast.visible ? 'animate-in slide-in-from-right' : 'animate-out slide-out-to-right'}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${toast.type === 'success' ? 'bg-success text-white' : ''}
                  ${toast.type === 'error' ? 'bg-danger text-white' : ''}
                  ${toast.type === 'info' ? 'bg-primary text-white' : ''}
                `}>
                  {toast.type === 'success' && (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  {toast.type === 'error' && (
                    <span className="text-xs font-bold">!</span>
                  )}
                  {toast.type === 'info' && (
                    <span className="text-xs font-bold">i</span>
                  )}
                </div>
                <span className={`
                  text-sm font-medium
                  ${toast.type === 'success' ? 'text-success-700' : ''}
                  ${toast.type === 'error' ? 'text-danger-700' : ''}
                  ${toast.type === 'info' ? 'text-primary-700' : ''}
                `}>
                  {toast.message}
                </span>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="min-w-6 h-6"
                onClick={() => removeToast(toast.id)}
              >
                <span className="text-lg leading-none">×</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;

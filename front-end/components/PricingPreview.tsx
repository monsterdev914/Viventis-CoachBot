'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Skeleton } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { CheckIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCardExpansion = (planId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const getLearnMoreContent = (plan: typeof plans[0]) => {
    const planIndex = plans.indexOf(plan);
    
    // Content for Plan 1 (Trial/Kompass - First card)
    if (plan.is_trial || planIndex === 0) {
      return {
        intro: (
          <>
            <p>
              Du spürst: So wie es gerade läuft, geht es nicht weiter.<br />
              Aber du kannst es noch nicht greifen. Du brauchst Raum – nicht Druck. Klarheit – nicht gleich Veränderung.
            </p>
            
            <p>
              Die Kompass-Testphase gibt dir einen geschützten Raum, um herauszufinden, wo du stehst.<br />
              Ganz ohne Verpflichtung, ganz bei dir.
            </p>
          </>
        ),
        benefits: [
          "7 Tage unbegrenzten Zugang zum CoachBot",
          "Erste Impulse, die dein Denken hinterfragen",
          "Das Kompassrad – dein Standort im Leben sichtbar gemacht"
        ],
        impact: "Du gewinnst erste Einsichten, wo dein Ungleichgewicht liegt. Du wirst stiller. Ehrlicher mit dir. Und vielleicht hörst du zum ersten Mal seit Langem wieder deine innere Stimme.",
        callToAction: "👉 Starte kostenlos. Nicht, um gleich alles zu ändern – sondern um ehrlich hinzuschauen."
      };
    }

    // Content for Plan 2 (Second card)
    if (planIndex === 1) {
      return {
        intro: (
          <>
            <p>
              Du hast zu viele Gedanken, aber keine Richtung.<br />
              Du funktionierst – aber innerlich ist es leer oder diffus. Du willst spüren, was wirklich zählt.
            </p>
            
            <p>
              In dieser Stufe lernst du, dich auszurichten – innen statt außen.<br />
              Du beginnst, mit dir in Verbindung zu kommen.
            </p>
          </>
        ),
        benefits: [
          "Unbegrenzten Zugang zum CoachBot",
          "Geführte Selbstcoaching-Impulse (Herz, Stille, Erdung)",
          "Einen wöchentlichen Fokus zur inneren Ausrichtung"
        ],
        impact: "Du wirst ruhiger. Klarer. Du erkennst, was du gerade wirklich brauchst – und was nicht mehr zu dir passt.",
        callToAction: "👉 Hol dir deine Mitte zurück – und beginne, dich wieder auf dich selbst auszurichten."
      };
    }

    // Content for Plan 3 (Third card - Wachstumspfad)
    if (planIndex === 2) {
      return {
        intro: (
          <>
            <p>
              Du hast genug analysiert. Jetzt willst du verändern.<br />
              Du willst nicht nur denken – du willst gehen. Deinen Weg. In deinem Tempo, aber mit echter Tiefe.
            </p>
            
            <p>
              <strong>Im Wachstumspfad beginnst du, aktiv Verantwortung zu übernehmen.</strong><br />
              Du trainierst neue Sichtweisen, neue Werkzeuge – und einen neuen Umgang mit dir selbst.
            </p>
          </>
        ),
        benefits: [
          "Alles aus der vorherigen Stufe",
          "Monatliches Leitthema (z. B. Selbstwert, Grenzen, Authentizität)",
          "Tiefergehende Übungen & Reflexionsfragen",
          "Persönlich abgestimmter CoachBot-Prompt",
          "Selbstcoaching-Tools wie Kompassfragen & Wertearbeit"
        ],
        impact: "Du gehst raus aus der Ohnmacht, rein in die Selbstführung. Du lernst, alte Muster zu erkennen – und neue Wege zu etablieren. Kein Coaching-Konsum mehr, sondern echte Integration.",
        callToAction: "👉 Wenn du wirklich wachsen willst – beginne hier."
      };
    }

    // Default content for Plan 4 (Fourth card - Wandlung/Transformation)
    return {
      intro: (
        <>
          <p>
            Du bist bereit, alte Haut abzustreifen.<br />
            Du willst nicht nur &quot;besser funktionieren&quot;, sondern echt leben. Ohne Masken. Ohne Selbstverrat.
          </p>
          
          <p>
            Die Stufe der Wandlung ist für Menschen, die bereit sind, tiefer zu schauen – und sich selbst zu begegnen.<br />
            Du lässt los, was du lange getragen hast – und beginnst, dich neu zu verkörpern.
          </p>
        </>
      ),
      benefits: [
        "Alles aus dem Wachstumspfad",
        "Zugang zu exklusiven Vertiefungspfaden (Schattenarbeit, Masken ablegen, Identität formen)",
        "Fragen, die tief gehen – und nicht immer angenehm sind",
        "10 % Rabatt auf Seminare, Retreats, 1:1-Coachings",
        "Jahresrückblick & Neuausrichtung mit dem CoachBot"
      ],
      impact: "Du hörst auf, dein altes Selbst zu reparieren – und beginnst, dein wahres Selbst freizulegen. Transformation wird nicht mehr ein Ziel, sondern ein Prozess, den du verkörperst.",
      callToAction: "👉 Nur für Menschen mit dem Mut zur Tiefe."
    };
  };

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
      <div className="w-full bg-[#ECECEC]">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="mb-2 bg-[#3BCC91] rounded-full px-4 py-2 w-fit mx-auto">
              <Skeleton className="h-5 w-[100px] rounded-lg bg-white/20" />
            </div>
            <Skeleton className="h-14 w-[400px] rounded-lg mb-4 bg-default-200 mx-auto" />
          </div>

          {/* Pricing Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Card className="relative p-4">
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
                    <Skeleton className="h-12 w-full rounded-lg bg-default-200 mt-6" />
                  </CardBody>
                </Card>
                {/* Learn More Toggle Skeleton */}
                <div className="pt-4">
                  <Skeleton className="h-10 w-full rounded-lg bg-default-200" />
                </div>
              </div>
            ))}
          </div>

          {/* Zusatzmodule Section Skeleton */}
          <section className="mt-16 bg-[#ECECEC]">
            <div className="mb-8">
              <Skeleton className="h-10 w-[200px] rounded-lg bg-default-200 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full rounded-lg bg-default-200" />
                <Skeleton className="h-4 w-3/4 rounded-lg bg-default-200" />
                <div className="text-left">
                  <Skeleton className="h-6 w-[150px] rounded-lg bg-default-200 mb-2" />
                  <Skeleton className="h-4 w-full rounded-lg bg-default-200 mb-2" />
                  <Skeleton className="h-4 w-2/3 rounded-lg bg-default-200 mb-4" />
                  <Skeleton className="h-6 w-[200px] rounded-lg bg-default-200" />
                </div>
              </div>
            </div>

            {/* Modules Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((col) => (
                <div key={col} className="space-y-6 bg-white rounded-lg p-6">
                  {[1, 2, 3].map((module) => (
                    <div key={module} className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-12 h-12 rounded-full bg-default-200 flex-shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-[200px] rounded-lg bg-default-200 mb-2" />
                          <Skeleton className="h-4 w-full rounded-lg bg-default-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Viventis Bot Section Skeleton */}
          <section className="mt-16 bg-[#ECECEC] py-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Image Skeleton */}
                <div className="lg:col-span-1 h-full">
                  <div className="text-center border-[10px] border-[#3BCC91] rounded-lg p-4 h-full flex items-center justify-center">
                    <Skeleton className="w-[300px] h-[176px] rounded-lg bg-default-200" />
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    <Skeleton className="h-10 w-[350px] rounded-lg bg-default-200" />
                    
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-[200px] rounded-lg bg-default-200" />
                      <Skeleton className="h-6 w-[300px] rounded-lg bg-default-200" />
                    </div>

                    <div className="p-6">
                      <Skeleton className="h-6 w-[250px] rounded-lg bg-default-200 mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full rounded-lg bg-default-200" />
                        <Skeleton className="h-4 w-full rounded-lg bg-default-200" />
                        <Skeleton className="h-4 w-3/4 rounded-lg bg-default-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className=" w-full bg-[#ECECEC]">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="mb-2 bg-[#3BCC91] rounded-full px-4 py-2 w-fit mx-auto">
            <p className="text-white">Abo-Modelle</p>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#032E26]">Ein Coach für jedes Budget</h1>

          {!user && (
            <div className="text-blue-700 px-4 py-3 mt-4">
              {t('subscription.loginRequired')}
            </div>
          )}

          {user && subscription?.status === 'trialing' && (
            <div className="text-blue-700 px-4 py-3 mt-4">
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
            <div key={plan.id}>
              <Card
                key={plan.id}
                className={getPlanCardStyle(plan)}
              >
                {plan.name.includes('Pro') && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {t('subscription.popular')}
                  </div>
                )}

                {plans.indexOf(plan) === 2 && (
                  <div className="elementor-price-table__ribbon absolute top-0 right-0">
                    <div className="elementor-price-table__ribbon-inner bg-[#3BCC91] text-white px-6 py-2 text-sm font-semibold transform rotate-45 translate-x-4 -translate-y-2 shadow-md">
                      Populär
                    </div>
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
                    className={`w-full text-lg py-6 mb-4 ${!canSelectPlan(plan) ? 'cursor-not-allowed opacity-50' : ''}`}
                    size="lg"
                    isLoading={loadingPlans[plan.id]}
                    onClick={() => handleSubscribe(plan)}
                    disabled={!canSelectPlan(plan)}
                  >
                    {getButtonContent(plan)}
                  </Button>


                </CardBody>
              </Card>
              {/* Learn More Toggle Section */}
              <div className=" pt-4">
                <button
                  onClick={() => toggleCardExpansion(plan.id)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Mehr erfahren
                  </span>
                  <div className="flex-shrink-0">
                    {expandedCards[plan.id] ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {expandedCards[plan.id] && (
                  <div className="mt-3 p-3 text-sm text-gray-600 space-y-3 animate-in slide-in-from-top duration-200">
                    {getLearnMoreContent(plan).intro}

                    <div>
                      <p className="font-semibold text-gray-800 mb-2">Du bekommst:</p>
                      <ul className="space-y-1 ml-4">
                        {getLearnMoreContent(plan).benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800 mb-1">Was das verändert:</p>
                      {getLearnMoreContent(plan).impact}
                    </div>

                    <p className="italic text-gray-500">
                      {getLearnMoreContent(plan).callToAction}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Zusatzmodule Section */}
        <section className="mt-16 bg-[#ECECEC]" id="services">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#032E26] mb-4">Zusatzmodule</h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  <strong>Gestalte deinen CoachBot so individuell wie dein Leben.</strong><br />
                  Neben dem Hauptmodul kannst du gezielt Erweiterungen aktivieren – für mehr Tiefe, Fokus oder Inspiration in deinem Alltag. 
                  Jedes Modul bringt eigene Impulse, Routinen oder Reflexionsfragen. – Du entscheidest, was dich gerade weiterbringt.
                </p>
                
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-[#032E26] mb-2">So funktioniert&apos;s:</h3>
                  <p className="mb-4">
                     Wähle ein oder mehrere Zusatzmodule<br />
                     Aktiviere sie direkt in deinem CoachBot<br />
                     Die Inhalte fliessen automatisch in deine Gespräche ein – punktgenau, passend, wirkungsvoll
                  </p>
                  
                  <h3 className="text-xl font-semibold text-[#032E26] mb-6">Modulübersicht & Preise:</h3>
                </div>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6 bg-white rounded-lg p-6">
                {/* Impulsmodul */}
                <div className=" p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#3BCC91] rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#032E26] mb-2">
                        Impulsmodul - CHF 5.00 / Monat
                      </h3>
                      <p className="text-gray-600">
                        2× wöchentlich eine Viventis-Weisheit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fokusfrage */}
                <div className=" p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#3BCC91] rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#032E26] mb-2">
                        Fokusfrage - CHF 5.00 / Monat
                      </h3>
                      <p className="text-gray-600">
                        Jeden Montag eine klärende Frage
                      </p>
                    </div>
                  </div>
                </div>

                {/* MetaCoach */}
                <div className=" p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#3BCC91] rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#032E26] mb-2">
                        MetaCoach - CHF 7.00 / Monat
                      </h3>
                      <p className="text-gray-600">
                        Hinterfragt deine Denkweise
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 bg-white rounded-lg p-6">
                {/* Rückblick */}
                <div className=" p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#3BCC91] rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#032E26] mb-2">
                        Rückblick - CHF 5.00 / Monat
                      </h3>
                      <p className="text-gray-600">
                        Freitags 3 Fragen zur Wochenreflexion
                      </p>
                    </div>
                  </div>
                </div>

                {/* Morgenfokus */}
                <div className=" p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#3BCC91] rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#032E26] mb-2">
                        Morgenfokus - CHF 4.00 / Monat
                      </h3>
                      <p className="text-gray-600">
                        Tägliche Startfrage
                      </p>
                    </div>
                  </div>
                </div>

                {/* Abendanke */}
                <div className=" p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#3BCC91] rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#032E26] mb-2">
                        Abendanke - CHF 4.00 / Monat
                      </h3>
                      <p className="text-gray-600">
                        Abendliche Integration
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Viventis Bot Section */}
        <section className="mt-16 bg-[#ECECEC] py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Left Column - Image */}
              <div className="lg:col-span-1 h-full">
                <div className="text-center border-[10px] border-[#3BCC91] rounded-lg p-4 h-full flex items-center justify-center">
                  <Image
                    src="/images/bot.png"
                    alt="Viventis Bot"
                    width={300}
                    height={176}
                    className="mx-auto "
                    sizes="(max-width: 300px) 100vw, 300px"
                  />
                </div>
              </div>

              {/* Right Column - Content */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-[#032E26] leading-tight">
                    7 x 24h - Praktisch - Wirkungsvoll.
                  </h2>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-[#032E26]">
                      Über den Viventis Bot
                    </h3>
                    
                    <p className="text-lg font-semibold text-gray-800">
                      Warum der Innere Kompass Führung nachhaltig stärkt
                    </p>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-[#032E26] mb-4">
                      Was den CoachBot besonders macht
                    </h4>
                    
                    <p className="text-gray-700 leading-relaxed">
                      Der CoachBot basiert auf dem bewährten System &quot;Der Innere Kompass&quot;. 
                      Entwickelt aus 20 Jahren Erfahrung in Persönlichkeitsentwicklung, 
                      verbindet er Klarheit, Struktur und Herz. Ohne Floskeln. Ohne Esoterik. 
                      Mit Wirkung.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
    </div>
  );
};

export default PricingPage;

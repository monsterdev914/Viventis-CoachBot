'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Skeleton } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { CheckIcon } from "@heroicons/react/24/outline";
import { useSubscription } from '../../../contexts/SubscriptionContext';


const PricingPage = () => {
  const { t } = useTranslation();
  const { createSubscription, error, prices, subscription, loading } = useSubscription();
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});

  const plans = [
    {
      name: 'Kompass-Testphase',
      description: 'Finde deinen Standort. Spüre, ob dein innerer Kompass ruft.',
      price: 0,
      priceId: "price_test",
      features: [
        'Impulse • CoachBot-Zugang • Kompassrad'
      ],
      popular: false,
      color: 'default'
    },
    {
      name: 'Innere Ausrichtung',
      description: 'Klärung - Fokus. Dein erster bewusster Schritt.',
      price: 15,
      priceId: prices?.[0]?.id || '',
      features: [
        'Selbstcoaching-Impulse',
        'Herz - Stille - Erdung',
        'Wochenfokus'
      ],
      popular: false,
      color: 'default'
    },
    {
      name: 'Wachstumspfad',
      description: 'Du übernimmst Verantwortung. Du gehst deinen Weg.',
      price: 39,
      priceId: prices?.[1]?.id || '',
      features: [
        'Monatsfokus',
        'Tiefergehende Übungen',
        'Persönlicher CoachBot-Prompt'
      ],
      popular: true,
      color: 'primary'
    },
    {
      name: 'Wandlung',
      description: 'Du gehst in Tiefe. Du lässt los, was nicht mehr zu dir gehört.',
      price: 89,
      priceId: prices?.[2]?.id || '',
      features: [
        'Schattenarbeit',
        'Vertiefungspfade',
        '10% Rabatt auf Viventis-Angebote',
      ],
      popular: false,
      color: 'secondary'
    }
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
    setLoadingPlans(prev => ({ ...prev, [plan.priceId]: true }));
    try {
      if (plan.name === 'Kompass-Testphase') {
        // Handle trial plan separately
        // You can implement your trial logic here
        return;
      }
      
      const response = await createSubscription(plan.priceId);
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoadingPlans(prev => ({ ...prev, [plan.priceId]: false }));
    }
  };

  const isCurrentPlan = (plan: typeof plans[0]) => {
    if (!subscription) return false;
    return subscription.items?.data[0]?.price?.id === plan.priceId;
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full items-center justify-center gap-8">
        <div className="text-center">
          <Skeleton className="h-14 w-[400px] rounded-lg mb-4 bg-default-200" />
          <Skeleton className="h-6 w-[300px] rounded-lg bg-default-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl px-4">
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
    <div className="flex flex-col w-full items-center justify-center gap-8 relative z-[9999]">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t('Ein Coach für jedes Budget')}</h1>
        <p className="text-white mb-8">{t('Wähle den Plan, der zu dir passt')}</p>
      </div>

      {error && (
        <div className="text-danger text-center mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl px-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative overflow-visible p-4 ${
              plan.popular ? 'border-primary shadow-lg scale-105' : ''
            } ${
              isCurrentPlan(plan) ? 'border-success ring-2 ring-success' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                  {t('Populär')}
                </div>
              </div>
            )}
            {isCurrentPlan(plan) && (
              <div className="absolute -top-4 right-4">
                <div className="bg-success text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                  {t('Current Plan')}
                </div>
              </div>
            )}
            <CardHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="text-default-500">{plan.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  CHF {plan.price}
                </span>
                <span className="text-default-500">/{plan.name === 'Kompass-Testphase' ? '7 Tage' : 'Monat'}</span>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon className="text-success w-5 h-5" />
                    <span>{t(feature)}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
            <CardFooter>
              <Button
                color={plan.color as any}
                variant={plan.popular ? 'solid' : 'bordered'}
                className={`w-full ${
                  plan.popular ? 'bg-gradient-to-r from-primary to-secondary text-white' : ''
                } ${
                  isCurrentPlan(plan) ? 'bg-success text-white' : ''
                }`}
                size="lg"
                isLoading={loadingPlans[plan.priceId]}
                onClick={() => handleSubscribe(plan)}
                disabled={isCurrentPlan(plan)}
              >
                {isCurrentPlan(plan) ? t('Current Plan') : t('Hier klicken')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;

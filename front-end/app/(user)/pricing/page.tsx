'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Divider } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { CheckIcon } from "@heroicons/react/24/outline";

const PricingPage = () => {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for individuals and small projects',
      price: {
        monthly: 9.99,
        yearly: 99.99
      },
      features: [
        'Basic AI coaching',
        '5 sessions per month',
        'Email support',
        'Basic analytics',
        'Community access'
      ],
      popular: false,
      color: 'default'
    },
    {
      name: 'Pro',
      description: 'Ideal for growing businesses and teams',
      price: {
        monthly: 29.99,
        yearly: 299.99
      },
      features: [
        'Advanced AI coaching',
        'Unlimited sessions',
        'Priority support',
        'Advanced analytics',
        'Team collaboration',
        'Custom integrations',
        'API access'
      ],
      popular: true,
      color: 'primary'
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      price: {
        monthly: 99.99,
        yearly: 999.99
      },
      features: [
        'Custom AI coaching',
        'Unlimited everything',
        '24/7 dedicated support',
        'Custom analytics',
        'Advanced team features',
        'White-label solution',
        'SLA guarantee',
        'Custom development'
      ],
      popular: false,
      color: 'secondary'
    }
  ];

  return (
    <div className="flex flex-col w-full items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t('Choose Your Plan')}</h1>
        <p className="text-default-500 mb-8">{t('Select the perfect plan for your needs')}</p>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={billingCycle === 'monthly' ? 'solid' : 'bordered'}
            onClick={() => setBillingCycle('monthly')}
            className={billingCycle === 'monthly' ? "bg-gradient-primary hover:opacity-90 transition-opacity text-[black]" : "hover:opacity-90 transition-opacity text-[white]"}
          >
            {t('Monthly')}
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'solid' : 'bordered'}
            onClick={() => setBillingCycle('yearly')}
            className={billingCycle === 'yearly' ? "bg-gradient-primary hover:opacity-90 transition-opacity text-[black]" : "hover:opacity-90 transition-opacity text-[white]"}
          >
            {t('Yearly')} <Chip className="ml-2" size="sm" variant="flat">-20%</Chip>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl px-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.popular ? 'border-primary' : ''}`}
          >
            {plan.popular && (
              <Chip
                className="absolute top-4 right-4"
                color="primary"
                variant="flat"
              >
                {t('Most Popular')}
              </Chip>
            )}
            <CardHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="text-default-500">{plan.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                </span>
                <span className="text-default-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
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
                className="w-full"
                size="lg"
              >
                {t('Get Started')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;

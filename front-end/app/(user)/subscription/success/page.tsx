'use client';

import { Card, CardBody, Button } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export default function SubscriptionSuccess() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Card className="w-full max-w-md">
        <CardBody className="text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">{t('Payment Successful!')}</h2>
          <p className="mb-6">{t('Thank you for your payment. Your subscription will be activated shortly.')}</p>
                              <Button color="primary" onClick={() => router.push('/')}>
                        {t('Go to Home')}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
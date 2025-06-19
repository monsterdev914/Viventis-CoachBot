'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/contexts/SubscriptionContext';
// Using built-in date formatting instead of date-fns
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getBillingText = (billingPeriodMonths: number) => {
  if (billingPeriodMonths === 1) return 'Monthly';
  if (billingPeriodMonths === 3) return 'Quarterly';
  if (billingPeriodMonths === 6) return 'Semi-Annual';
  if (billingPeriodMonths === 12) return 'Annual';
  return `Every ${billingPeriodMonths} months`;
};

const SubscriptionManagement = () => {
  const { t } = useTranslation();
  const { 
    subscription, 
    plans, 
    payments, 
    paymentMethods, 
    loading, 
    error, 
    cancelSubscription, 
    updateSubscription 
  } = useSubscription();
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelSubscription = async (immediate: boolean = false) => {
    if (!subscription) return;
    
    setCancelling(true);
    try {
      await cancelSubscription(subscription.id, immediate);
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'primary';
      case 'canceled':
        return 'danger';
      case 'paused':
        return 'warning';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return null;
    return plans.find(plan => plan.id === subscription.plan_id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {error && (
        <div className="text-danger bg-danger/10 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">{t('Current Subscription')}</h2>
        </CardHeader>
        <CardBody>
          {subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-default-500">{t('Plan')}</p>
                  <p className="font-semibold">{getCurrentPlan()?.name || 'Unknown Plan'}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">{t('Status')}</p>
                  <Chip color={getStatusColor(subscription.status)} variant="flat">
                    {t(subscription.status)}
                  </Chip>
                </div>
                <div>
                  <p className="text-sm text-default-500">{t('Billing Cycle')}</p>
                  <p className="font-semibold">
                    {getCurrentPlan()?.is_trial 
                      ? `${getCurrentPlan()?.trial_period_days || 7} days trial`
                      : getBillingText(getCurrentPlan()?.billing_period_months || 1)
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500">{t('Price')}</p>
                  <p className="font-semibold">
                    {getCurrentPlan()?.is_trial ? 'FREE' : `CHF ${getCurrentPlan()?.price || 0}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500">{t('Current Period')}</p>
                  <p className="font-semibold">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                {subscription.canceled_at && (
                  <div>
                    <p className="text-sm text-default-500">{t('Canceled At')}</p>
                    <p className="font-semibold text-danger">
                      {formatDate(subscription.canceled_at)}
                    </p>
                  </div>
                )}
              </div>
              
              {subscription.cancel_at_period_end && (
                <div className="bg-warning/10 p-4 rounded-lg">
                  <p className="text-warning font-semibold">
                    {t('Your subscription will be canceled at the end of the current billing period.')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-default-500">{t('No active subscription found.')}</p>
          )}
        </CardBody>
        {subscription && subscription.status === 'active' && !subscription.cancel_at_period_end && (
          <CardFooter>
            <Button
              color="danger"
              variant="bordered"
              onClick={() => setShowCancelModal(true)}
            >
              {t('Cancel Subscription')}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">{t('Payment History')}</h2>
        </CardHeader>
        <CardBody>
          {payments.length > 0 ? (
            <Table aria-label="Payment history">
              <TableHeader>
                <TableColumn>{t('Date')}</TableColumn>
                <TableColumn>{t('Amount')}</TableColumn>
                <TableColumn>{t('Status')}</TableColumn>
                <TableColumn>{t('Method')}</TableColumn>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell>
                      {payment.currency.toUpperCase()} {payment.amount}
                    </TableCell>
                    <TableCell>
                      <Chip color={getPaymentStatusColor(payment.status)} variant="flat">
                        {t(payment.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {payment.payment_method || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-default-500">{t('No payment history found.')}</p>
          )}
        </CardBody>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">{t('Payment Methods')}</h2>
        </CardHeader>
        <CardBody>
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {method.payment_type === 'credit_card' ? '💳' : '💰'}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {method.card_brand} ****{method.card_last_four}
                      </p>
                      <p className="text-sm text-default-500">
                        Expires {method.card_exp_month}/{method.card_exp_year}
                      </p>
                    </div>
                  </div>
                  {method.is_default && (
                    <Chip color="primary" variant="flat">
                      {t('Default')}
                    </Chip>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-default-500">{t('No payment methods found.')}</p>
          )}
        </CardBody>
      </Card>

      {/* Cancel Subscription Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold">{t('Cancel Subscription')}</h3>
          </ModalHeader>
          <ModalBody>
            <p>{t('Are you sure you want to cancel your subscription?')}</p>
            <p className="text-sm text-default-500">
              {t('You can choose to cancel immediately or at the end of your current billing period.')}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={() => setShowCancelModal(false)}
            >
              {t('Keep Subscription')}
            </Button>
            <Button
              color="warning"
              variant="flat"
              onClick={() => handleCancelSubscription(false)}
              isLoading={cancelling}
            >
              {t('Cancel at Period End')}
            </Button>
            <Button
              color="danger"
              onClick={() => handleCancelSubscription(true)}
              isLoading={cancelling}
            >
              {t('Cancel Immediately')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubscriptionManagement; 
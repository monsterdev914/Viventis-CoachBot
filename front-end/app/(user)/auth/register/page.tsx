'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Input, Button, Link, Checkbox, addToast } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { signUp } from '@/app/api';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isCheckedGDPR, setIsCheckedGDPR] = useState(false);
    const [isCheckedPrivacy, setIsCheckedPrivacy] = useState(false);
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    // Check for existing user and redirect immediately
    useEffect(() => {
        if (user) {
            router.replace('/dashboard');
        }
    }, [user, router]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await signUp(formData.email, formData.password, isCheckedGDPR, isCheckedPrivacy);
            if (response.status === 200) {
                setError('');
                router.push('/auth/verify-email');
            }
            else if (response.status === 405) {
                addToast({ title: "System Notification", description: response.data.error, color: "danger" });
                setError('You have already registered');
                router.push('/auth/login');
            }
            else if (response.status === 409) {
                addToast({ title: "System Notification", description: response.data.error, color: "danger" });
            }
        } catch (err: any) {
            setError(err.response.data.error);
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Don't render anything if not mounted or if user exists
    if (!mounted || user) {
        return null;
    }

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-md min-w-fit mx-auto px-5 pt-10 pb-5">
                <CardHeader className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-center">{t('Create your account')}</h1>
                    <p className="text-center text-default-500">
                        {t('Already have an account?')}{' '}
                        <Link href="/auth/login" color="primary" className='text-secondary hover:text-primary transition-colors' as={NextLink}>
                            {t('Sign in')}
                        </Link>
                    </p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <Input
                            type="email"
                            label={t('Email')}
                            placeholder={t('Enter your email')}
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isRequired
                            variant="bordered"
                        />
                        <Input
                            type="password"
                            label={t('Password')}
                            placeholder={t('Enter your password')}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            isRequired
                            variant="bordered"
                        />
                        <Input
                            type="password"
                            label={t('Confirm Password')}
                            placeholder={t('Confirm your password')}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isRequired
                            variant="bordered"
                        />
                        {error && (
                            <p className="text-danger text-sm text-center">
                                {error}
                            </p>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-[black]"
                            size="lg"
                            isLoading={loading}
                            disabled={!isCheckedPrivacy || !isCheckedGDPR}
                        >
                            {t('register')}
                        </Button>
                    </form>
                    {/* Policy and compliance , GDPR*/}
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex flex-row gap-2">
                            {/* Check Box */}
                            <Checkbox checked={isCheckedPrivacy} onChange={() => setIsCheckedPrivacy(!isCheckedPrivacy)} />
                            <p className="text-sm text-default-500">
                                {t('I agree to the')} <Link href="/policy" className="text-secondary">{t('Privacy Policy')}</Link> {t('and')} <Link href="/terms" className="text-secondary">{t('Terms of Service')}</Link>.
                            </p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <Checkbox checked={isCheckedGDPR} onChange={() => setIsCheckedGDPR(!isCheckedGDPR)} />
                            <p className="text-sm text-default-500">
                                {t('We are compliant with')} <Link href="/policy" className="text-secondary">{t('GDPR')}</Link> {t('and')} <Link href="/terms" className="text-secondary">{t('CCPA')}</Link>.
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default RegisterPage;
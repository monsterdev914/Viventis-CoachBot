'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Input, Button, Link, Checkbox, Alert, addToast } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { signUp } from '@/app/api';
import { useAuth } from '@/contexts/AuthContext';
const RegisterPage: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await signUp(formData.email, formData.password);
            console.log(response.status)
            if (response.status === 200) {
                setError('');
                router.push('/auth/verify-email');
            }
            else if (response.status === 405) {
                //Alert
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
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-md min-w-fit mx-auto px-5 pt-10 pb-5">
                <CardHeader className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-center">{t('Create your account')}</h1>
                    <p className="text-center text-default-500">
                        {t('Already have an account?')}{' '}
                        <Link href="/auth/login" color="primary">
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
                        >
                            {t('register')}
                        </Button>
                    </form>
                    {/* Policy and compliance , GDPR*/}
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex flex-row gap-2">
                            {/* Check Box */}
                            <Checkbox />
                            <p className="text-sm text-default-500">
                                {t('I agree to the')} <Link href="/policy" className="text-secondary">{t('Privacy Policy')}</Link> {t('and')} <Link href="/terms" className="text-secondary">{t('Terms of Service')}</Link>.
                            </p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <Checkbox />
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
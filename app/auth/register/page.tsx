'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Input, Button, Link, Checkbox } from "@heroui/react";
import { useTranslation } from 'react-i18next';

const RegisterPage: React.FC = () => {
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
            // TODO: Implement registration logic here
            // const response = await fetch('/api/auth/register', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         email: formData.email,
            //         password: formData.password,
            //     }),
            // });

            // if (response.ok) {
            //     router.push('/auth/login');
            // }
        } catch (err) {
            setError('An error occurred during registration');
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
        <div className="flex justify-center bg-background">
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
                            color="primary"
                            className="w-full"
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
                                {t('I agree to the')} <Link href="/policy">{t('Privacy Policy')}</Link> {t('and')} <Link href="/terms">{t('Terms of Service')}</Link>.
                            </p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <Checkbox />
                            <p className="text-sm text-default-500">
                                {t('We are compliant with')} <Link href="/policy">{t('GDPR')}</Link> {t('and')} <Link href="/terms">{t('CCPA')}</Link>.
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default RegisterPage;
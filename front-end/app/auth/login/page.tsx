'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Input, Button, Link, Avatar } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { signIn } from '@/app/api/auth';
const LoginPage: React.FC = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setMounted(true);
        // Check for verification success
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('verified') === 'true') {
            setSuccess('Email verified successfully! You can now log in.');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await signIn(formData.email, formData.password);
            if (response.status === 200) {
                setSuccess('Login successful');
                localStorage.setItem('token', response.data.token);
                router.push('/dashboard');
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError('An error occurred during login');
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
                <div className="flex justify-center mb-4">
                    <Avatar
                        className="w-20 h-20"
                        src="/images/user-avatar.png"
                        fallback="U"
                        size="lg"
                    />
                </div>
                <CardHeader className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-center">{t('Sign in to your account')}</h1>
                    <p className="text-center text-default-500">
                        {t('Don\'t have an account?')}{' '}
                        <Link href="/auth/register" color="primary">
                            {t('Create an account')}
                        </Link>
                    </p>
                </CardHeader>
                <CardBody>
                    {success && (
                        <div className="mb-4 p-4 bg-success-50 text-success-700 rounded-lg">
                            {success}
                        </div>
                    )}
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
                            {t('Sign in')}
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default LoginPage;
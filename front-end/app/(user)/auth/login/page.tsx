'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Input, Button, Link, Avatar } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { signIn } from '@/app/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import NextLink from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await signIn(formData.email, formData.password);
            if (response.status === 200) {
                setSuccess(t('errors.loginSuccess'));
                setUser(response.data.user);
                localStorage.setItem('token', response.data.token);
                if (response.data.last_chat) {
                    router.push(`/chat/${response.data.last_chat.id}`);
                } else {
                    router.push('/chat');
                }

            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError(t('errors.loginFailed'));
        } finally {
            setLoading(false);
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
        <div className="flex justify-center items-center">
            <Card className="w-full max-w-md min-w-fit mx-auto px-5 pt-10 pb-5">
                <div className="flex justify-center mb-4">
                    <Avatar
                        className="w-20 h-20"
                        src="/images/logo.png"
                        fallback="U"
                        size="lg"
                    />
                </div>
                <CardHeader className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-center">{t('Sign in to your account')}</h1>
                    <p className="text-center text">
                        {t('Don\'t have an account?')}{' '}
                        <Link href="/auth/register" color="primary" className='text-secondary hover:text-primary transition-colors' as={NextLink}>
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
                            type={showPassword ? 'text' : 'password'}
                            label={t('Password')}
                            endContent={
                                <Button variant="light" size="sm" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeIcon className="text-2xl text-default-400 pointer-events-none" /> : <EyeSlashIcon className="text-2xl text-default-400 pointer-events-none" />}
                                </Button>
                            }
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
                            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-[black]"
                            size="lg"
                            isLoading={loading}
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
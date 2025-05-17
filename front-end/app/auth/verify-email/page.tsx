'use client';

import { Card, CardHeader, CardBody, Button, Link, Spinner } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { resendVerification, verifyEmail } from "@/app/api/auth";
import { useAuth } from "@/contexts/AuthContext";
export default function VerifyEmailPage() {
    const { emailVerified, setEmailVerified } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [, setToken] = useState('');
    const [, setError] = useState('');
    const [, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const handleResendVerification = async () => {
        setLoading(true);
        try {
            const response = await resendVerification(email);
            setSuccess(response.data.message);
        } catch (error: any) {
            setError(error.response.data.error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        const email = searchParams.get('email');
        const token = searchParams.get('token');
        if (email && token) {
            setEmail(email);
            setToken(token);
        }

        if (email && token) {
            setLoading(true);
            verifyEmail(email, token).then((response) => {
                if (response.data?.verified) {
                    setSuccess(response.data.message);
                    setEmailVerified(true);
                } else {
                    setError(response.data.error);
                }
                setLoading(false);
            })
        }
        // if (emailVerified) {
        //     router.push('/auth/login');
        // }
    }, []);
    useEffect(() => {
        if (emailVerified) {
            router.push('/auth/login?verified=true');
        }
    }, [emailVerified]);
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }
    return (
        <div className="flex justify-center bg-background">
            <Card className="w-full max-w-md min-w-fit mx-auto px-5 pt-10 pb-5">
                <CardHeader className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-center">{t('Verify your email')}</h1>
                </CardHeader>
                <CardBody className="flex flex-col gap-4">
                    <p className="text-center text-default-500">
                        {t('We have sent you a confirmation email. Please check your inbox and click the verification link to activate your account.')}
                    </p>
                    <div className="flex flex-col gap-2">
                        <Button
                            color="primary"
                            className="w-full"
                            onClick={() => router.push('/auth/login')}
                        >
                            {t('Go to Login')}
                        </Button>
                        <p className="text-center text-default-500">
                            {t('Didn\'t receive the email?')}{' '}
                            <Link href="#" color="primary" onClick={handleResendVerification}>
                                {t('Resend verification email')}
                            </Link>
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
} 
'use client'
import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react"
import { Input, Textarea } from "@heroui/input"
import { Button } from "@heroui/react"
import { getBotSettings, saveBotSettings } from '@/app/api/botSetting'
import { useTranslation } from 'react-i18next'

interface BotSettings {
    id?: string;
    name: string;
    description: string;
    welcome_message: string;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
    model: string;
}

const BotSetting = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<BotSettings>({
        name: '',
        description: '',
        welcome_message: '',
        system_prompt: '',
        temperature: 0.7,
        max_tokens: 2000,
        model: 'gpt-3.5-turbo'
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setInitialLoading(true);
            const settings = await getBotSettings();
            if (settings) {
                console.log(settings);
                setSettings(settings);
            }
            else {
                setError(t('admin.botSettings.errorLoading'));
            }
        } catch (error: any) {
            setError(error?.data?.error || t('admin.botSettings.errorLoading'));
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await saveBotSettings(settings);
            setSuccess(t('admin.botSettings.settingsSaved'));
        } catch (error: any) {
            setError(error.response?.data?.error || t('admin.botSettings.errorSaving'));
        } finally {
            setLoading(false);
        }
    };

    // Skeleton component for loading state
    const SettingsSkeleton = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bot Name */}
                <div className="space-y-2">
                    <Skeleton className="w-20 h-4 rounded" />
                    <Skeleton className="w-full h-12 rounded-lg" />
                </div>
                
                {/* Model */}
                <div className="space-y-2">
                    <Skeleton className="w-16 h-4 rounded" />
                    <Skeleton className="w-full h-12 rounded-lg" />
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                    <Skeleton className="w-24 h-4 rounded" />
                    <Skeleton className="w-full h-12 rounded-lg" />
                </div>
                
                {/* Welcome Message */}
                <div className="space-y-2">
                    <Skeleton className="w-32 h-4 rounded" />
                    <Skeleton className="w-full h-12 rounded-lg" />
                </div>
                
                {/* Temperature */}
                <div className="space-y-2">
                    <Skeleton className="w-24 h-4 rounded" />
                    <Skeleton className="w-full h-12 rounded-lg" />
                </div>
                
                {/* Max Tokens */}
                <div className="space-y-2">
                    <Skeleton className="w-24 h-4 rounded" />
                    <Skeleton className="w-full h-12 rounded-lg" />
                </div>
            </div>

            {/* System Prompt */}
            <div className="mt-6 space-y-2">
                <Skeleton className="w-28 h-4 rounded" />
                <Skeleton className="w-full h-24 rounded-lg" />
            </div>

            {/* Save Button */}
            <Skeleton className="w-32 h-10 rounded-lg" />
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{t('admin.botSettings.title')}</h1>
            <Card className='p-6'>
                <CardBody>
                    {initialLoading ? (
                        <SettingsSkeleton />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label={t('admin.botSettings.botName')}
                                    name="name"
                                    value={settings.name}
                                    onChange={handleChange}
                                    placeholder={t('admin.botSettings.botNamePlaceholder')}
                                    required
                                />
                                <Input
                                    label={t('admin.botSettings.model')}
                                    name="model"
                                    value={settings.model}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label={t('admin.botSettings.description')}
                                    name="description"
                                    value={settings.description}
                                    onChange={handleChange}
                                    placeholder={t('admin.botSettings.descriptionPlaceholder')}
                                    required
                                />
                                <Input
                                    label={t('admin.botSettings.welcomeMessage')}
                                    name="welcome_message"
                                    value={settings.welcome_message}
                                    onChange={handleChange}
                                    placeholder={t('admin.botSettings.welcomeMessagePlaceholder')}
                                    required
                                />
                                <div className="space-y-2">
                                    <Input
                                        type="number"
                                        label={t('admin.botSettings.temperature')}
                                        name="temperature"
                                        value={settings.temperature.toString()}
                                        onChange={handleChange}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        required
                                    />
                                    <p className="text-xs text-default-500">{t('admin.botSettings.temperatureDesc')}</p>
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="number"
                                        label={t('admin.botSettings.maxTokens')}
                                        name="max_tokens"
                                        value={settings.max_tokens.toString()}
                                        onChange={handleChange}
                                        min={1}
                                        required
                                    />
                                    <p className="text-xs text-default-500">{t('admin.botSettings.maxTokensDesc')}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Textarea
                                    label={t('admin.botSettings.systemPrompt')}
                                    name="system_prompt"
                                    value={settings.system_prompt}
                                    onChange={handleChange}
                                    placeholder={t('admin.botSettings.systemPromptPlaceholder')}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-danger text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="text-success text-sm">
                                    {success}
                                </div>
                            )}

                            <Button
                                type="submit"
                                color="primary"
                                isLoading={loading}
                            >
                                {loading ? t('admin.botSettings.saving') : t('admin.botSettings.saveSettings')}
                            </Button>
                        </form>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default BotSetting;
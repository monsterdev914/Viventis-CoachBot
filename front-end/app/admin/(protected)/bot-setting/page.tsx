'use client'
import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from "@heroui/react"
import { Input, Textarea } from "@heroui/input"
import { Button } from "@heroui/react"
import { getBotSettings, saveBotSettings } from '@/app/api/botSetting'
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
                setError('No settings found');
            }
        } catch (error: any) {
            setError(error?.data?.error || 'Failed to fetch settings');
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
            setSuccess('Settings updated successfully');
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const SkeletonLoader = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bot Name Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Model Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Description Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Welcome Message Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Temperature Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Max Tokens Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>

            {/* System Prompt Skeleton */}
            <div className="mt-6 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Button Skeleton */}
            <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <h1 className="text-2xl font-bold">Bot Settings</h1>
                </CardHeader>
                <CardBody>
                    {initialLoading ? (
                        <SkeletonLoader />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Bot Name"
                                    name="name"
                                    value={settings.name}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Model"
                                    name="model"
                                    value={settings.model}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Description"
                                    name="description"
                                    value={settings.description}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Welcome Message"
                                    name="welcome_message"
                                    value={settings.welcome_message}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    type="number"
                                    label="Temperature"
                                    name="temperature"
                                    value={settings.temperature.toString()}
                                    onChange={handleChange}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    required
                                />
                                <Input
                                    type="number"
                                    label="Max Tokens"
                                    name="max_tokens"
                                    value={settings.max_tokens.toString()}
                                    onChange={handleChange}
                                    min={1}
                                    required
                                />
                            </div>

                            <div className="mt-6">
                                <Textarea
                                    label="System Prompt"
                                    name="system_prompt"
                                    value={settings.system_prompt}
                                    onChange={handleChange}
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
                                Save Settings
                            </Button>
                        </form>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default BotSetting;
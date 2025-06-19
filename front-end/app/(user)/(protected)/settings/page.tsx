'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Input, Button, Avatar, Switch, Divider, Select, SelectItem, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/app/api/userProfile';
import { changePassword, deleteAccount, signOut } from '@/app/api/auth';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import SettingsSkeleton from '@/components/SettingsSkeleton';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    last_login: string;
    privacy: boolean;
    gdpr_consent: boolean;
}

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
    });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Password change modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Delete account modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    // Export data state
    const [isExporting, setIsExporting] = useState(false);
    const { subscription } = useSubscription();

    useEffect(() => {
        setMounted(true);
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile();
            if (response.status === 200) {
                const profileData = response.data;
                setProfile(profileData);
                setFormData({
                    first_name: profileData.first_name || '',
                    last_name: profileData.last_name || '',
                    email: profileData.email || user?.email || '',
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile information');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await updateUserProfile(formData);
            if (response.status === 200) {
                setSuccess('Profile updated successfully');
                // Update profile state with new data
                if (profile) {
                    setProfile({
                        ...profile,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email
                    });
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
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

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        setPasswordLoading(true);

        try {
            const response = await changePassword(passwordData.currentPassword, passwordData.newPassword);
            if (response.status === 200) {
                setSuccess('Password changed successfully. You will be logged out.');
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                
                // Logout and redirect after a short delay
                setTimeout(async () => {
                    await signOut();
                    setUser(null);
                    router.push('/auth/login');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword.trim()) {
            setError('Please enter your password to confirm account deletion');
            return;
        }

        setDeleteLoading(true);
        setError('');

        try {
            const response = await deleteAccount(deletePassword);
            if (response.status === 200) {
                setSuccess('Account deleted successfully. You will be redirected to the login page.');
                setShowDeleteModal(false);
                
                // Clear user data and redirect after a short delay
                setTimeout(async () => {
                    await signOut();
                    setUser(null);
                    router.push('/auth/login');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete account');
        } finally {
            setDeleteLoading(false);
        }
    };

    const exportUserData = async () => {
        try {
            setIsExporting(true);
            setError('');

            // Gather all user data
            const userData = {
                'User ID': profile?.id || '',
                'First Name': profile?.first_name || '',
                'Last Name': profile?.last_name || '',
                'Email': profile?.email || '',
                'Account Created': profile?.created_at ? new Date(profile.created_at).toLocaleString() : '',
                'Last Login': profile?.last_login ? new Date(profile.last_login).toLocaleString() : 'Never',
                'Privacy Settings': profile?.privacy ? 'Enabled' : 'Disabled',
                'GDPR Consent': profile?.gdpr_consent ? 'Yes' : 'No',
                'Subscription Status': subscription?.status || 'No subscription',
                'Subscription Plan': subscription?.plan_id || 'N/A',
                'Subscription Start': subscription?.current_period_start ? new Date(subscription.current_period_start).toLocaleString() : 'N/A',
                'Subscription End': subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleString() : 'N/A',
                'Export Date': new Date().toLocaleString()
            };

            // Convert to CSV
            const headers = Object.keys(userData);
            const values = Object.values(userData);
            
            const csvContent = [
                headers.join(','),
                values.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `${profile?.first_name}-${profile?.last_name}-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            setSuccess('User data exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            setError('Failed to export user data');
        } finally {
            setIsExporting(false);
        }
    };

    if (!mounted || loading) {
        return <SettingsSkeleton />;
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl mt-10 w-full">
            {success && (
                <div className="mb-6 p-4 bg-success-50 text-success-700 rounded-lg">
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-danger-50 text-danger-700 rounded-lg">
                    {error}
                </div>
            )}

            <Tabs aria-label="Settings tabs" className="w-full">
                <Tab key="profile" title={t('Profile')}>
                    <Card className='w-full'>
                        <CardHeader>
                            <h2 className="text-2xl font-semibold text-black">{t('Profile Information')}</h2>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label={t('First Name')}
                                        placeholder={t('Enter your first name')}
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        variant="bordered"
                                        isRequired
                                    />
                                    <Input
                                        label={t('Last Name')}
                                        placeholder={t('Enter your last name')}
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        variant="bordered"
                                        isRequired
                                    />
                                </div>
                                <Input
                                    type="email"
                                    label={t('Email')}
                                    placeholder={t('Enter your email')}
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    variant="bordered"
                                    isRequired
                                    isDisabled
                                    description={t('Contact support to change your email address')}
                                />
                                
                                {profile && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">{t('Account Created')}</p>
                                            <p className="font-medium text-black">
                                                {new Date(profile.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">{t('Last Login')}</p>
                                            <p className="font-medium text-black">
                                                {profile.last_login ? new Date(profile.last_login).toLocaleDateString() : t('Never')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <Divider />
                                
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        className="bg-gradient-primary hover:opacity-90 transition-opacity text-black"
                                        isLoading={loading}
                                    >
                                        {t('Update Profile')}
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="subscription" title={t('Subscription')}>
                    <SubscriptionManagement />
                </Tab>

                <Tab key="security" title={t('Security')}>
                    <Card className='w-full'>
                        <CardHeader>
                            <h2 className="text-2xl font-semibold text-black">{t('Security Settings')}</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-black mb-2">{t('Change Password')}</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {t('Update your password to keep your account secure')}
                                    </p>
                                    <Button
                                        variant="bordered"
                                        onClick={() => setShowPasswordModal(true)}
                                    >
                                        {t('Change Password')}
                                    </Button>
                                </div>
                                <Divider />

                                <div>
                                    <h3 className="font-medium text-black mb-2">{t('Export Your Data')}</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {t('Download a copy of your personal data in CSV format')}
                                    </p>
                                    <Button
                                        variant="bordered"
                                        onClick={exportUserData}
                                        isLoading={isExporting}
                                        startContent={
                                            !isExporting && (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                </svg>
                                            )
                                        }
                                    >
                                        {isExporting ? t('Exporting...') : t('Export My Data')}
                                    </Button>
                                </div>
                                <Divider />

                                <div>
                                    <h3 className="font-medium text-black mb-2">{t('Account Deletion')}</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {t('Permanently delete your account and all associated data')}
                                    </p>
                                    <Button
                                        color="danger"
                                        variant="bordered"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        {t('Delete Account')}
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>

            {/* Change Password Modal */}
            <Modal 
                isOpen={showPasswordModal} 
                onClose={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setError('');
                }}
                size="md"
            >
                <ModalContent>
                    <ModalHeader>
                        <h3 className="text-xl font-semibold text-black">{t('Change Password')}</h3>
                    </ModalHeader>
                    <form onSubmit={handlePasswordSubmit}>
                        <ModalBody>
                            <div className="space-y-4">
                                <Input
                                    type="password"
                                    label={t('Current Password')}
                                    placeholder={t('Enter your current password')}
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    variant="bordered"
                                    isRequired
                                    className='text-black'
                                />
                                <Input
                                    type="password"
                                    label={t('New Password')}
                                    placeholder={t('Enter your new password')}
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    variant="bordered"
                                    isRequired
                                    description={t('Password must be at least 6 characters long')}
                                    className='text-black'
                                />
                                <Input
                                    type="password"
                                    label={t('Confirm New Password')}
                                    placeholder={t('Confirm your new password')}
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    variant="bordered"
                                    isRequired
                                    className='text-black'
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    setError('');
                                }}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-primary hover:opacity-90 transition-opacity text-black"
                                isLoading={passwordLoading}
                            >
                                {t('Change Password')}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            {/* Delete Account Modal */}
            <Modal 
                isOpen={showDeleteModal} 
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setError('');
                }}
                size="md"
            >
                <ModalContent>
                    <ModalHeader>
                        <h3 className="text-xl font-semibold text-danger">{t('Delete Account')}</h3>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <div className="bg-danger-50 p-4 rounded-lg">
                                <p className="text-danger font-semibold mb-2">
                                    {t('Warning: This action cannot be undone!')}
                                </p>
                                <p className="text-danger text-sm">
                                    {t('Deleting your account will permanently remove all your data, chat history, and subscription information. This action is irreversible.')}
                                </p>
                            </div>
                            <Input
                                type="password"
                                label={t('Enter your password to confirm')}
                                placeholder={t('Your current password')}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                variant="bordered"
                                isRequired
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="light"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeletePassword('');
                                setError('');
                            }}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            color="danger"
                            onClick={handleDeleteAccount}
                            isLoading={deleteLoading}
                        >
                            {t('Delete My Account')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default SettingsPage; 
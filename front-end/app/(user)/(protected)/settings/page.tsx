'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tabs, Tab } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from '@/app/api/userProfile';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import api from '@/utiles/axiosConfig';

interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

const SettingsPage = () => {
    const { user } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    // Profile state
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    // Success/error messages
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setProfileLoading(true);
        try {
            const response = await getUserProfile();
            if (response.data) {
                setProfile(response.data);
                setFirstName(response.data.first_name || '');
                setLastName(response.data.last_name || '');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile data');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
            await api.put(`${API_URL}/userProfile`, {
                first_name: firstName,
                last_name: lastName
            });
            
            setMessage('Profile updated successfully!');
            fetchUserProfile(); // Refresh profile data
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        
        setPasswordLoading(true);
        setError('');
        setMessage('');
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
            await api.put(`${API_URL}/auth/change-password`, {
                currentPassword,
                newPassword
            });
            
            setMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (error: any) {
            console.error('Error changing password:', error);
            setError(error.response?.data?.error || 'Failed to change password. Please try again.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const clearMessages = () => {
        setMessage('');
        setError('');
    };

    if (profileLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-96 bg-gray-200 rounded"></div>
                            <div className="h-96 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">User Settings</h1>
                
                {/* Success/Error Messages */}
                {message && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {message}
                        <button onClick={clearMessages} className="float-right text-green-500 hover:text-green-700">×</button>
                    </div>
                )}
                
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                        <button onClick={clearMessages} className="float-right text-red-500 hover:text-red-700">×</button>
                    </div>
                )}

                <Tabs aria-label="Settings tabs" className="w-full">
                    <Tab key="profile" title="Profile Settings">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            {/* Profile Settings */}
                            <Card className="w-full">
                                <CardHeader>
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-semibold">Profile Information</h2>
                                        <p className="text-sm text-gray-600">Update your personal information</p>
                                    </div>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                            value={user?.email || ''}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name</label>
                                        <Input
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <Input
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                    
                                    <div className="pt-4">
                                        <Button
                                            color="primary"
                                            onClick={handleProfileUpdate}
                                            disabled={loading}
                                            className="w-full"
                                        >
                                            {loading ? 'Updating...' : 'Update Profile'}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Security Settings */}
                            <Card className="w-full">
                                <CardHeader>
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-semibold">Security</h2>
                                        <p className="text-sm text-gray-600">Manage your account security</p>
                                    </div>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Password</label>
                                        <Input
                                            type="password"
                                            value="••••••••"
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                    
                                    <div className="pt-4">
                                        <Button
                                            color="secondary"
                                            variant="bordered"
                                            onClick={onOpen}
                                            className="w-full"
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                    
                                    {profile && (
                                        <>
                                            <div className="pt-4 border-t">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Account Created</label>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(profile.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                
                                                <div className="space-y-2 mt-4">
                                                    <label className="text-sm font-medium">Last Updated</label>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(profile.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>

                    <Tab key="payment" title="Payment & Billing">
                        <div className="mt-6">
                            <SubscriptionManagement />
                        </div>
                    </Tab>
                </Tabs>

                {/* Change Password Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalContent>
                        <ModalHeader>
                            <h3 className="text-lg font-semibold">Change Password</h3>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Password</label>
                                    <Input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">New Password</label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min 6 characters)"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Confirm New Password</label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                
                                {error && (
                                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="danger"
                                variant="light"
                                onClick={() => {
                                    onClose();
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setError('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onClick={handlePasswordChange}
                                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                            >
                                {passwordLoading ? 'Changing...' : 'Change Password'}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
};

export default SettingsPage; 
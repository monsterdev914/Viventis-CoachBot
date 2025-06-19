'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, Chip, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tooltip } from "@heroui/react";
import { getAllUsers } from '@/app/api/userProfile';
import { createUserPrompt, UserPrompt, getUserPrompts, updateUserPrompt } from '@/app/api/userPrompts';

interface User {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    email_confirmed_at: string | null;
    first_name: string;
    last_name: string;
    role: string;
    last_login: string | null;
    subscription_status: string | null;
    subscription: {
        id: string;
        status: 'active' | 'canceled' | 'expired' | 'paused' | 'trialing';
        current_period_start: string;
        current_period_end: string;
        trial_end?: string;
        plan: {
            name: string;
            price: number;
            billing_period_months: number;
            is_trial: boolean;
        };
        created_at: string;
    } | null;
}

const UserManagementPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
    const [promptText, setPromptText] = useState('');
    const [existingPrompts, setExistingPrompts] = useState<UserPrompt[]>([]);
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
    const [loadingPrompts, setLoadingPrompts] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            if (response) {
                setUsers(response);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPrompts = async (userId: string) => {
        setLoadingPrompts(true);
        try {
            const response = await getUserPrompts(userId);
            setExistingPrompts(response || []);
            
            // If there are existing prompts, set the first one as default
            if (response && response.length > 0) {
                setPromptText(response[0].prompt);
                setSelectedPromptId(response[0].id || null);
                setIsEditingPrompt(true);
            } else {
                setPromptText('');
                setSelectedPromptId(null);
                setIsEditingPrompt(false);
            }
        } catch (error) {
            console.error('Error fetching user prompts:', error);
            setExistingPrompts([]);
            setPromptText('');
            setSelectedPromptId(null);
            setIsEditingPrompt(false);
        } finally {
            setLoadingPrompts(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSubscriptionStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'trialing':
                return 'warning';
            case 'canceled':
                return 'danger';
            case 'expired':
                return 'danger';
            case 'paused':
                return 'default';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    const isSubscriptionActive = (subscription: User['subscription']) => {
        if (!subscription) return false;

        const now = new Date();
        const endDate = subscription.trial_end
            ? new Date(subscription.trial_end)
            : new Date(subscription.current_period_end);

        return ['active', 'trialing'].includes(subscription.status) && endDate > now;
    };

    const getSubscriptionDetails = (subscription: User['subscription']) => {
        if (!subscription) {
            return {
                planName: 'No subscription',
                status: 'none',
                endDate: null,
                price: null
            };
        }

        const endDate = subscription.status === 'trialing' && subscription.trial_end
            ? subscription.trial_end
            : subscription.current_period_end;

        return {
            planName: subscription.plan.name,
            status: subscription.status,
            endDate: endDate,
            price: subscription.plan.is_trial ? 'FREE' : `CHF ${subscription.plan.price}`
        };
    };

    const handleSavePrompt = async () => {
        if (!selectedUser || !promptText.trim()) return;

        try {
            if (isEditingPrompt && selectedPromptId) {
                // Update existing prompt
                await updateUserPrompt(selectedPromptId, {
                    prompt: promptText.trim()
                });
                console.log('Prompt updated successfully for user:', selectedUser.id);
            } else {
                // Create new prompt
                await createUserPrompt({
                    prompt: promptText.trim(),
                    user_id: selectedUser.id
                });
                console.log('Prompt created successfully for user:', selectedUser.id);
            }

            // Clear the form and close modal
            setPromptText('');
            setExistingPrompts([]);
            setIsEditingPrompt(false);
            setSelectedPromptId(null);
            onClose();
        } catch (error) {
            console.error('Error saving prompt:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button color="primary" onClick={fetchUsers}>
                    Refresh Data
                </Button>
            </div>

            <Card className='p-6'>
                <CardHeader>
                    <div className="flex justify-between w-full items-center">
                        <div className="text-sm text-gray-600">
                            Total Users: {users.length} | Active Subscriptions: {users.filter(u => isSubscriptionActive(u.subscription)).length}
                        </div>
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                    </div>
                </CardHeader>
                <CardBody>
                    <Table aria-label="User management table">
                        <TableHeader>
                            <TableColumn>User Info</TableColumn>
                            <TableColumn>Subscription</TableColumn>
                            <TableColumn>Plan Details</TableColumn>
                            <TableColumn>Expires/Ends</TableColumn>
                            <TableColumn>Last Login</TableColumn>
                            <TableColumn>Actions</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                // Loading skeleton rows
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`loading-${index}`}>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                                                <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                filteredUsers.map((user: User) => {
                                    const subscriptionDetails = getSubscriptionDetails(user.subscription);

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {user.first_name || user.last_name
                                                            ? `${user.first_name} ${user.last_name}`.trim()
                                                            : 'No name set'
                                                        }
                                                    </span>
                                                    <span className="text-sm text-gray-500">{user.email}</span>
                                                    <span className="text-xs text-gray-400">
                                                        Joined: {formatDate(user.created_at)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={getSubscriptionStatusColor(subscriptionDetails.status)}
                                                    size="sm"
                                                >
                                                    {subscriptionDetails.status === 'none' ? 'No subscription' : subscriptionDetails.status}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{subscriptionDetails.planName}</span>
                                                    {subscriptionDetails.price && (
                                                        <span className="text-sm text-gray-500">{subscriptionDetails.price}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {subscriptionDetails.endDate ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">
                                                            {formatDate(subscriptionDetails.endDate)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(subscriptionDetails.endDate) > new Date() ? 'Active' : 'Expired'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {formatDate(user.last_login || user.last_sign_in_at)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Tooltip content="Add AI prompt with this user's context" className='text-black'>
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="solid"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                fetchUserPrompts(user.id);
                                                                onOpen();
                                                            }}
                                                        >
                                                            Add Prompt
                                                        </Button>
                                                    </Tooltip>

                                                    {user.subscription && (
                                                        <Tooltip content="View subscription details" className='text-black'>
                                                            <Button
                                                                size="sm"
                                                                color="secondary"
                                                                variant="bordered"
                                                                onClick={() => {
                                                                    setSelectedUserForDetails(user);
                                                                    onDetailsOpen();
                                                                }}
                                                            >
                                                                Details
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    <ModalHeader>
                        <div className="flex flex-col text-black">
                            <span>
                                {isEditingPrompt ? 'Edit' : 'Add'} Prompt for {selectedUser?.first_name} {selectedUser?.last_name}
                                {isEditingPrompt && <span className="text-sm text-blue-600 ml-2">(Existing prompt found)</span>}
                            </span>
                            <span className="text-sm text-gray-500">{selectedUser?.email}</span>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-4 text-black">
                            {loadingPrompts && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-blue-600">Loading existing prompts...</div>
                                </div>
                            )}
                            
                            {existingPrompts.length > 1 && (
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <h4 className="font-medium mb-2 text-yellow-800">Multiple Prompts Found ({existingPrompts.length})</h4>
                                    <div className="space-y-2">
                                        {existingPrompts.map((prompt, index) => (
                                            <div key={prompt.id} className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    color={selectedPromptId === prompt.id ? "primary" : "default"}
                                                    variant={selectedPromptId === prompt.id ? "solid" : "bordered"}
                                                    onClick={() => {
                                                        setSelectedPromptId(prompt.id || null);
                                                        setPromptText(prompt.prompt);
                                                    }}
                                                >
                                                    Prompt {index + 1}
                                                </Button>
                                                <span className="text-xs text-gray-500">
                                                    Created: {prompt.created_at ? new Date(prompt.created_at).toLocaleDateString() : 'Unknown'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedUser?.subscription && (
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <h4 className="font-medium mb-2">User&apos;s Subscription Context:</h4>
                                    <div className="text-sm space-y-1">
                                        <p>Plan: {selectedUser.subscription.plan.name}</p>
                                        <p>Status: {selectedUser.subscription.status}</p>
                                        <p>Type: {selectedUser.subscription.plan.is_trial ? 'Trial' : 'Paid'}</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="prompt-text" className="font-medium">Prompt Text:</label>
                                    {isEditingPrompt && (
                                        <Button
                                            size="sm"
                                            color="success"
                                            variant="light"
                                            onClick={() => {
                                                setPromptText('');
                                                setSelectedPromptId(null);
                                                setIsEditingPrompt(false);
                                            }}
                                        >
                                            Create New Prompt
                                        </Button>
                                    )}
                                </div>
                                <textarea
                                    id="prompt-text"
                                    className="w-full p-3 border rounded-lg min-h-[120px] text-black"
                                    placeholder={isEditingPrompt ? "Edit existing prompt..." : "Enter prompt to test with this user's context..."}
                                    value={promptText}
                                    onChange={(e) => setPromptText(e.target.value)}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={handleSavePrompt} disabled={!promptText.trim()}>
                            {isEditingPrompt ? 'Update' : 'Save'} Prompt
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Subscription Details Modal */}
            <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="3xl">
                <ModalContent>
                    <ModalHeader>
                        <div className="flex flex-col text-black">
                            <span>Subscription Details - {selectedUserForDetails?.first_name} {selectedUserForDetails?.last_name}</span>
                            <span className="text-sm text-gray-500">{selectedUserForDetails?.email}</span>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-6 text-black">
                            {selectedUserForDetails?.subscription ? (
                                <>
                                    {/* Current Subscription Status */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card className="p-4">
                                            <h4 className="font-semibold mb-3">Current Status</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Status:</span>
                                                    <Chip
                                                        color={getSubscriptionStatusColor(selectedUserForDetails.subscription.status)}
                                                        size="sm"
                                                    >
                                                        {selectedUserForDetails.subscription.status}
                                                    </Chip>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Plan:</span>
                                                    <span className="font-medium">{selectedUserForDetails.subscription.plan.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Type:</span>
                                                    <Chip color={selectedUserForDetails.subscription.plan.is_trial ? "warning" : "success"} size="sm">
                                                        {selectedUserForDetails.subscription.plan.is_trial ? "Trial" : "Paid"}
                                                    </Chip>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Price:</span>
                                                    <span className="font-medium">
                                                        {selectedUserForDetails.subscription.plan.is_trial ? "FREE" : `CHF ${selectedUserForDetails.subscription.plan.price}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-4">
                                            <h4 className="font-semibold mb-3">Billing Information</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Billing Cycle:</span>
                                                    <span className="font-medium">
                                                        {selectedUserForDetails.subscription.plan.billing_period_months === 1 ? "Monthly" :
                                                            selectedUserForDetails.subscription.plan.billing_period_months === 12 ? "Yearly" :
                                                                `${selectedUserForDetails.subscription.plan.billing_period_months} months`}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Period Start:</span>
                                                    <span className="font-medium">{formatDate(selectedUserForDetails.subscription.current_period_start)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Period End:</span>
                                                    <span className="font-medium">{formatDate(selectedUserForDetails.subscription.current_period_end)}</span>
                                                </div>
                                                {selectedUserForDetails.subscription.trial_end && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Trial End:</span>
                                                        <span className="font-medium">{formatDate(selectedUserForDetails.subscription.trial_end)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Subscription Timeline */}
                                    <Card className="p-4">
                                        <h4 className="font-semibold mb-3">Timeline</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Subscription Created</span>
                                                        <span className="text-sm text-gray-600">{formatDate(selectedUserForDetails.subscription.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedUserForDetails.subscription.trial_end && (
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${new Date(selectedUserForDetails.subscription.trial_end) > new Date() ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Trial Period</span>
                                                            <span className="text-sm text-gray-600">
                                                                {new Date(selectedUserForDetails.subscription.trial_end) > new Date() ? 'Active' : 'Ended'} - {formatDate(selectedUserForDetails.subscription.trial_end)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${isSubscriptionActive(selectedUserForDetails.subscription) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Current Period</span>
                                                        <span className="text-sm text-gray-600">
                                                            {isSubscriptionActive(selectedUserForDetails.subscription) ? 'Active' : 'Expired'} - Ends {formatDate(selectedUserForDetails.subscription.current_period_end)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* User Profile Information */}
                                    <Card className="p-4">
                                        <h4 className="font-semibold mb-3">User Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">User ID:</span>
                                                    <span className="font-mono text-sm">{selectedUserForDetails.id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Account Created:</span>
                                                    <span className="font-medium">{formatDate(selectedUserForDetails.created_at)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Last Login:</span>
                                                    <span className="font-medium">{formatDate(selectedUserForDetails.last_login || selectedUserForDetails.last_sign_in_at)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Role:</span>
                                                    <span className="font-medium">{selectedUserForDetails.role}</span>
                                                </div>
                                                {selectedUserForDetails.subscription_status && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Legacy Status:</span>
                                                        <span className="font-medium text-gray-500">{selectedUserForDetails.subscription_status}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </>
                            ) : (
                                <Card className="p-8 text-center">
                                    <div className="text-gray-500">
                                        <h4 className="font-semibold mb-2">No Active Subscription</h4>
                                        <p>This user does not have an active subscription.</p>
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Account Created:</span>
                                                <span className="font-medium">{formatDate(selectedUserForDetails?.created_at || null)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Last Login:</span>
                                                <span className="font-medium">{formatDate(selectedUserForDetails?.last_login || selectedUserForDetails?.last_sign_in_at || null)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Role:</span>
                                                <span className="font-medium">{selectedUserForDetails?.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onPress={onDetailsClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default UserManagementPage; 
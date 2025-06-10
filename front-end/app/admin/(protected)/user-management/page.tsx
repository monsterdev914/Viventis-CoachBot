'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, Chip, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/index';
import { getAllUsers } from '@/app/api/userProfile';

const UserManagementPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [promptText, setPromptText] = useState('');

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

    const handleActivateUser = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('user_profile')
                .update({ subscription_status: 'active' })
                .eq('user_id', userId);

            if (error) throw error;
            fetchUsers();
        } catch (error) {
            console.error('Error activating user:', error);
        }
    };

    const handleDeactivateUser = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('user_profile')
                .update({ subscription_status: 'inactive' })
                .eq('user_id', userId);

            if (error) throw error;
            fetchUsers();
        } catch (error) {
            console.error('Error deactivating user:', error);
        }
    };

    const handleTestPrompt = async () => {
        if (!selectedUser || !promptText) return;

        try {
            // Here you would implement the prompt testing logic
            console.log('Testing prompt for user:', selectedUser.id, 'Prompt:', promptText);
            onClose();
        } catch (error) {
            console.error('Error testing prompt:', error);
        }
    };
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">User Management</h1>
            <Card>
                <CardHeader>
                    <div className="flex justify-end w-full items-center">
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                    </div>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <Table aria-label="User management table">
                            <TableHeader>
                                <TableColumn>Name</TableColumn>
                                <TableColumn>Email</TableColumn>
                                <TableColumn>Subscription Status</TableColumn>
                                <TableColumn>Last Login</TableColumn>
                                <TableColumn>Actions</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {users && users.map((user: UserProfile) => (
                                    <TableRow key={user.user_id}>
                                        <TableCell>{user.first_name} {user.last_name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                color={user.subscription_status === 'active' ? 'success' : 'danger'}
                                            >
                                                {user.subscription_status}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>{new Date(user.last_login).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {user.subscription_status === 'active' ? (
                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        onClick={() => handleDeactivateUser(user.user_id)}
                                                    >
                                                        Deactivate
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        color="success"
                                                        onClick={() => handleActivateUser(user.user_id)}
                                                    >
                                                        Activate
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        onOpen();
                                                    }}
                                                >
                                                    Test Prompt
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Test Prompt for {selectedUser?.first_name} {selectedUser?.last_name}</ModalHeader>
                    <ModalBody>
                        <textarea
                            className="w-full p-2 border rounded"
                            rows={4}
                            placeholder="Enter prompt to test..."
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={handleTestPrompt}>
                            Test Prompt
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default UserManagementPage; 
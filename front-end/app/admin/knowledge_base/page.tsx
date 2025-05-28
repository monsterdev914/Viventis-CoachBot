'use client'
import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from "@heroui/react"
import { Button } from "@heroui/react"
import { Input } from "@heroui/input"
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/react"
import api from '@/utiles/axiosConfig'

interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    status: 'processing' | 'ready' | 'error';
    error_message?: string;
    created_at: string;
}

const KnowledgeBase = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/knowledge/documents`);
            setDocuments(response.data);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('documents', files[i]);
            }

            await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess('Documents uploaded successfully');
            fetchDocuments(); // Refresh the list
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to upload documents');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/${id}`);
            setSuccess('Document deleted successfully');
            fetchDocuments(); // Refresh the list
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to delete document');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const columns = [
        { name: "Name", uid: "name" },
        { name: "Type", uid: "type" },
        { name: "Size", uid: "size" },
        { name: "Uploaded", uid: "created_at" },
        { name: "Status", uid: "status" },
        { name: "Actions", uid: "actions" },
    ];

    return (
        <div className="mx-auto p-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center w-full">
                        <h1 className="text-2xl font-bold">Knowledge Base</h1>
                        <div className="flex gap-4">
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                multiple
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                                id="file-upload"
                            />
                            <Button
                                color="primary"
                                onClick={() => document.getElementById('file-upload')?.click()}
                                isLoading={uploading}
                            >
                                Upload Documents
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    {error && (
                        <div className="text-danger text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-success text-sm mb-4">
                            {success}
                        </div>
                    )}

                    <Table aria-label="Knowledge base documents">
                        <TableHeader>
                            {columns.map((column) => (
                                <TableColumn key={column.uid}>{column.name}</TableColumn>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>{doc.name}</TableCell>
                                    <TableCell>{doc.type}</TableCell>
                                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                                    <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${doc.status === 'ready' ? 'bg-success/20 text-success' :
                                            doc.status === 'processing' ? 'bg-warning/20 text-warning' :
                                                'bg-danger/20 text-danger'
                                            }`}>
                                            {doc.status}
                                            {doc.error_message && (
                                                <span className="ml-2" title={doc.error_message}>⚠️</span>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
};

export default KnowledgeBase; 
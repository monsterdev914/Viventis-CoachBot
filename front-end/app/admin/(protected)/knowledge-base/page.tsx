'use client'
import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react"
import { Button } from "@heroui/react"
import { Input } from "@heroui/input"
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/react"
import { getDocuments, uploadDocument, deleteDocument, getQueueStatus } from '@/app/api/document'
import { useTranslation } from 'react-i18next';
interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    status: 'processing' | 'ready' | 'error';
    error_message?: string;
    created_at: string;
}

interface QueueStatus {
    queueLength: number;
    isProcessing: boolean;
    maxConcurrentProcesses: number;
    queueItems: Array<{
        documentId: string;
        fileName: string;
        timestamp: string;
    }>;
}

const KnowledgeBase = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
    const [showQueueDetails, setShowQueueDetails] = useState(false);
    const { t } = useTranslation();
    useEffect(() => {
        fetchDocuments();
        fetchQueueStatus();
        
        // Poll queue status every 3 seconds when there are active processes
        const interval = setInterval(() => {
            fetchQueueStatus();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const fetchQueueStatus = async () => {
        try {
            const status = await getQueueStatus();
            setQueueStatus(status);
            
            // Auto-refresh documents if queue is processing
            if (status.isProcessing || status.queueLength > 0) {
                fetchDocuments();
            }
        } catch (error: any) {
            console.error('Failed to fetch queue status:', error);
        }
    };

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await getDocuments();
            setDocuments(response);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Only allow single file upload
        const file = files[0];

        // Check file size limit (10 MB = 10 * 1024 * 1024 bytes)
        const maxFileSize = 10 * 1024 * 1024; // 10 MB
        
        if (file.size > maxFileSize) {
            setError(`File exceeds the 10 MB limit: ${file.name} (${formatFileSize(file.size)}). Please reduce file size or split into smaller files.`);
            e.target.value = ''; // Clear the file input
            return;
        }

        // Check file type
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(`Unsupported file type. Only PDF, DOC, DOCX, and TXT files are allowed. File: ${file.name} (${file.type})`);
            e.target.value = ''; // Clear the file input
            return;
        }

        // Check if queue is at capacity
        if (queueStatus && queueStatus.queueLength >= 10) {
            setError('Processing queue is full (10 documents). Please wait for some documents to finish processing before uploading more.');
            return;
        }

        // Show warning if queue is getting full
        if (queueStatus && queueStatus.queueLength >= 7) {
            setError(`Queue is almost full (${queueStatus.queueLength}/10 documents). Consider waiting before uploading more.`);
            // Still allow upload but show warning
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append('documents', file);

            const response = await uploadDocument(formData);
            
            // Show queue-aware success message
            const queuePosition = (queueStatus?.queueLength || 0) + 1;
            if (queueStatus && (queueStatus.isProcessing || queueStatus.queueLength > 0)) {
                setSuccess(`Document added to processing queue (position: ${queuePosition}). Processing will begin automatically.`);
            } else {
                setSuccess('Document uploaded and processing started.');
            }
            
            // Clear file input
            e.target.value = '';
            
            // Refresh data
            fetchDocuments();
            fetchQueueStatus();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDocument(id);
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

    const renderQueueStatus = () => {
        if (!queueStatus) return null;

        const { queueLength, isProcessing, maxConcurrentProcesses, queueItems } = queueStatus;
        
        if (queueLength === 0 && !isProcessing) {
            return (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-success font-medium">All documents processed</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                        <span className="text-warning font-medium">
                            Processing Queue {isProcessing ? '(Active)' : '(Waiting)'}
                        </span>
                    </div>
                    <Button
                        size="sm"
                        variant="light"
                        onClick={() => setShowQueueDetails(!showQueueDetails)}
                    >
                        {showQueueDetails ? 'Hide Details' : 'Show Details'}
                    </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Queue Length:</span>
                        <span className="ml-2 font-medium">{queueLength}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Processing:</span>
                        <span className="ml-2 font-medium">
                            {isProcessing ? `${Math.min(maxConcurrentProcesses, queueLength)} of ${maxConcurrentProcesses}` : '0'}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2 font-medium">
                            {isProcessing ? 'Active' : queueLength > 0 ? 'Waiting' : 'Idle'}
                        </span>
                    </div>
                </div>

                {showQueueDetails && queueItems.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-warning/20">
                        <h4 className="text-sm font-medium mb-2">Queue Details:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {queueItems.map((item, index) => (
                                <div key={item.documentId} className="flex justify-between items-center text-xs bg-white/50 rounded p-2">
                                    <span className="font-medium">#{index + 1} {item.fileName}</span>
                                    <span className="text-gray-500">
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mx-auto p-4 w-full">
            <h1 className="text-2xl font-bold mb-4">Knowledge Base</h1>
            <Card className='p-6'>
                <CardHeader>
                    <div className="flex justify-between items-center w-full">
                        
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-4">
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <Button
                                    color="primary"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    isLoading={uploading}
                                    isDisabled={uploading || (queueStatus?.queueLength ?? 0) >= 10}
                                >
                                    {uploading ? 'Uploading...' : 
                                     queueStatus && queueStatus.queueLength >= 10 ? 'Queue Full' :
                                     'Upload Document'}
                                </Button>
                            </div>
                            <div className="text-xs text-gray-500">
                                Supported formats: PDF, DOC, DOCX, TXT • Max size: 4.5 MB
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    {error && (
                        <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4">
                            <div className="text-danger text-sm">
                                {error}
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-4">
                            <div className="text-success text-sm">
                                {success}
                            </div>
                        </div>
                    )}

                    {renderQueueStatus()}

                    <Table aria-label="Knowledge base documents">
                        <TableHeader>
                            {columns.map((column) => (
                                <TableColumn key={column.uid}>{column.name}</TableColumn>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length}>
                                        <div className="flex items-center justify-center py-4">
                                            <Spinner size="sm" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documents.map((doc) => (
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
                                                {t("Delete")}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
};

export default KnowledgeBase; 
import { Request, Response } from 'express';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 400;

interface QueueItem {
    documentId: string;
    file: any;
    supabase: any;
    timestamp: Date;
}

export class DocumentController {
    private static processingQueue: QueueItem[] = [];
    private static isProcessing = false;
    private static maxConcurrentProcesses = 2; // Limit concurrent processing
    private static embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-3-small",
    });

    private static validateEnvironment() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        if (!process.env.SUPABASE_URL) {
            throw new Error('SUPABASE_URL environment variable is required');
        }
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
        }
    }

    private static async validateDatabase(supabase: any) {
        try {
            // Check if document_chunks table exists and is accessible
            const { data, error } = await supabase
                .from('document_chunks')
                .select('id')
                .limit(1);
            
            if (error && error.code === '42P01') {
                throw new Error('document_chunks table does not exist. Please run the database migrations.');
            } else if (error) {
                throw new Error(`Database connectivity issue: ${error.message}`);
            }
            
            console.log('Database validation successful');
        } catch (dbError: any) {
            console.error('Database validation failed:', dbError);
            throw dbError;
        }
    }

    private static getVectorStore(supabase: any) {
        this.validateEnvironment();
        return new SupabaseVectorStore(this.embeddings, {
            client: supabase,
            tableName: "document_chunks",
            queryName: "match_documents"
        });
    }

    // Queue management methods
    private static addToQueue(documentId: string, file: any, supabase: any) {
        const queueItem: QueueItem = {
            documentId,
            file,
            supabase,
            timestamp: new Date()
        };
        
        this.processingQueue.push(queueItem);
        console.log(`Document ${documentId} added to queue. Queue length: ${this.processingQueue.length}`);
        
        // Start processing if not already running
        this.processQueue();
    }

    private static async processQueue() {
        if (this.isProcessing || this.processingQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        console.log('Starting queue processing...');

        const concurrentPromises: Promise<void>[] = [];

        while (this.processingQueue.length > 0 && concurrentPromises.length < this.maxConcurrentProcesses) {
            const item = this.processingQueue.shift();
            if (item) {
                const promise = this.processDocument(item.documentId, item.file, item.supabase)
                    .catch(error => {
                        console.error(`Error processing document ${item.documentId}:`, error);
                    });
                concurrentPromises.push(promise);
            }
        }

        // Wait for current batch to complete
        if (concurrentPromises.length > 0) {
            await Promise.all(concurrentPromises);
        }

        this.isProcessing = false;

        // Continue processing if there are more items in queue
        if (this.processingQueue.length > 0) {
            console.log(`Continuing queue processing. Remaining items: ${this.processingQueue.length}`);
            this.processQueue();
        } else {
            console.log('Queue processing completed');
        }
    }

    // Get queue status
    static getQueueStatus = async (req: Request, res: Response): Promise<void> => {
        res.json({
            queueLength: this.processingQueue.length,
            isProcessing: this.isProcessing,
            maxConcurrentProcesses: this.maxConcurrentProcesses,
            queueItems: this.processingQueue.map(item => ({
                documentId: item.documentId,
                fileName: item.file.name,
                timestamp: item.timestamp
            }))
        });
    }

    // Get all documents
    static getDocuments = async (req: Request, res: Response): Promise<void> => {
        try {
            const supabase = (req as any).supabase;
            const { data: documents, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.json(documents);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Upload and process document
    static uploadDocument = async (req: Request, res: Response): Promise<void> => {
        if (!req.files || !req.files.documents) {
            res.status(400).json({ error: 'No files uploaded' });
            return;
        }

        const supabase = (req as any).supabase;
        const files = Array.isArray(req.files.documents)
            ? req.files.documents
            : [req.files.documents];

        try {
            for (const file of files) {
                // Create document record
                const { data: document, error: docError } = await supabase
                    .from('documents')
                    .insert({
                        name: file.name,
                        type: file.mimetype,
                        size: file.size,
                        status: 'processing'
                    })
                    .select()
                    .single();
                if (docError) throw docError;

                // Add to processing queue instead of immediate processing
                this.addToQueue(document.id, file, supabase);

                res.json({ message: 'Document upload queued for processing', document });
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete document
    static deleteDocument = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const supabase = (req as any).supabase;

        try {
            // Delete from vector store first
            const { error: vectorError } = await supabase
                .from('document_chunks')
                .delete()
                .eq('metadata->>document_id', id);

            if (vectorError) throw vectorError;

            // Then delete from documents table
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);

            if (error) throw error;

            res.json({ message: 'Document deleted successfully' });
        } catch (error: any) {
            console.log("error", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Process document and generate embeddings
    static processDocument = async (documentId: string, file: any, supabase: any) => {
        try {
            // Validate environment and database first
            await this.validateDatabase(supabase);
            let loader;
            const fileType = file.mimetype;

            // Select appropriate loader based on file type
            if (fileType === 'application/pdf') {
                console.log('Processing PDF file');
                const blob = new Blob([file.data], { type: 'application/pdf' });
                loader = new PDFLoader(blob);
            } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                fileType === 'application/msword') {
                console.log('Processing Word file');
                const blob = new Blob([file.data], {
                    type: fileType === 'application/msword' ? 'application/msword' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                });
                loader = new DocxLoader(blob);
            } else if (fileType === 'text/plain') {
                console.log('Processing text file');
                const blob = new Blob([file.data], { type: 'text/plain' });
                loader = new TextLoader(blob);
            } else {
                throw new Error(`Unsupported file type: ${fileType}`);
            }

            // Load and split document
            console.log('Loading document...');
            let docs;
            try {
                docs = await loader.load();
            } catch (loadError: any) {
                console.error('Document loading error:', loadError);
                throw new Error(`Failed to load document: ${loadError.message}`);
            }
            
            if (!docs || docs.length === 0) {
                throw new Error('No content could be extracted from the document');
            }
            console.log('Loaded documents:', {
                count: docs.length,
                sample: docs[0] ? {
                    pageContent: docs[0].pageContent.substring(0, 100) + '...',
                    metadata: docs[0].metadata
                } : null
            });

            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: CHUNK_SIZE,
                chunkOverlap: CHUNK_OVERLAP,
            });
            console.log('Splitting document into chunks...');
            const chunks = await splitter.splitDocuments(docs);
            console.log('Split into chunks:', {
                count: chunks.length,
                sample: chunks[0] ? {
                    content: chunks[0].pageContent.substring(0, 100) + '...',
                    metadata: chunks[0].metadata
                } : null
            });

            // Add documents to vector store with metadata
            const docsWithMetadata = chunks.map((doc, index) => ({
                ...doc,
                metadata: {
                    ...doc.metadata,
                    document_id: documentId,
                    chunk_id: `${documentId}_${index}`
                }
            }));

            const vectorStore = this.getVectorStore(supabase);
            
            // Add better error handling and validation
            console.log('Adding documents to vector store...', {
                documentsCount: docsWithMetadata.length,
                sampleMetadata: docsWithMetadata[0]?.metadata,
                openAIKey: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
                supabaseUrl: process.env.SUPABASE_URL ? 'Present' : 'Missing'
            });
            
            // Retry logic for vector store operations
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    await vectorStore.addDocuments(docsWithMetadata);
                    console.log('Successfully added documents to vector store');
                    break;
                } catch (vectorError: any) {
                    retryCount++;
                    console.error(`Vector store error (attempt ${retryCount}/${maxRetries}):`, {
                        error: vectorError.message,
                        cause: vectorError.cause,
                        isNetworkError: vectorError.message?.includes('fetch failed'),
                        isTimeoutError: vectorError.message?.includes('timeout'),
                    });
                    
                    if (retryCount >= maxRetries) {
                        throw new Error(`Vector store failed after ${maxRetries} attempts: ${vectorError.message}`);
                    }
                    
                    // Wait before retry (exponential backoff)
                    const waitTime = Math.pow(2, retryCount) * 1000;
                    console.log(`Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }

            // Update document status
            await supabase
                .from('documents')
                .update({ status: 'ready' })
                .eq('id', documentId);

            console.log('Document processing completed successfully');

        } catch (error: any) {
            console.error('Error processing document:', error);
            // Update document status with error
            await supabase
                .from('documents')
                .update({
                    status: 'error',
                    error_message: error.message
                })
                .eq('id', documentId);
        }
    }

    // Search for similar documents
    static async similaritySearch(req: Request, query: string, k: number = 4) {
        try {
            const supabase = (req as any).supabase;
            const vectorStore = this.getVectorStore(supabase);
            // Perform the search with a lower similarity threshold
            const results = await vectorStore.similaritySearch(query, k);

            console.log('Search results:', results);
            return results;
        } catch (error) {
            console.error("Error in similarity search:", error);
            throw error;
        }
    }
} 
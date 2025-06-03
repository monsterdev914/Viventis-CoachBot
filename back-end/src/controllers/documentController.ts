import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 400;

export class DocumentController {
    private static embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-3-small",
    });

    private static vectorStore = new SupabaseVectorStore(this.embeddings, {
        client: supabase,
        tableName: "document_chunks",
        queryName: "match_documents"
    });

    // Get all documents
    static getDocuments = async (req: Request, res: Response): Promise<void> => {
        try {
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

                // Process document in background
                this.processDocument(document.id, file).catch(console.error);

                res.json({ message: 'Document upload started', document });
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete document
    static deleteDocument = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

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
    static processDocument = async (documentId: string, file: any) => {
        try {
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
            const docs = await loader.load();
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

            await this.vectorStore.addDocuments(docsWithMetadata);
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
    static async similaritySearch(query: string, k: number = 4) {
        try {
            // Perform the search with a lower similarity threshold
            const results = await this.vectorStore.similaritySearch(query, k);

            console.log('Search results:', results);
            return results;
        } catch (error) {
            console.error("Error in similarity search:", error);
            throw error;
        }
    }
} 
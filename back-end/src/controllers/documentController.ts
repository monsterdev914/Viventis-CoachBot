import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { OpenAI } from 'openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from 'langchain/document';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export class DocumentController {
    // Get all documents
    static getDocuments = async (req: Request, res: Response) => {
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
    static uploadDocument = async (req: Request, res: Response) => {
        if (!req.files || !req.files.documents) {
            return res.status(400).json({ error: 'No files uploaded' });
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
    static deleteDocument = async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);
            //delete chunks
            if (error) throw error;

            const { error: chunkError } = await supabase
                .from('document_chunks')
                .delete()
                .eq('document_id', id);
            if (chunkError) throw chunkError;

            res.json({ message: 'Document deleted successfully' });
        } catch (error: any) {
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
                // Create a Blob from the file data
                const blob = new Blob([file.data], { type: 'application/pdf' });
                loader = new PDFLoader(blob);
            } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                loader = new DocxLoader(file.data);
            } else if (fileType === 'text/plain') {
                // Create a Blob from the file data
                const blob = new Blob([file.data], { type: 'text/plain' });
                loader = new TextLoader(blob);

                // Load and split document
                const docs = await loader.load();
                console.log(docs)
                const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: CHUNK_SIZE,
                    chunkOverlap: CHUNK_OVERLAP,
                });
                const chunks = await splitter.splitDocuments(docs);
                console.log(chunks)
                // Generate embeddings for each chunk
                for (const chunk of chunks) {
                    const embedding = await this.generateEmbedding(chunk.pageContent);

                    // Store chunk and embedding
                    const { error } = await supabase
                        .from('document_chunks')
                        .insert({
                            document_id: documentId,
                            content: chunk.pageContent,
                            embedding,
                            metadata: chunk.metadata
                        });

                    if (error) throw error;
                }

                // Update document status
                await supabase
                    .from('documents')
                    .update({ status: 'ready' })
                    .eq('id', documentId);

                return; // Skip the rest of the processing for text files
            } else {
                throw new Error('Unsupported file type');
            }

            // Load and split document (only for PDF and DOCX)
            const docs = await loader.load();
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: CHUNK_SIZE,
                chunkOverlap: CHUNK_OVERLAP,
            });
            const chunks = await splitter.splitDocuments(docs);

            // Generate embeddings for each chunk
            for (const chunk of chunks) {
                const embedding = await this.generateEmbedding(chunk.pageContent);

                // Store chunk and embedding
                console.log(chunk.pageContent)
                const { error } = await supabase
                    .from('document_chunks')
                    .insert({
                        document_id: documentId,
                        content: chunk.pageContent,
                        embedding,
                        metadata: chunk.metadata
                    });

                if (error) throw error;
            }

            // Update document status
            await supabase
                .from('documents')
                .update({ status: 'ready' })
                .eq('id', documentId);

        } catch (error: any) {
            // Update document status with error
            await supabase
                .from('documents')
                .update({
                    status: 'error',
                    error_message: error.message
                })
                .eq('id', documentId);

            console.error('Error processing document:', error);
        }
    }

    // Generate embedding using OpenAI
    static generateEmbedding = async (text: string): Promise<number[]> => {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        });

        return response.data[0].embedding;
    }
} 
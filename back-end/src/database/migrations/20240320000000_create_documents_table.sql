-- Create documents table
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create document_chunks table for storing embeddings
CREATE TABLE document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI embeddings are 1536 dimensions
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for vector similarity search
CREATE INDEX document_chunks_embedding_idx ON document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Documents are viewable by authenticated users" ON documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Documents are insertable by authenticated users" ON documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Documents are deletable by authenticated users" ON documents
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Document chunks are viewable by authenticated users" ON document_chunks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Document chunks are insertable by authenticated users" ON document_chunks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Document chunks are deletable by authenticated users" ON document_chunks
    FOR DELETE USING (auth.role() = 'authenticated'); 
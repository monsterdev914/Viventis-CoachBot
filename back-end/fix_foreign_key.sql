-- Option 1: Create the delete function (Recommended)
CREATE OR REPLACE FUNCTION delete_chat_with_messages(
    p_chat_id UUID,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify the chat belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM chats 
        WHERE id = p_chat_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Chat not found or unauthorized';
    END IF;

    -- Delete messages first (explicitly)
    DELETE FROM messages WHERE chat_id = p_chat_id;
    
    -- Then delete the chat
    DELETE FROM chats WHERE id = p_chat_id AND user_id = p_user_id;
    
    -- Ensure the operation completed successfully
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to delete chat';
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_chat_with_messages(UUID, UUID) TO authenticated;

-- Option 2: Alternative - Modify the foreign key constraint to CASCADE
-- (Uncomment these lines if you prefer this approach)
-- ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_chat_id_fkey;
-- ALTER TABLE messages 
-- ADD CONSTRAINT messages_chat_id_fkey 
-- FOREIGN KEY (chat_id) 
-- REFERENCES chats(id) 
-- ON DELETE CASCADE; 
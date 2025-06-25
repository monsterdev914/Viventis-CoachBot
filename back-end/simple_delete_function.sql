-- Simple delete function that works regardless of constraint names
CREATE OR REPLACE FUNCTION delete_chat_and_messages(
    p_chat_id UUID,
    p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    messages_count INTEGER;
    result JSON;
BEGIN
    -- Verify the chat belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM chats 
        WHERE id = p_chat_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Chat not found or unauthorized';
    END IF;

    -- Count messages before deletion
    SELECT COUNT(*) INTO messages_count
    FROM messages 
    WHERE chat_id = p_chat_id;

    -- Delete messages first (this should work regardless of constraints)
    DELETE FROM messages WHERE chat_id = p_chat_id;
    
    -- Then delete the chat
    DELETE FROM chats WHERE id = p_chat_id AND user_id = p_user_id;
    
    -- Return success info
    result := json_build_object(
        'success', true,
        'deleted_messages', messages_count,
        'chat_id', p_chat_id
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_chat_and_messages(UUID, UUID) TO authenticated; 
import api from "@/utiles/axiosConfig";
import axios from "axios";

const sendMessage = async (oldMessages: string[], message: string, onChunk: (chunk: string) => void) => {
    try {
        let lastProcessedLength = 0;
        const response = await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/stream`,
            { oldMessages, message },
            {
                responseType: 'stream',
                transformResponse: [(data) => data],
                onDownloadProgress: (progressEvent) => {
                    const chunk = progressEvent.event.target?.response;
                    if (!chunk) return;

                    // Only process new content
                    const newContent = chunk.slice(lastProcessedLength);
                    lastProcessedLength = chunk.length;

                    // Split by newlines and process each line
                    const lines = newContent.split('\n');
                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') return;

                            try {
                                const parsed = JSON.parse(data);
                                onChunk(parsed.content);
                            } catch (e) {
                                console.error('Error parsing chunk:', e);
                            }
                        }
                    }
                }
            }
        );

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error('Error in sendMessage:', error);
        throw error;
    }
}

const createChat = async () => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`, {})
    return response
}

const getChats = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`)
    return response
}

const getMessages = async (chatId: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}/messages`)
    return response
}

const deleteChat = async (chatId: string) => {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}`)
    return response
}

export { sendMessage, createChat, getChats, getMessages, deleteChat }

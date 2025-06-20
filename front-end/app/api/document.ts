import api from "@/utiles/axiosConfig"

const getDocuments = async () => {
    const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents`);
    return response.data;
}

const uploadDocument = async (formData: FormData) => {
    const response = await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

const deleteDocument = async (id: string) => {
    const response = await api.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/${id}`);
    return response.data;
}

const getQueueStatus = async () => {
    const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/queue-status`);
    return response.data;
}

export { getDocuments, uploadDocument, deleteDocument, getQueueStatus };
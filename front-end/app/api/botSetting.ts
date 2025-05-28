import api from "@/utiles/axiosConfig"

export const getBotSettings = async () => {
    const response = await api.get('/bot-settings');
    return response.data;
}

export const saveBotSettings = async (data: any) => {
    const response = await api.post('/bot-settings', data);
    return response.data;
}

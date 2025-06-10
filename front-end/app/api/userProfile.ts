import api from "@/utiles/axiosConfig"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const getUserProfile = async () => {
    const response = await api.get(`${API_URL}/userProfile`)
    console.log(response.data)
    return response
}
export const getAllUsers = async () => {
    const response = await api.get(`${API_URL}/userProfile/all`)
    return response.data
}

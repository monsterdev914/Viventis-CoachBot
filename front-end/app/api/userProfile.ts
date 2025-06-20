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

export const updateUserProfile = async (profileData: { first_name: string; last_name: string; email: string }) => {
    const response = await api.put(`${API_URL}/userProfile`, profileData)
    return response
}

export const updateUserProfileByAdmin = async (userId: string, profileData: { first_name: string; last_name: string }) => {
    const response = await api.put(`${API_URL}/userProfile/${userId}`, profileData)
    return response
}

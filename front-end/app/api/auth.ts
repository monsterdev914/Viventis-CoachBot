import axios from 'axios';
import api from '@/utiles/axiosConfig';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export const signIn = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password
    })
    return response
}

export const signUp = async (email: string, password: string, gdpr: boolean, privacy: boolean) => {
    const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        gdpr,
        privacy
    })
    return response
}
//sign out

export const signOut = async () => {
    localStorage.removeItem('token')
    const response = await axios.post(`${API_URL}/auth/signout`)
    return response
}

export const resendVerification = async (email: string) => {
    const response = await axios.post(`${API_URL}/auth/resend-verification`, { email })
    return response
}

export const verifyEmail = async (email: string, token: string) => {
    const response = await axios.get(`${API_URL}/auth/verify-email?email=${email}&token=${token}`)
    return response
}

export const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
    })
    return response
}

export const deleteAccount = async (password: string) => {
    const response = await api.delete('/auth/delete-account', {
        data: { password }
    })
    return response 
}


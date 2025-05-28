import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance  
const api = axios.create({
    //If production, use the production backend url
    baseURL: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BACKEND_URL : 'http://localhost:3457/api',
    headers: {
        'Content-Type': 'application/json'
    },
    // Enable streaming responses
    // responseType: 'stream',
    // Don't transform the response
    // transformResponse: [(data) => data]
});

// Request interceptor for adding auth token  
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Get current session  
        //local storage
        const token = localStorage.getItem('token');

        // Add token to request headers if exists  
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling  
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
        // Global error handling  
        if (error.response) {
            // The request was made and the server responded with a status code  
            switch (error.response.status) {
                case 401:
                    // Unauthorized - redirect to login or refresh token  
                    console.error('Unauthorized access');
                    break;
                case 403:
                    console.error('Forbidden access');
                    break;
                case 500:
                    console.error('Server error');
                    break;
            }
        } else if (error.request) {
            console.error('No response received');
        } else {
            console.error('Error', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
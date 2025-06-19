import api from "@/utiles/axiosConfig";

export interface UserPrompt {
    id?: string;
    prompt: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
    user_profile?: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface CreateUserPromptRequest {
    prompt: string;
    user_id: string;
}

export interface UpdateUserPromptRequest {
    prompt: string;
}

export interface GetUserPromptsParams {
    page?: number;
    limit?: number;
    user_id?: string;
}

// Create a new user prompt
export const createUserPrompt = async (data: CreateUserPromptRequest) => {
    const response = await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user-prompts`, data);
    return response.data;
};

// Get all user prompts (admin only) with optional filtering and pagination
export const getAllUserPrompts = async (params?: GetUserPromptsParams) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-prompts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
};

// Get prompts for a specific user
export const getUserPrompts = async (userId: string) => {
    const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user-prompts/user/${userId}`);
    return response.data;
};

// Get a single user prompt by ID
export const getUserPromptById = async (promptId: string) => {
    const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user-prompts/${promptId}`);
    return response.data;
};

// Update a user prompt
export const updateUserPrompt = async (promptId: string, data: UpdateUserPromptRequest) => {
    const response = await api.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user-prompts/${promptId}`, data);
    return response.data;
};

// Delete a user prompt
export const deleteUserPrompt = async (promptId: string) => {
    const response = await api.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user-prompts/${promptId}`);
    return response.data;
}; 
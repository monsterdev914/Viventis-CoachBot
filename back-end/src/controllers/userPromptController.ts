import { Request, Response } from 'express';

interface UserPrompt {
    id?: string;
    prompt: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
}

class UserPromptController {
    // Create a new user prompt
    static async createUserPrompt(req: Request, res: Response) {
        try {
            const supabase = (req as any).supabase;
            const { prompt, user_id } = req.body;

            if (!prompt || !user_id) {
                return res.status(400).json({ error: 'Prompt and user_id are required' });
            }

            const { data, error } = await supabase
                .from('user_prompts')
                .insert({
                    prompt,
                    user_id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            res.status(201).json(data);
        } catch (error: any) {
            console.error('Error creating user prompt:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get all prompts for a specific user
    static async getUserPrompts(req: Request, res: Response) {
        try {
            const supabase = (req as any).supabase;
            const { userId } = req.params;

            const { data, error } = await supabase
                .from('user_prompts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.status(200).json(data);
        } catch (error: any) {
            console.error('Error fetching user prompts:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get all prompts (admin only)
    static async getAllUserPrompts(req: Request, res: Response) {
        try {
            const supabase = (req as any).supabase;
            const { page = 1, limit = 50, user_id } = req.query;

            let query = supabase
                .from('user_prompts')
                .select(`
                    *,
                    user_profile:user_id (
                        first_name,
                        last_name,
                        email
                    )
                `)
                .order('created_at', { ascending: false });

            // Filter by user_id if provided
            if (user_id) {
                query = query.eq('user_id', user_id);
            }

            // Pagination
            const offset = (Number(page) - 1) * Number(limit);
            query = query.range(offset, offset + Number(limit) - 1);

            const { data, error } = await query;

            if (error) throw error;

            res.status(200).json(data);
        } catch (error: any) {
            console.error('Error fetching all user prompts:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Update a user prompt
    static async updateUserPrompt(req: Request, res: Response) {
        try {
            const supabase = (req as any).supabase;
            const { promptId } = req.params;
            const { prompt } = req.body;

            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }

            const { data, error } = await supabase
                .from('user_prompts')
                .update({
                    prompt,
                    updated_at: new Date().toISOString()
                })
                .eq('id', promptId)
                .select()
                .single();

            if (error) throw error;

            res.status(200).json(data);
        } catch (error: any) {
            console.error('Error updating user prompt:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Delete a user prompt
    static async deleteUserPrompt(req: Request, res: Response) {
        try {
            const supabase = (req as any).supabase;
            const { promptId } = req.params;

            const { error } = await supabase
                .from('user_prompts')
                .delete()
                .eq('id', promptId);

            if (error) throw error;

            res.status(200).json({ message: 'User prompt deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting user prompt:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get a single user prompt by ID
    static async getUserPromptById(req: Request, res: Response) {
        try {
            const supabase = (req as any).supabase;
            const { promptId } = req.params;

            const { data, error } = await supabase
                .from('user_prompts')
                .select(`
                    *,
                    user_profile:user_id (
                        first_name,
                        last_name,
                        email
                    )
                `)
                .eq('id', promptId)
                .single();

            if (error) throw error;

            res.status(200).json(data);
        } catch (error: any) {
            console.error('Error fetching user prompt:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default UserPromptController; 
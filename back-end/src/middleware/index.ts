import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Example auth middleware  
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '', {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            },
            auth: {
                persistSession: false // Important for server-side usage
            }
        });

        // 3. Verify the token and get user
        const { data: { user }, error: error2 } = await supabase.auth.getUser();
        if (error2 || !user || !token) {
            res.status(401).json({ message: 'Unauthorized' });
            throw error2
        }
        else {
            (req as any).user = {
                ...user,
                id: user.id,
                role: user.user_metadata.user_role // You can set roles dynamically  
            };
            (req as any).supabase = supabase;
        }
        next();
    } catch (err) {
        next(err);
    }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user?.role !== 'super_admin') {
        next(new Error('Unauthorized'));
    }
    next();
}; 
import { Request, Response } from "express";

class UserProfileController {
    static getUserProfile = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
            const user = (req as any).user;
            
            const { data, error } = await supabase
                .from("user_profile")
                .select("*")
                .eq("user_id", user.id)
                .single();
                
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            
            return res.status(200).json({
                id: data.user_id,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                role: data.role,
                created_at: data.created_at,
                updated_at: data.updated_at
            });
        } catch (error: any) {
            console.error('Error in getUserProfile:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    static updateUserProfile = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
            const user = (req as any).user;
            const { first_name, last_name } = req.body;

            if (!first_name && !last_name) {
                return res.status(400).json({ error: 'At least one field (first_name or last_name) is required' });
            }

            const updateData: any = {
                updated_at: new Date().toISOString()
            };

            if (first_name !== undefined) updateData.first_name = first_name;
            if (last_name !== undefined) updateData.last_name = last_name;

            const { data, error } = await supabase
                .from("user_profile")
                .update(updateData)
                .eq("user_id", user.id)
                .select()
                .single();

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({
                message: 'Profile updated successfully',
                profile: {
                    id: data.user_id,
                    email: data.email,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    role: data.role,
                    created_at: data.created_at,
                    updated_at: data.updated_at
                }
            });
        } catch (error: any) {
            console.error('Error in updateUserProfile:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    
    static getAllUsers = async (req: Request, res: Response) => {
        try {
            const supabase = (req as any).supabase;
            
            // Get all users from user_profile table as primary source
            const { data: profiles, error: profilesError } = await supabase
                .from('user_profile')
                .select('*');

            if (profilesError) {
                console.error('Error fetching profiles:', profilesError);
                return res.status(500).json({ error: profilesError.message });
            }

            if (!profiles || profiles.length === 0) {
                return res.status(200).json([]);
            }

            const userIds = profiles.map((profile: any) => profile.user_id);

            // Get auth data for additional user information
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
            
            if (authError) {
                console.error('Error fetching auth users:', authError);
            }

            // Fetch subscriptions with plan information
            const { data: subscriptions, error: subscriptionsError } = await supabase
                .from('subscriptions')
                .select(`
                    *,
                    plans (
                        name,
                        price,
                        billing_period_months,
                        is_trial
                    )
                `)
                .in('user_id', userIds)
                .order('created_at', { ascending: false });

            if (subscriptionsError) {
                console.error('Error fetching subscriptions:', subscriptionsError);
            }

            // Combine the data with user_profile as the primary source
            const enrichedUsers = profiles.map((profile: any) => {
                // Find corresponding auth user for additional data
                const authUser = authUsers?.users.find((user: any) => user.id === profile.user_id);
                
                // Get the most recent subscription for this user
                const userSubscriptions = subscriptions?.filter((s: any) => s.user_id === profile.user_id) || [];
                const currentSubscription = userSubscriptions[0]; // Most recent due to ordering

                return {
                    id: profile.user_id,
                    email: profile.email || authUser?.email || '',
                    created_at: profile.created_at || authUser?.created_at || '',
                    last_sign_in_at: authUser?.last_sign_in_at || null,
                    email_confirmed_at: authUser?.email_confirmed_at || null,
                    // Profile data from user_profile table
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    role: profile.role || 'user',
                    last_login: profile.last_login || null,
                    subscription_status: profile.subscription_status || null,
                    // Subscription data
                    subscription: currentSubscription ? {
                        id: currentSubscription.id,
                        status: currentSubscription.status,
                        current_period_start: currentSubscription.current_period_start,
                        current_period_end: currentSubscription.current_period_end,
                        trial_end: currentSubscription.trial_end,
                        plan: currentSubscription.plans,
                        created_at: currentSubscription.created_at
                    } : null
                };
            });

            return res.status(200).json(enrichedUsers);
        } catch (error: any) {
            console.error('Error in getAllUsers:', error);
            return res.status(500).json({ error: error.message });
        }
    }
}

export default UserProfileController

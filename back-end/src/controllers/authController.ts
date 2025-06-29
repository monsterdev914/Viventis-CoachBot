import { Request, Response } from 'express'
import { supabase } from '../supabaseClient';
import { UserProfile, UserRole } from '../types/supabase/userProfile';
import { PublicUser } from '../types/supabase/publicUser';

interface AuthRequest extends Request {
    body: {
        email: string;
        password: string;
        gdpr: boolean;
        privacy: boolean;
    }
}

interface ResendVerificationRequest extends Request {
    body: {
        email: string;
    }
}

export interface VerifyEmailRequest extends Request {
    query: {
        email: string;
        token: string;
    }
}

class AuthController {
    static async signIn(req: AuthRequest, res: Response) {
        const { email, password } = req.body
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    return res.status(401).json({ error: 'Please confirm your email before signing in' });
                }
                else {
                    return res.status(401).json({ error: error.message });
                }
            }

            else {
                const currentTimestamp = new Date().toISOString();
                const { data: userProfile, error: userProfileError } = await supabase.from("user_profile").upsert({
                    user_id: data.user?.id,
                    email: data.user?.email,
                    gdpr_consent: true,
                    privacy: true,
                    last_login: currentTimestamp,
                }, {
                    onConflict: 'user_id'
                }).select("role").single()
                if (userProfileError) {
                    throw new Error(userProfileError.message);
                }
                await supabase.auth.updateUser({
                    data: {
                        user_role: userProfile?.role
                    }
                })
                //last chat
                const { data: chats, error: chatsError } = await supabase.from("chats").select("*").eq("user_id", data.session?.user?.id).order("created_at", { ascending: false }).limit(1)
                if (chatsError) {
                    throw new Error(chatsError.message);
                }
                return res.status(200).json({
                    message: 'Sign in successful',
                    token: data.session?.access_token,
                    user: data.session?.user,
                    last_chat: chats?.[0]
                });
            }
        } catch (error) {
            console.log(error)
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    }

    static async signUp(req: AuthRequest, res: Response) {
        const { email, password, gdpr, privacy } = req.body
        try {
            const { data: users, error } = await supabase.from('pb_user').select('*').eq("email", email)
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            const user = users?.[0];
            if (user) {
                if (user.confirmed_at) {
                    return res.status(405).json({ error: 'User already exists' });
                }
                else {
                    const { error: resendError } = await supabase.auth.resend({
                        type: 'signup',
                        email,
                        options: {
                            emailRedirectTo: `${process.env.FRONTEND_URL}/auth/verify-email`
                        }
                    })
                    if (resendError) {
                        return res.status(500).json({ error: resendError.message });
                    }
                    return res.status(200).json({ message: 'Verification email has been resent. Please check your inbox.' });
                }
            }
            else {
                try {
                    const { data, error: signUpError } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo: `${process.env.FRONTEND_URL}/auth/verify-email`
                        }
                    })
                    if (signUpError) {
                        console.log(signUpError)
                        throw new Error(signUpError.message);
                    }

                    const { data: __, error: userError } = await supabase.from("pb_user").insert({
                        email,
                        user_id: data.user?.id,
                        confirmed_at: null,
                        created_at: new Date().toISOString(),
                    })
                    if (userError) {
                        throw new Error(userError.message);
                    }
                    return res.status(200).json({ message: 'User created successfully', user: data.user });
                }
                catch (error: any) {
                    return res.status(500).json({ error: error.message });
                }
            }
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async signOut(req: Request, res: Response) {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            else {
                return res.status(200).json({ message: 'Sign out successful' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Sign out failed' });
        }
    }

    static async resendVerification(req: ResendVerificationRequest, res: Response) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        else {
            try {
                // Check if user exists in user_profile table
                const { data: user, error: userError } = await supabase.from("pb_user").select("*").eq("email", email).single<PublicUser | null>()
                if (userError) {
                    return res.status(500).json({ error: userError.message });
                }
                if (user) {
                    if (user.confirmed_at) {
                        return res.status(200).json({ message: 'Email is already verified' });
                    }
                }

                // If email is not verified, send verification email
                const { error: resendError } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                    options: {
                        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/verify-email`
                    }
                });

                if (resendError) {
                    return res.status(400).json({ error: resendError.message });
                }

                return res.status(200).json({
                    message: 'Verification email has been resent. Please check your inbox.',
                    verified: false
                });

            } catch (error: any) {
                return res.status(500).json({ error: error.message || 'Failed to process verification request' });
            }
        }
    }

    static async changePassword(req: Request, res: Response) {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = (req as any).user;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current password and new password are required' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters long' });
            }

            // Verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });

            if (signInError) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                return res.status(500).json({ error: updateError.message });
            }

            return res.status(200).json({ message: 'Password changed successfully' });
        } catch (error: any) {
            console.error('Error in changePassword:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async deleteAccount(req: Request, res: Response) {
        try {
            const { password } = req.body;
            const user = (req as any).user;

            if (!password) {
                return res.status(400).json({ error: 'Password is required to delete account' });
            }

            // Verify password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: password
            });

            if (signInError) {
                return res.status(400).json({ error: 'Password is incorrect' });
            }

            // Delete user's related data from various tables
            try {
                // Delete chat messages
                const { error: messagesError } = await supabase
                    .from('chat_messages')
                    .delete()
                    .eq('user_id', user.id);

                if (messagesError) {
                    console.error('Error deleting chat messages:', messagesError);
                }

                // Delete chats
                const { error: chatsError } = await supabase
                    .from('chats')
                    .delete()
                    .eq('user_id', user.id);

                if (chatsError) {
                    console.error('Error deleting chats:', chatsError);
                }

                // Delete user prompts
                const { error: promptsError } = await supabase
                    .from('user_prompts')
                    .delete()
                    .eq('user_id', user.id);

                if (promptsError) {
                    console.error('Error deleting user prompts:', promptsError);
                }

                // Delete subscriptions
                const { error: subscriptionsError } = await supabase
                    .from('subscriptions')
                    .delete()
                    .eq('user_id', user.id);

                if (subscriptionsError) {
                    console.error('Error deleting subscriptions:', subscriptionsError);
                }

                // Delete user profile
                const { error: profileError } = await supabase
                    .from('user_profile')
                    .delete()
                    .eq('user_id', user.id);

                if (profileError) {
                    console.error('Error deleting user profile:', profileError);
                }

                // Delete from pb_user table
                const { error: pbUserError } = await supabase
                    .from('pb_user')
                    .delete()
                    .eq('user_id', user.id);

                if (pbUserError) {
                    console.error('Error deleting pb_user:', pbUserError);
                }

                // Finally, delete the auth user
                const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);

                if (deleteUserError) {
                    console.error('Error deleting auth user:', deleteUserError);
                    return res.status(500).json({ error: 'Failed to delete user account' });
                }

                // Log account deletion for audit
                console.log(`Account deleted for user ${user.id} (${user.email}) at ${new Date().toISOString()}`);

                return res.status(200).json({ 
                    message: 'Account deleted successfully',
                    timestamp: new Date().toISOString()
                });

            } catch (deletionError: any) {
                console.error('Error during account deletion:', deletionError);
                return res.status(500).json({ error: 'Failed to delete account data' });
            }

        } catch (error: any) {
            console.error('Error in deleteAccount:', error);
            return res.status(500).json({ error: 'Internal server error while deleting account' });
        }
    }

    static async verifyEmail(req: VerifyEmailRequest, res: Response) {
        const { email, token } = req.query;

        if (!email || !token) {
            return res.status(400).json({ error: 'Email and token are required' });
        }
        try {
            // First check if user exists and is not already verified
            const { data: user, error: userError } = await supabase
                .from('pb_user')
                .select('*')
                .eq('email', email)
                .single();

            if (userError) {
                return res.status(500).json({ error: 'Failed to find user' });
            }

            if (user.confirmed_at) {
                return res.status(200).json({
                    message: 'Email already verified',
                    verified: true
                });
            }

            // Verify the email using Supabase
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'signup'
            });
            if (error) {
                return res.status(403).json({ error: 'Invalid token' });
            }

            // Update the user's confirmed_at timestamp in the database
            const { error: updateError } = await supabase
                .from('pb_user')
                .update({ confirmed_at: new Date().toISOString() })
                .eq('email', email);

            if (updateError) {
                return res.status(500).json({ error: 'Failed to update user verification status' });
            }

            // Return success response with redirect URL
            return res.status(200).json({
                message: 'Email verified successfully',
                user: data.user,
                redirectUrl: `${process.env.FRONTEND_URL}/auth/login?verified=true`
            });

        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to verify email' });
        }
    }
}

export default AuthController

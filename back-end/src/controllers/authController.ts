import { Request, Response } from 'express'
import { supabase } from '../supabaseClient';
import { UserProfile, UserRole } from '../types/supabase/userProfile';
import { PublicUser } from '../types/supabase/publicUser';

interface AuthRequest extends Request {
    body: {
        email: string;
        password: string;
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
                const { data: userProfile, error: userProfileError } = await supabase.from("user_profile").upsert({
                    user_id: data.user?.id,
                    email: data.user?.email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
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

                console.log(data)
                return res.status(200).json({
                    message: 'Sign in successful',
                    token: data.session?.access_token,
                    user: data.session?.user
                });
            }
        } catch (error) {
            console.log(error)
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    }

    static async signUp(req: AuthRequest, res: Response) {
        const { email, password } = req.body
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

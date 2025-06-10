import { Request, Response } from "express";

class UserProfileController {
    static getUserProfile = async (req: Request, res: Response) => {
        const supabase = (req as any).supabase;
        const user = (req as any).user
        const { data, error } = await supabase.from("user_profile").select("email, role").eq("user_id", user.id).single()
        if (error) {
            return res.status(500).json({ error: error.message })
        }
        console.log(data)
        return res.status(200).json({ email: data.email, role: data.role })
    }
    static getAllUsers = async (req: Request, res: Response) => {
        const supabase = (req as any).supabase;
        const { data, error } = await supabase.from("user_profile").select("*")
        if (error) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
        return res.status(200).json(data)
    }
}

export default UserProfileController

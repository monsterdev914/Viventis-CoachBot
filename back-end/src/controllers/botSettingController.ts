import { Request, Response } from "express";
import { supabase } from "../supabaseClient";

class BotSettingController {
    static saveBotSettings = async (req: Request, res: Response) => {
        const { data, error } = await supabase.from('bot_settings').upsert(req.body).select().single();
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(200).json(data);
    }
    static getBotSettings = async (req: Request, res: Response) => {
        const { data, error } = await supabase.from('bot_settings').select('*').maybeSingle();
        console.log("data", data);
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(200).json(data);
    }
}

export default BotSettingController;
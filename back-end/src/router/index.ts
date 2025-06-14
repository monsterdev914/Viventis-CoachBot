import express, { Request, Response, RequestHandler } from "express";
import { handleWebhook } from "../controllers/webhookController";
import ProfileController from "../controllers/profile";
import { auth, isAdmin } from "../middleware";
import { attachAction, createAssistant, createSynthflowAction, getAction, getAssistant, listCalls, updateAssistant } from "../lib/synthflow";
import OptionalPreferenceController from "../controllers/optionalPreferenceController";
import { createPaymentIntent, paymentValidate } from "../lib/stripe";
import { Plan, PLAN_DETAILS } from "../types/plan";
import { supabase } from "../supabaseClient";
import ActionController from "../controllers/actionController";
import { extractTattooShopInfo } from "../lib/firecrawl";
import { buyTwilioPhoneNumber } from "../lib/twilio";
import PhoneNumberController from "../controllers/phoneNumberController";
import AuthController, { VerifyEmailRequest } from "../controllers/authController";
import ChatController from "../controllers/chatController";
import UserProfileController from "../controllers/userProfileController";
import { DocumentController } from "../controllers/documentController";
import BotSettingController from "../controllers/botSettingController";
import {
    createSubscription,
    cancelSubscription,
    getSubscription,
    getCurrentSubscription,
    getPrices,
} from '../controllers/stripeController';
import webhookRouter from './webhook';

const router = express.Router();


// Mount webhook routes (no auth middleware for webhooks)
router.use('/webhook', webhookRouter);

/**
 * Sythnthflow APIs
 */
router.use(express.json());
router.post("/synthflow/createAssistant", auth, async (req, res) => {
    const { assistant } = req.body;
    try {
        const model_id = await createAssistant(assistant);
        res.status(200).json({ model_id: model_id });
    }
    catch (err: any) {
        res.status(400).json(err);
        throw new Error(`Error: {err.message}`);
    }
})

router.put("/synthflow/updateAssistant"
    , auth, async (req, res) => {
        const cond = req.body;
        try {
            const data = await updateAssistant(cond, (req as any).user);
            res.status(200).json({
                assistant: data
            })
        }
        catch (err: any) {
            res.status(400).json(err);
        }
    }
);
router.get("/synthflow/getAssistant"
    , auth, async (req, res) => {
        try {
            const data = await getAssistant((req as any).user);
            res.status(200).json({
                assistant: data
            })
        }
        catch (err: any) {
            res.status(400).json(err);
        }
    }
);
router.post('/synthflow/createSynthflowAction', auth, async (req, res) => {
    try {
        const { accessToken } = req.body
        const result = await createSynthflowAction(accessToken);
        res.status(200).json(result);
    }
    catch (err: any) {
        res.status(400).json({
            error: err.message
        })
    }
})
router.post('/synthflow/attachAction', auth, async (req, res) => {
    const user = (req as any).usre;
    const { actions } = req.body;
    const { data, error } = await supabase
        .from('profiles')
        .select('model_id')
        .eq('user_id', user?.id)
        .single();
    if (error) {
        res.status(400).json({
            error: error.message
        })
        return;
    }
    try {
        const result = await attachAction(data?.model_id, actions);
        res.status(200).json(result);
    }
    catch (err: any) {
        res.status(400).json({
            error: err.message
        })
    }
})

router.get('/synthflow/action/:id', auth, async (req, res) => {
    const id = req.params.id;
    try {
        const action = await getAction(id);
        res.status(200).json(action);
    }
    catch (err) {
        res.status(400).json(err);
    }

})
/**
 * FireCrawl Apis
 * 
 */
router.post('/firecrawl/extractTattooShopInfo', auth, async (req, res) => {
    const { url } = req.body;
    try {
        const extractedTattoShopInfo = await extractTattooShopInfo(url);
        res.status(200).json(extractedTattoShopInfo);
    } catch (error) {
        res.status(400).json(error);
    }
})
/**
 * Twiliow APIs
 * 
 */

router.get('/twilio/buy', auth, async (__, res) => {
    try {
        const phoneNumber = await buyTwilioPhoneNumber();
        res.status(200).json({
            phoneNumber: phoneNumber
        })
    } catch (err: any) {
        res.status(400).json({
            error: err.message
        })
    }
})

/**
 * Profiles Table APIs
 */

router.get('/user-profile', auth, ProfileController.getUserProfile);
router.put('/user-profile', auth, ProfileController.updateProfile);
router.post('/user-profile', auth, ProfileController.saveProfile);



router.post('/planUpdate', auth, async (req, res) => {
    const user = (req as any).user;
    const { paymentIntentId } = req.body;
    try {
        const planId = await paymentValidate(paymentIntentId);
        console.log(planId)
        const { data: profile, error: profileError } = await supabase.from("profiles").update({
            plan: planId,
            total_usage_minutes: 0,
            plan_start: new Date(),
            plan_end: new Date(new Date().setDate(new Date().getDate() + 15)),
        }).eq("user_id", user.id).select().single();
        if (profileError) {
            throw profileError;
        }
        const { data, error } = await supabase
            .from('phone_numbers')
            .select('*')
            .eq('model_id', (profile as any).model_id)
            .single();
        if (error) {
            throw error;
        }
        try {
            await updateAssistant({ phone_number: data.phone_number }, user);
        }
        catch (err) {
            throw err;
        }
        const { error: phone_numbers_error } = await supabase.from('phone_numbers').update({ is_active: false }).eq("model_id", (profile as any).model_id);
        if (phone_numbers_error) {
            throw phone_numbers_error;
        }
        res.status(200).json({ message: "updated" });
    }
    catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});



router.post('/get-listCalls', auth, async (req, res) => {
    const { model_id, limit, offset } = req.body;
    const data = await listCalls(model_id, limit, offset);
    res.json(data);
});

///OptionalPrefernece
router.get('/get-optionalPreferences', auth, OptionalPreferenceController.getOptionalPreferences);
router.put('/update-optionalPreferences', auth, OptionalPreferenceController.updateOptionalPreferences);
router.post('/optionalPreferences', auth, OptionalPreferenceController.saveOptionalPreferences);


/**
 * PhoneNumbers Table APIs
 * 
 */

router.post('/phone_numbers', auth, PhoneNumberController.createPhoneNumber);


///Stripe
router.post('/createPaymentIntent', auth, async (req, res) => {
    const { plan_id, currency }: { plan_id: Plan, currency: string } = req.body;
    if (!plan_id) {
        res.status(400).json({
            error: 'Plan ID is required'
        });
        // throw error;
        return;
    }

    // Type guard to check if plan_id is a valid Plan  
    if (!Object.keys(PLAN_DETAILS).includes(plan_id)) {
        res.status(400).json({
            error: 'Invalid plan selected',
            validPlans: Object.keys(PLAN_DETAILS)
        });
        // throw error;
        return;
    }
    try {
        const data = await createPaymentIntent(PLAN_DETAILS[plan_id].price, currency, { planId: plan_id });
        res.status(200).json(data);
    }
    catch (err: any) {
        res.status(400).json({ error: err.message })
    }
})



//Action Table
router.post('/action', auth, ActionController.createAction);
router.delete('/action/:id', auth, ActionController.deleteAction);
router.put('/action', auth, ActionController.updateAction);
router.get('/action/list', auth, ActionController.listAction);
router.get('/action/:id', auth, ActionController.getActionById);
router.post('/action/action_id', auth, ActionController.getActionByActioId);


//test
router.get('/test', auth, (req, res) => {
    res.status(200).json({ message: 'test' });
})
// Auth routes
router.post('/auth/resend-verification', AuthController.resendVerification as unknown as RequestHandler);
router.get('/auth/verify-email', AuthController.verifyEmail as unknown as RequestHandler);
router.post("/auth/signin", AuthController.signIn as unknown as RequestHandler);
router.post("/auth/signup", AuthController.signUp as unknown as RequestHandler);
router.post("/auth/signout", AuthController.signOut as unknown as RequestHandler);

// Chat routes
router.post('/chats', auth, ChatController.createChat as unknown as RequestHandler);
router.get('/chats', auth, ChatController.getChats as unknown as RequestHandler);
router.get('/chats/:chatId', auth, ChatController.getChat as unknown as RequestHandler);
router.get('/chats/:chatId/messages', auth, ChatController.getMessages as unknown as RequestHandler);
router.post('/chats/:chatId/messages', auth, ChatController.createMessage as unknown as RequestHandler);
router.put('/chats/:chatId', auth, ChatController.updateChat as unknown as RequestHandler);
router.put('/chats/:chatId/messages/:messageId', auth, ChatController.updateMessage as unknown as RequestHandler);
router.delete('/chats/:chatId', auth, ChatController.deleteChat as unknown as RequestHandler);
router.post('/chat/stream', auth, ChatController.streamChat as unknown as RequestHandler);

// User Profile routes
router.get('/userProfile', auth, UserProfileController.getUserProfile as unknown as RequestHandler);
router.get('/userProfile/all', auth, isAdmin, UserProfileController.getAllUsers as unknown as RequestHandler);


//document routes
router.post('/documents', auth, isAdmin, DocumentController.uploadDocument as unknown as RequestHandler);
router.get('/documents', auth, isAdmin, DocumentController.getDocuments as unknown as RequestHandler);
router.delete('/documents/:id', auth, isAdmin, DocumentController.deleteDocument as unknown as RequestHandler);

//bot setting routes
router.get('/bot-settings', auth, isAdmin, BotSettingController.getBotSettings as unknown as RequestHandler);
router.post('/bot-settings', auth, isAdmin, BotSettingController.saveBotSettings as unknown as RequestHandler);

// Stripe routes
router.get('/stripe/prices', getPrices);
router.get('/stripe/subscriptions/current', auth, getCurrentSubscription);
router.post('/stripe/subscriptions', auth, createSubscription);
router.delete('/stripe/subscriptions/:subscriptionId', auth, cancelSubscription);
router.get('/stripe/subscriptions/:userId', auth, getSubscription);

export default router;
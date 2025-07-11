import express, { RequestHandler } from "express";
import { auth, isAdmin, requireActiveSubscription } from "../middleware";
import AuthController from "../controllers/authController";
import ChatController from "../controllers/chatController";
import UserProfileController from "../controllers/userProfileController";
import { DocumentController } from "../controllers/documentController";
import BotSettingController from "../controllers/botSettingController";
import UserPromptController from "../controllers/userPromptController";
import {
    createSubscription,
    cancelSubscription,
    getSubscription,
    getCurrentSubscription,
    getPrices,
    upgradeSubscription,
    updateSubscription,
    getPlans,
    getPaymentHistory,
    getPaymentMethods,
    convertTrialToPaid,
    syncPaymentMethods,
    cleanupSubscriptions
} from '../controllers/stripeController';
import { getDashboardMetrics, getUserGrowth, getRevenueMetrics } from '../controllers/analyticsController';


const router = express.Router();

router.use(express.json());

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
router.post("/auth/change-password", auth, AuthController.changePassword as unknown as RequestHandler);
router.delete("/auth/delete-account", auth, AuthController.deleteAccount as unknown as RequestHandler);

// Chat routes - protected by subscription
router.post('/chats', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.createChat as unknown as RequestHandler);
router.get('/chats', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.getChats as unknown as RequestHandler);
router.get('/chats/:chatId', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.getChat as unknown as RequestHandler);
router.get('/chats/:chatId/messages', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.getMessages as unknown as RequestHandler);
router.post('/chats/:chatId/messages', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.createMessage as unknown as RequestHandler);
router.put('/chats/:chatId', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.updateChat as unknown as RequestHandler);
router.put('/chats/:chatId/messages/:messageId', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.updateMessage as unknown as RequestHandler);
router.delete('/chats/:chatId/messages/:messageId', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.deleteMessage as unknown as RequestHandler);
router.delete('/chats/:chatId', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.deleteChat as unknown as RequestHandler);
router.post('/chat/stream', auth, requireActiveSubscription as unknown as RequestHandler, ChatController.streamChat as unknown as RequestHandler);

// User Profile routes
router.get('/userProfile', auth, UserProfileController.getUserProfile as unknown as RequestHandler);
router.put('/userProfile', auth, UserProfileController.updateUserProfile as unknown as RequestHandler);
router.get('/userProfile/all', auth, isAdmin, UserProfileController.getAllUsers as unknown as RequestHandler);
router.put('/userProfile/:userId', auth, isAdmin, UserProfileController.updateUserProfileByAdmin as unknown as RequestHandler);


//document routes
router.post('/documents', auth, isAdmin, DocumentController.uploadDocument as unknown as RequestHandler);
router.get('/documents', auth, isAdmin, DocumentController.getDocuments as unknown as RequestHandler);
router.get('/documents/queue-status', auth, isAdmin, DocumentController.getQueueStatus as unknown as RequestHandler);
router.delete('/documents/:id', auth, isAdmin, DocumentController.deleteDocument as unknown as RequestHandler);

//bot setting routes
router.get('/bot-settings', auth, isAdmin, BotSettingController.getBotSettings as unknown as RequestHandler);
router.post('/bot-settings', auth, isAdmin, BotSettingController.saveBotSettings as unknown as RequestHandler);

// User Prompts routes
router.post('/user-prompts', auth, isAdmin, UserPromptController.createUserPrompt as unknown as RequestHandler);
router.get('/user-prompts', auth, isAdmin, UserPromptController.getAllUserPrompts as unknown as RequestHandler);
router.get('/user-prompts/user/:userId', auth, isAdmin, UserPromptController.getUserPrompts as unknown as RequestHandler);
router.get('/user-prompts/:promptId', auth, isAdmin, UserPromptController.getUserPromptById as unknown as RequestHandler);
router.put('/user-prompts/:promptId', auth, isAdmin, UserPromptController.updateUserPrompt as unknown as RequestHandler);
router.delete('/user-prompts/:promptId', auth, isAdmin, UserPromptController.deleteUserPrompt as unknown as RequestHandler);

// Stripe routes - updated to use new subscription tables
router.get('/stripe/prices', getPrices);
router.get('/stripe/plans', getPlans);
router.get('/stripe/subscriptions/current', auth, getCurrentSubscription);
router.post('/stripe/subscriptions', auth, createSubscription);
router.delete('/stripe/subscriptions/:subscriptionId', auth, cancelSubscription);
router.get('/stripe/subscriptions/:userId', auth, getSubscription);
router.post('/stripe/upgrade', auth, upgradeSubscription);
router.post('/stripe/convert-trial', auth, convertTrialToPaid);
router.get('/stripe/payments', auth, getPaymentHistory);
router.get('/stripe/payment-methods', auth, getPaymentMethods);
router.post('/stripe/sync-payment-methods', auth, syncPaymentMethods);

// Also add the new endpoint paths for consistency
router.get('/subscriptions/plans', getPlans);
router.post('/subscriptions', auth, createSubscription);
router.get('/subscriptions/current', auth, getCurrentSubscription);
router.put('/subscriptions/:subscriptionId', auth, updateSubscription);
router.delete('/subscriptions/:subscriptionId', auth, cancelSubscription);
router.post('/subscriptions/convert-trial', auth, convertTrialToPaid);
router.get('/subscriptions/payments', auth, getPaymentHistory);
router.get('/subscriptions/payment-methods', auth, getPaymentMethods);
router.post('/subscriptions/sync-payment-methods', auth, syncPaymentMethods);
router.post('/subscriptions/cleanup/:userId?', auth, cleanupSubscriptions);

// Analytics routes - Admin only
router.get('/analytics/dashboard', auth, isAdmin, getDashboardMetrics);
router.get('/analytics/user-growth', auth, isAdmin, getUserGrowth);
router.get('/analytics/revenue', auth, isAdmin, getRevenueMetrics);

export default router;
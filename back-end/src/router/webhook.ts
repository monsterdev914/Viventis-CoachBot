import { Router } from 'express';
import { handleWebhook } from '../controllers/webhookController';
import express from 'express';

const router = Router();

// Stripe webhook endpoint - needs raw body
router.post('/stripe', 
  express.raw({ type: 'application/json' }),
  (req, res) => {
    console.log('Received webhook with signature:', req.headers['stripe-signature']);
    handleWebhook(req, res);
  }
);

export default router; 
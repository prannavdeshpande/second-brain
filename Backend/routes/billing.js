const express = require('express');
const { 
    createCheckoutSession, 
    handleWebhook, 
    getCustomerPortal 
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/customer-portal', protect, getCustomerPortal);

// Webhook handled in server.js to use express.raw()
router.post('/webhook', handleWebhook);

module.exports = router;
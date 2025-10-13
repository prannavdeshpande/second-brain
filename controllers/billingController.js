const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const pricingPlans = {
  premium: process.env.STRIPE_PREMIUM_PLAN_ID, // Add these to your .env
  pro: process.env.STRIPE_PRO_PLAN_ID,
};

// POST /api/billing/create-checkout-session
exports.createCheckoutSession = async (req, res) => {
    const { plan, successUrl, cancelUrl } = req.body;
    const user = await User.findById(req.user.id).populate('subscription');

    const priceId = pricingPlans[plan];
    if (!priceId) return res.status(400).json({ message: 'Invalid plan selected.' });
    
    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({ email: user.email, name: user.name });
        stripeCustomerId = customer.id;
    }

    try {
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { userId: user.id.toString(), plan: plan }
        });

        // Ensure subscription exists and update customer ID
        if (!user.subscription) {
            const sub = await Subscription.create({ user: user.id, stripeCustomerId });
            user.subscription = sub._id;
        } else {
            await Subscription.findByIdAndUpdate(user.subscription._id, { stripeCustomerId });
        }
        await user.save();

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/billing/customer-portal
exports.getCustomerPortal = async (req, res) => {
    const user = await User.findById(req.user.id).populate('subscription');
    if (!user.subscription?.stripeCustomerId) {
        return res.status(400).json({ message: 'No subscription found for this user.' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.subscription.stripeCustomerId,
        return_url: req.body.returnUrl,
    });
    res.json({ url: portalSession.url });
};

// POST /api/billing/webhook
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, plan } = session.metadata;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        await Subscription.findOneAndUpdate(
            { user: userId },
            {
                plan,
                status: subscription.status,
                stripeSubscriptionId: subscription.id,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            { upsert: true, new: true }
        );
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscription.id },
            {
                status: subscription.status,
                plan: subscription.items.data[0].price.lookup_key, // Assumes you set lookup_keys in Stripe
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
        );
    }
    
    res.json({ received: true });
};
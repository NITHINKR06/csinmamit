const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { admin, db } = require('./config/firebase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - restrict to specific frontend origins
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://csinmamit.com,https://www.csinmamit.com')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Transaction-ID']
}));

// JSON parsing for non-webhook routes
app.use(express.json());

// Webhook needs raw body for signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Membership Plans (Must match frontend/database)
const MEMBERSHIP_PLANS = {
  'one-year': {
    price: 358,
    name: '1-Year Executive Membership',
    duration: '1 Year'
  },
  'two-year': {
    price: 664,
    name: '2-Year Executive Membership',
    duration: '2 Years'
  },
  'three-year': {
    price: 919,
    name: '3-Year Executive Membership',
    duration: '3 Years'
  }
};

// In-memory rate limiting store
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;

const checkRateLimit = (key) => {
  const now = Date.now();
  const entry = rateLimitStore.get(key) || [];
  const recent = entry.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimitStore.set(key, recent);
  return true;
};

// In-memory set of consumed payment IDs (for replay protection)
const consumedPaymentIds = new Set();

// Firebase Auth middleware
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired auth token' });
  }
};

// Create Order Endpoint
app.post('/create-order', verifyFirebaseToken, async (req, res) => {
  try {
    const { planId, userId } = req.body;

    // Verify the authenticated user matches the requested userId
    if (req.user.uid !== userId) {
      return res.status(403).json({ error: 'User ID mismatch' });
    }

    // Rate limiting by userId
    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    if (!planId || !MEMBERSHIP_PLANS[planId]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Check if user already has an active subscription
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.membership?.status === 'active') {
        const expiry = userData.membership.expiresAt?.toDate();
        if (expiry && expiry > new Date()) {
          return res.status(400).json({ error: 'User already has an active subscription' });
        }
      }
    }

    const plan = MEMBERSHIP_PLANS[planId];
    const amount = plan.price * 100;

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: userId,
        planId: planId,
        planName: plan.name
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Payment Endpoint
app.post('/verify-payment', verifyFirebaseToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    // Replay protection: check if this payment_id was already consumed
    if (consumedPaymentIds.has(razorpay_payment_id)) {
      return res.status(400).json({ error: 'Payment already verified' });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ verified: false, error: 'Invalid signature' });
    }

    // Verify the order amount from Razorpay API
    let order;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (fetchError) {
      return res.status(400).json({ error: 'Failed to fetch order details' });
    }

    // Verify payment amount matches expected plan
    const planId = order.notes?.planId;
    if (!planId || !MEMBERSHIP_PLANS[planId]) {
      return res.status(400).json({ error: 'Invalid plan in order' });
    }
    const expectedAmount = MEMBERSHIP_PLANS[planId].price * 100;
    if (order.amount_paid !== expectedAmount) {
      return res.status(400).json({ error: 'Payment amount mismatch' });
    }

    // Mark payment_id as consumed to prevent replay
    consumedPaymentIds.add(razorpay_payment_id);

    res.json({ verified: true });
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Webhook Endpoint
app.post('/webhook', async (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.error('WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(req.body);
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    console.error('Invalid webhook signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log('Webhook verified');

  // Parse raw body to JSON
  let body;
  try {
    body = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const event = body.event;
  const payload = body.payload;

  if (event === 'payment.captured') {
    const payment = payload.payment.entity;
    const userId = payment.notes?.userId;
    const planId = payment.notes?.planId;

    if (!userId || !planId) {
      console.error('Missing userId or planId in payment notes');
      return res.status(400).json({ error: 'Missing user or plan info' });
    }

    // Validate payment amount matches expected plan price
    if (!MEMBERSHIP_PLANS[planId]) {
      console.error(`Invalid planId in webhook: ${planId}`);
      return res.status(400).json({ error: 'Invalid plan' });
    }
    const expectedAmount = MEMBERSHIP_PLANS[planId].price * 100;
    if (payment.amount !== expectedAmount) {
      console.error(`Amount mismatch: got ${payment.amount}, expected ${expectedAmount}`);
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    try {
      // Idempotency check: skip if already processed
      const existingPayment = await db.collection('payments').doc(payment.id).get();
      if (existingPayment.exists) {
        console.log(`Payment ${payment.id} already processed, skipping`);
        return res.json({ status: 'ok', message: 'Already processed' });
      }

      const userRef = db.collection('users').doc(userId);

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.membership?.status === 'active') {
            const expiry = userData.membership.expiresAt?.toDate();
            if (expiry && expiry > new Date()) {
              throw new Error('User already has an active subscription');
            }
          }
        }

        transaction.set(userRef, {
          membership: {
            status: 'active',
            type: planId,
            startDate: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: (() => {
              const now = new Date();
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              const durationYears = planId === 'one-year' ? 1 : planId === 'two-year' ? 2 : 3;
              const expiryDate = new Date(yesterday);
              expiryDate.setFullYear(expiryDate.getFullYear() + durationYears);
              return admin.firestore.Timestamp.fromDate(expiryDate);
            })()
          },
          role: 'EXECUTIVE MEMBER',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Use payment.id as document ID for idempotency
        transaction.set(db.collection('payments').doc(payment.id), {
          userId,
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: payment.status || 'captured',
          planId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      console.log(`User ${userId} upgraded to ${planId} (payment: ${payment.id})`);
    } catch (error) {
      console.error('Error processing webhook:', error.message);
      return res.status(500).json({ error: 'Database update failed' });
    }
  }

  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

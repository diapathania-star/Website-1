import Razorpay from 'razorpay';
import { applyCORS } from './_cors.js';

export default async function handler(req, res) {
  if (applyCORS(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const body = req.body || {};
    const amount = Number(body.amount) || 49900; // paise (₹499)
    const currency = body.currency || 'INR';
    const notes = body.notes || {};

    const order = await rzp.orders.create({
      amount,
      currency,
      payment_capture: 1,
      notes: { product: 'Perception Audit', ...notes },
      receipt: `audit_${Date.now()}`
    });

    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

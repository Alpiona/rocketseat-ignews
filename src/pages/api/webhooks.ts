import { Stripe } from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import { stripe } from '../../services/stripe';
import { saveSubscription } from './_lib/manageSubscription';

async function buffer(readable: Readable): Promise<Buffer> {
  const chunks = [];

  // eslint-disable-next-line
  for await (const chunk of readable) {
    chunk.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscriptions.created',
  'customer.subscriptions.updated',
  'customer.subscriptions.deleted',
]);

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const secret = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      try {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const subscritpion = event.data.object as Stripe.Subscription;

        switch (type) {
          case 'checkout.session.completed':
            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
            );
            break;

          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            await saveSubscription(
              subscritpion.id,
              subscritpion.customer.toString(),
            );
            break;

          default:
            throw new Error('Unhandled event.');
        }
      } catch (err) {
        return res.json({ error: 'Webhook handler failed.' });
      }
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
};

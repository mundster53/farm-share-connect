import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { 
      shareId,
      farmId,
      farmName,
      farmerStripeAccountId,
      buyerId,
      buyerEmail,
      animalType,
      portion,
      price, // in dollars
      weightEstimate
    } = body;

    const origin = req.headers.get('origin') || 'https://farmdirectmeat.com';
    const amountInCents = Math.round(price * 100);
    
    // Calculate 1% platform fee
    const platformFee = Math.round(amountInCents * 0.01);

    // Create a Checkout Session with payment going to the farmer's connected account
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${portion} ${animalType.charAt(0).toUpperCase() + animalType.slice(1)} Share`,
              description: `From ${farmName} - ${weightEstimate}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: farmerStripeAccountId,
        },
        metadata: {
          shareId: shareId,
          farmId: farmId,
          buyerId: buyerId,
          animalType: animalType,
          portion: portion,
        },
      },
      customer_email: buyerEmail,
      success_url: `${origin}/buyer-dashboard?purchase=success&share=${shareId}`,
      cancel_url: `${origin}/farm/${farmId}?cancelled=true`,
      metadata: {
        shareId: shareId,
        farmId: farmId,
        buyerId: buyerId,
        type: 'share_purchase',
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

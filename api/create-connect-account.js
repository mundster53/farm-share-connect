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
    const { userId, email, farmName } = body;
    const origin = req.headers.get('origin') || 'https://farmdirectmeat.com';

    // Create a Stripe Connect Express account for the farmer
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        name: farmName,
        mcc: '5499', // Misc food stores
        url: `${origin}/farm/${userId}`,
      },
      metadata: {
        userId: userId,
        farmName: farmName,
      },
    });

    // Create an account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/farmer-dashboard?refresh=true`,
      return_url: `${origin}/farmer-dashboard?onboarding=complete`,
      type: 'account_onboarding',
    });

    return new Response(JSON.stringify({ 
      accountId: account.id,
      onboardingUrl: accountLink.url 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Connect account error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

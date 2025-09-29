import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Check if stripe is initialized
    if (!stripe) {
      throw new Error('Stripe is not configured. Please check your environment variables.')
    }

    const body = await request.json()
    const { embedded } = body
    
    if (embedded) {
      // Create embedded checkout session
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'payment',
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        automatic_tax: { enabled: true },
        metadata: {
          product: 'ADHD Identity Method',
        },
        phone_number_collection: {
          enabled: false,
        },
        customer_creation: 'always',
        invoice_creation: {
          enabled: true,
        },
      })
      
      return NextResponse.json({ 
        clientSecret: session.client_secret 
      })
    } else {
      // Create standard checkout session (fallback)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.NEXT_PUBLIC_SITE_URL,
        metadata: {
          product: 'ADHD Identity Method',
        },
      })
      
      return NextResponse.json({ 
        sessionId: session.id 
      })
    }
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: `Error creating checkout session: ${error.message}` },
      { status: 500 }
    )
  }
}
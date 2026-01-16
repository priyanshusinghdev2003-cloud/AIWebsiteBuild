import { Request, Response } from "express";
import Stripe from "stripe";
import "dotenv/config";
import prisma from "../lib/prisma.ts";

export const stripeWebhook = async (request: Request, response: Response) => {
  let endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  if (endpointSecret) {
    const signature = request.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err: any) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });
        const session = sessionList.data[0];
        const { transactionId, appId } = session.metadata as {
          transactionId: string;
          appId: string;
        };
        if (appId === "ai-site-builder" && transactionId) {
          const transaction = await prisma.transaction.update({
            where: {
              id: transactionId,
            },
            data: {
              isPaid: true,
            },
          });

          // add credits to user
          await prisma.user.update({
            where: {
              id: transaction.userId,
            },
            data: {
              credits: {
                increment: transaction.credits,
              },
            },
          });
        }

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
};

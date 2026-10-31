import Stripe from "stripe";
const stripe = new Stripe(
  "sk_test_51RBaMWLxzru9hDfEhO7bcHtPc1e88j28Zix6GqabB9fAbeN1jw2GcUJZGu5p4KQnFe9SWxZeIwDf3uGralhMTfMP00bgHVGoqh"
); // your secret key here

const payment = async (number, cvc, exp_month, exp_year, amount) => {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number,
        exp_month,
        exp_year,
        cvc,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in paisa
      currency: "pkr", // always lowercase
      payment_method: paymentMethod.id,
      confirm: true,
      return_url: "http://localhost:5173/", // for redirect-based payments
    });

    return paymentIntent;
  } catch (error) {
    console.error("Stripe payment error:", error);
    return { error: error.message };
  }
};

export default payment;

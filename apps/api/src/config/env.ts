export const env = {
  intaSend: {
    publishableKey: process.env.INTASEND_PUBLISHABLE_KEY ?? "",
    baseUrl:
      process.env.INTASEND_BASE_URL ??
      "https://sandbox.intasend.com",
    host:
      process.env.APP_HOST ??
      "http://localhost:3000",
    redirectUrl:
      process.env.PAYMENT_REDIRECT_URL ??
      "http://localhost:3000/payment/complete",
  },
};
function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}

export const env = {
  database: {
    url: requireEnv("DATABASE_URL"),
  },

  intaSend: {
    publishableKey: requireEnv(
      "INTASEND_PUBLISHABLE_KEY",
    ),

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
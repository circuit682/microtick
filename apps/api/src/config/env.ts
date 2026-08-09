function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  get database() {
    return {
      url: requireEnv("DATABASE_URL"),
    };
  },

  get intaSend() {
    return {
      publishableKey: requireEnv("INTASEND_PUBLISHABLE_KEY"),

      baseUrl: requireEnv("INTASEND_BASE_URL"),

      host: requireEnv("APP_HOST"),

      redirectUrl: requireEnv("PAYMENT_REDIRECT_URL"),
    };
  },
};

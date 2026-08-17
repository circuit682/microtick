function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requireBase64Key(name: string, expectedBytes: number): Buffer {
  const value = requireEnv(name);
  const key = Buffer.from(value, "base64");

  if (key.length !== expectedBytes) {
    throw new Error(
      `${name} must be a base64-encoded ${expectedBytes}-byte key.`,
    );
  }

  return key;
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

  get otp() {
    return {
      provider: requireEnv("OTP_PROVIDER"),
      username: requireEnv("OTP_PROVIDER_USERNAME"),
      apiKey: requireEnv("OTP_PROVIDER_API_KEY"),
      senderId: process.env.OTP_PROVIDER_SENDER_ID,
    };
  },

  get security() {
    return {
      networkIdentityEncryptionKey: requireBase64Key(
        "NETWORK_IDENTITY_ENCRYPTION_KEY",
        32,
      ),

      jwtSecret: requireBase64Key("JWT_SECRET", 32),

      jwtIssuer: requireEnv("JWT_ISSUER"),

      jwtAudience: requireEnv("JWT_AUDIENCE"),
    };
  },
};

export const intaSendWebhookSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["reference"],
    properties: {
      reference: {
        type: "string",
        minLength: 1,
      },
    },
  },
} as const;
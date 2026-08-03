import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: {
        retailerId: {
          type: "string",
          required: false,
        },
        role: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;

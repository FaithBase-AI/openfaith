import { emailChangeOTPClient } from "@openfaith/auth/plugins";
import {
  adminClient,
  emailOTPClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Get base URL, but treat empty, "RELATIVE", or localhost values as undefined for relative calls
const getBaseURL = () => {
  const envValue = import.meta.env.VITE_ZERO_SERVER;

  // If empty, "RELATIVE", or any localhost value, use relative calls (ingress routing)
  if (
    !envValue ||
    envValue === "" ||
    envValue === "RELATIVE" ||
    envValue.includes("localhost")
  ) {
    return undefined;
  }

  return envValue;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    emailOTPClient(),
    adminClient(),
    organizationClient(),
    emailChangeOTPClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
export type ActiveOrg = typeof authClient.$Infer.ActiveOrganization;
export type SlimOrg = typeof authClient.$Infer.Organization;

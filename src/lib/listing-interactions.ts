export type VerificationProfile = {
  subscription_status?: string | null;
  subscription_until?: string | null;
  subscription_tier?: string | null;
  is_showroom?: boolean | null;
};

export function isActivePaidSubscription(profile?: VerificationProfile | null) {
  return profile?.subscription_status === "active" &&
    !!profile.subscription_until &&
    new Date(profile.subscription_until).getTime() > Date.now();
}

export function isVerifiedShowroom(profile?: VerificationProfile | null) {
  return !!profile?.is_showroom && isActivePaidSubscription(profile);
}

export function supabaseSucceeded(result: { error?: unknown } | null | undefined) {
  return !result?.error;
}

export type VerificationProfile = {
  subscription_status?: string | null;
  subscription_until?: string | null;
  subscription_tier?: string | null;
  is_showroom?: boolean | null;
  is_verified?: boolean | null;
  verification_status?: string | null;
};

export function isActivePaidSubscription(profile?: VerificationProfile | null) {
  return profile?.subscription_status === "active" &&
    !!profile.subscription_until &&
    new Date(profile.subscription_until).getTime() > Date.now();
}

export function isVerifiedShowroom(profile?: VerificationProfile | null) {
  const verified = profile?.is_verified === true || profile?.verification_status === "verified";
  return !!profile?.is_showroom && verified && isActivePaidSubscription(profile);
}

export function dataOperationSucceeded(result: { error?: unknown } | null | undefined) {
  return !result?.error;
}

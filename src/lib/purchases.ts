import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

/**
 * Real subscriptions via RevenueCat (wraps Google Play Billing). Gated behind
 * EXPO_PUBLIC_REVENUECAT_ANDROID_KEY — without it, isPurchasesConfigured()
 * returns false and the app falls back to the local demo Pro toggle in
 * store.tsx (setPro/startTrial), same pattern as the Groq/Gemini AI keys.
 */

const ENTITLEMENT_ID = 'pro';

let configuredPromise: Promise<void> | null = null;

export function isPurchasesConfigured(): boolean {
  return !!process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
}

function ensureConfigured(): Promise<void> {
  if (!configuredPromise) {
    configuredPromise = (async () => {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
      if (!apiKey) throw new Error('No RevenueCat API key configured');
      Purchases.configure({ apiKey });
    })();
  }
  return configuredPromise;
}

export interface ProStatus {
  isPro: boolean;
  trialEndsAt: string | null;
}

function statusFromCustomerInfo(info: CustomerInfo): ProStatus {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) return { isPro: false, trialEndsAt: null };
  return {
    isPro: true,
    trialEndsAt: entitlement.periodType === 'TRIAL' ? entitlement.expirationDate : null,
  };
}

export async function getProStatus(): Promise<ProStatus> {
  await ensureConfigured();
  const info = await Purchases.getCustomerInfo();
  return statusFromCustomerInfo(info);
}

export function addProStatusListener(callback: (status: ProStatus) => void): void {
  if (!isPurchasesConfigured()) return;
  ensureConfigured().then(() => {
    Purchases.addCustomerInfoUpdateListener((info) => callback(statusFromCustomerInfo(info)));
  });
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  await ensureConfigured();
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<ProStatus> {
  await ensureConfigured();
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return statusFromCustomerInfo(customerInfo);
}

export async function restorePurchases(): Promise<ProStatus> {
  await ensureConfigured();
  const info = await Purchases.restorePurchases();
  return statusFromCustomerInfo(info);
}

export function isUserCancelledError(err: unknown): boolean {
  return !!err && typeof err === 'object' && (err as { userCancelled?: boolean }).userCancelled === true;
}

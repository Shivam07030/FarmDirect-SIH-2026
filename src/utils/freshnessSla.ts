import { Product, MarketRules } from '../types';

export type FreshnessTier = 'FRESH' | 'EXPIRING_SOON' | 'EXPIRED';

export interface FreshnessSlaResult {
  ageHours: number;
  tier: FreshnessTier;
  isPurchaseLocked: boolean;
  hoursUntilLock: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  badgeIconColor: string;
  labelHindi: string;
  labelEnglish: string;
  warningNoticeHindi: string;
  warningNoticeEnglish: string;
}

/**
 * Calculates produce photo freshness based on dynamic Admin MarketRules.
 * Default policy:
 * - < 12 hrs: Live Fresh Photo (Green)
 * - 12 - 24 hrs: Refresh Due Soon (Amber - seller notified)
 * - >= 24 hrs: Stale Photo / Purchase Paused (Red - purchase locked)
 */
export function getProduceFreshnessInfo(
  product: Product,
  marketRules?: MarketRules
): FreshnessSlaResult {
  const warningHours = marketRules?.photoWarningHours ?? 12;
  const expiryHours = product.photoExpiryHours ?? (marketRules?.photoExpiryHours ?? 24);
  const isEnforced = marketRules?.isPhotoSlaEnforced ?? true;

  // Calculate age in hours
  let ageHours = 3.5; // fallback fresh
  if (product.photoUpdatedAt) {
    const updatedTime = new Date(product.photoUpdatedAt).getTime();
    if (!isNaN(updatedTime)) {
      ageHours = Math.max(0, (Date.now() - updatedTime) / (1000 * 60 * 60));
    }
  } else if (product.harvestDate) {
    const harvestTime = new Date(product.harvestDate).getTime();
    if (!isNaN(harvestTime)) {
      const diff = (Date.now() - harvestTime) / (1000 * 60 * 60);
      ageHours = Math.max(2, Math.round(diff * 10) / 10);
    }
  }

  // Round to 1 decimal
  ageHours = Math.round(ageHours * 10) / 10;

  let tier: FreshnessTier = 'FRESH';
  if (ageHours >= expiryHours) {
    tier = 'EXPIRED';
  } else if (ageHours >= warningHours) {
    tier = 'EXPIRING_SOON';
  }

  const isPurchaseLocked = tier === 'EXPIRED' && isEnforced;
  const hoursUntilLock = Math.max(0, Math.round((expiryHours - ageHours) * 10) / 10);

  if (tier === 'FRESH') {
    return {
      ageHours,
      tier,
      isPurchaseLocked: false,
      hoursUntilLock,
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-200',
      badgeText: 'text-emerald-800',
      badgeIconColor: 'text-emerald-600',
      labelEnglish: `📸 Fresh Photo · ${ageHours}h ago`,
      labelHindi: `📸 ताज़ा फोटो · ${ageHours} घंटे पहले`,
      warningNoticeEnglish: `Photo verified fresh (< ${warningHours}h). Produce guaranteed as shown.`,
      warningNoticeHindi: `फोटो ताज़ा सत्यापित है (< ${warningHours} घंटे)। फसल वैसी ही मिलेगी जैसी फोटो में है।`
    };
  }

  if (tier === 'EXPIRING_SOON') {
    return {
      ageHours,
      tier,
      isPurchaseLocked: false,
      hoursUntilLock,
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-300',
      badgeText: 'text-amber-900',
      badgeIconColor: 'text-amber-600',
      labelEnglish: `⏱️ Refresh Due · ${ageHours}h old (${hoursUntilLock}h left)`,
      labelHindi: `⏱️ फोटो अपडेट आवश्यक · ${ageHours} घंटे पुरानी (${hoursUntilLock} घंटे शेष)`,
      warningNoticeEnglish: `Photo is over ${warningHours}h old. Seller prompted for fresh update within ${hoursUntilLock}h.`,
      warningNoticeHindi: `फोटो ${warningHours} घंटे से अधिक पुरानी है। विक्रेता को ${hoursUntilLock} घंटे में ताज़ा फोटो अपलोड करने का अलर्ट भेजा गया है।`
    };
  }

  // EXPIRED
  return {
    ageHours,
    tier,
    isPurchaseLocked,
    hoursUntilLock: 0,
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-300',
    badgeText: 'text-rose-900',
    badgeIconColor: 'text-rose-600',
    labelEnglish: `⛔ Photo Stale (>${expiryHours}h) · Purchase Paused`,
    labelHindi: `⛔ फोटो अवधि समाप्त (>${expiryHours} घंटे) · बिक्री रोकी गई`,
    warningNoticeEnglish: `Photo exceeds Admin SLA (${expiryHours}h). Purchase locked until seller verifies current crop condition with a fresh photo.`,
    warningNoticeHindi: `फोटो एडमिन SLA (${expiryHours} घंटे) से पुरानी है। सड़ी/खराब फसल से खरीदार की सुरक्षा के लिए बिक्री तब तक रोकी गई है जब तक किसान नई फोटो न डाले।`
  };
}

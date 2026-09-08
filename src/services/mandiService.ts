// ==========================================
// AGMARKNET & e-NAM MANDI ARBITRAGE SERVICE
// Multi-Mandi Comparative Take-Home Realization
// Direct FarmDirect vs APMC Commission Mandis
// ==========================================

export interface MandiComparisonRow {
  mandiName: string;
  mandiHindi: string;
  distanceKm: number;
  grossPricePerQtl: number; // in INR / Quintal (100 kg)
  apmcCessRate: number; // e.g. 1.5%
  arhatiyaCommissionRate: number; // e.g. 6.0%
  palledariChargesPerQtl: number; // ₹25/qtl
  spoilageFactorRate: number; // e.g. 8.0%
  freightCostPerQtl: number; // ₹60/qtl
  netFarmerRealizationPerQtl: number; // Actual take-home in-hand
  netPricePerKg: number;
  directSpreadPerQtl: number; // Extra ₹ gained via FarmDirect
}

export interface CropArbitrageSummary {
  cropName: string;
  cropHindi: string;
  farmDirectWholesaleRatePerQtl: number; // FarmDirect Direct purchase price
  farmDirectPricePerKg: number;
  bestMandiNetRealizationPerQtl: number;
  maxArbitrageGainPerQtl: number;
  highestSpreadMandi: string;
  recommendationHindi: string;
  recommendationEn: string;
  mandis: MandiComparisonRow[];
}

export const CROP_MANDI_BENCHMARKS: Record<string, CropArbitrageSummary> = {
  Tomato: {
    cropName: 'Tomato',
    cropHindi: 'टमाटर',
    farmDirectWholesaleRatePerQtl: 2400, // ₹24/kg direct
    farmDirectPricePerKg: 24,
    bestMandiNetRealizationPerQtl: 1980,
    maxArbitrageGainPerQtl: 420,
    highestSpreadMandi: 'Azadpur Mandi (Delhi)',
    recommendationHindi: 'फार्मडायरेक्ट पर बेचें: आजादपुर मंडी की तुलना में प्रति क्विंटल ₹420 अतिरिक्त शुद्ध लाभ!',
    recommendationEn: 'Sell via FarmDirect: Earn +₹420 extra net profit per quintal compared to Azadpur APMC!',
    mandis: [
      {
        mandiName: 'Agra APMC Mandi',
        mandiHindi: 'आगरा मंडी',
        distanceKm: 22,
        grossPricePerQtl: 2150,
        apmcCessRate: 0.015,
        arhatiyaCommissionRate: 0.06,
        palledariChargesPerQtl: 25,
        spoilageFactorRate: 0.06,
        freightCostPerQtl: 40,
        netFarmerRealizationPerQtl: 1810,
        netPricePerKg: 18.1,
        directSpreadPerQtl: 590,
      },
      {
        mandiName: 'Azadpur Mandi (Delhi)',
        mandiHindi: 'आजादपुर मंडी (दिल्ली)',
        distanceKm: 210,
        grossPricePerQtl: 2550,
        apmcCessRate: 0.02,
        arhatiyaCommissionRate: 0.065,
        palledariChargesPerQtl: 30,
        spoilageFactorRate: 0.09,
        freightCostPerQtl: 140,
        netFarmerRealizationPerQtl: 1980,
        netPricePerKg: 19.8,
        directSpreadPerQtl: 420,
      },
      {
        mandiName: 'Mathura Mandi',
        mandiHindi: 'मथुरा मंडी',
        distanceKm: 58,
        grossPricePerQtl: 2050,
        apmcCessRate: 0.015,
        arhatiyaCommissionRate: 0.06,
        palledariChargesPerQtl: 25,
        spoilageFactorRate: 0.07,
        freightCostPerQtl: 55,
        netFarmerRealizationPerQtl: 1715,
        netPricePerKg: 17.15,
        directSpreadPerQtl: 685,
      },
      {
        mandiName: 'Jaipur Muhana Mandi',
        mandiHindi: 'जयपुर मुहाना मंडी',
        distanceKm: 235,
        grossPricePerQtl: 2420,
        apmcCessRate: 0.016,
        arhatiyaCommissionRate: 0.06,
        palledariChargesPerQtl: 28,
        spoilageFactorRate: 0.08,
        freightCostPerQtl: 150,
        netFarmerRealizationPerQtl: 1910,
        netPricePerKg: 19.1,
        directSpreadPerQtl: 490,
      },
    ],
  },
  Potato: {
    cropName: 'Potato',
    cropHindi: 'आलू',
    farmDirectWholesaleRatePerQtl: 1800, // ₹18/kg
    farmDirectPricePerKg: 18,
    bestMandiNetRealizationPerQtl: 1490,
    maxArbitrageGainPerQtl: 310,
    highestSpreadMandi: 'Agra Khandari Mandi',
    recommendationHindi: 'फार्मडायरेक्ट डायरेक्ट पिकअप: शीतगृह से सीधे खरीदार को देने पर ₹310/क्विंटल की बचत।',
    recommendationEn: 'FarmDirect Cold Chain: Zero mandi tax saves ₹310/qtl directly from farm-gate.',
    mandis: [
      {
        mandiName: 'Agra Khandari Mandi',
        mandiHindi: 'आगरा खंदारी मंडी',
        distanceKm: 18,
        grossPricePerQtl: 1680,
        apmcCessRate: 0.015,
        arhatiyaCommissionRate: 0.05,
        palledariChargesPerQtl: 20,
        spoilageFactorRate: 0.03,
        freightCostPerQtl: 35,
        netFarmerRealizationPerQtl: 1475,
        netPricePerKg: 14.75,
        directSpreadPerQtl: 325,
      },
      {
        mandiName: 'Azadpur Mandi (Delhi)',
        mandiHindi: 'आजादपुर मंडी (दिल्ली)',
        distanceKm: 210,
        grossPricePerQtl: 1880,
        apmcCessRate: 0.02,
        arhatiyaCommissionRate: 0.06,
        palledariChargesPerQtl: 25,
        spoilageFactorRate: 0.04,
        freightCostPerQtl: 120,
        netFarmerRealizationPerQtl: 1490,
        netPricePerKg: 14.9,
        directSpreadPerQtl: 310,
      },
      {
        mandiName: 'Alwar Mandi',
        mandiHindi: 'अलवर मंडी',
        distanceKm: 165,
        grossPricePerQtl: 1720,
        apmcCessRate: 0.016,
        arhatiyaCommissionRate: 0.055,
        palledariChargesPerQtl: 22,
        spoilageFactorRate: 0.03,
        freightCostPerQtl: 95,
        netFarmerRealizationPerQtl: 1420,
        netPricePerKg: 14.2,
        directSpreadPerQtl: 380,
      },
    ],
  },
  Onion: {
    cropName: 'Onion',
    cropHindi: 'प्याज',
    farmDirectWholesaleRatePerQtl: 2800, // ₹28/kg
    farmDirectPricePerKg: 28,
    bestMandiNetRealizationPerQtl: 2320,
    maxArbitrageGainPerQtl: 480,
    highestSpreadMandi: 'Azadpur Mandi (Delhi)',
    recommendationHindi: 'आजादपुर में आढ़त और वजन कटौती की तुलना में फार्मडायरेक्ट पर ₹480/क्विंटल अधिक शुद्ध आय।',
    recommendationEn: 'Direct wholesale gives +₹480/qtl extra profit over APMC commission structures.',
    mandis: [
      {
        mandiName: 'Agra APMC Mandi',
        mandiHindi: 'आगरा मंडी',
        distanceKm: 22,
        grossPricePerQtl: 2550,
        apmcCessRate: 0.015,
        arhatiyaCommissionRate: 0.06,
        palledariChargesPerQtl: 25,
        spoilageFactorRate: 0.05,
        freightCostPerQtl: 40,
        netFarmerRealizationPerQtl: 2180,
        netPricePerKg: 21.8,
        directSpreadPerQtl: 620,
      },
      {
        mandiName: 'Azadpur Mandi (Delhi)',
        mandiHindi: 'आजादपुर मंडी (दिल्ली)',
        distanceKm: 210,
        grossPricePerQtl: 2980,
        apmcCessRate: 0.02,
        arhatiyaCommissionRate: 0.065,
        palledariChargesPerQtl: 30,
        spoilageFactorRate: 0.07,
        freightCostPerQtl: 135,
        netFarmerRealizationPerQtl: 2320,
        netPricePerKg: 23.2,
        directSpreadPerQtl: 480,
      },
    ],
  },
  Wheat: {
    cropName: 'Wheat',
    cropHindi: 'गेहूं',
    farmDirectWholesaleRatePerQtl: 3100, // ₹31/kg
    farmDirectPricePerKg: 31,
    bestMandiNetRealizationPerQtl: 2750,
    maxArbitrageGainPerQtl: 350,
    highestSpreadMandi: 'Mathura Mandi',
    recommendationHindi: 'फार्मडायरेक्ट पर सीधे फ्लोर मिलों को बेचें: ₹350/क्विंटल अतिरिक्त लाभ बिना किसी बिचौलिये के।',
    recommendationEn: 'Sell direct to industrial flour millers: +₹350/qtl arbitrage spread over local APMC.',
    mandis: [
      {
        mandiName: 'Agra Mandi',
        mandiHindi: 'आगरा मंडी',
        distanceKm: 22,
        grossPricePerQtl: 2820,
        apmcCessRate: 0.015,
        arhatiyaCommissionRate: 0.05,
        palledariChargesPerQtl: 20,
        spoilageFactorRate: 0.01,
        freightCostPerQtl: 35,
        netFarmerRealizationPerQtl: 2570,
        netPricePerKg: 25.7,
        directSpreadPerQtl: 530,
      },
      {
        mandiName: 'Mathura Mandi',
        mandiHindi: 'मथुरा मंडी',
        distanceKm: 58,
        grossPricePerQtl: 2950,
        apmcCessRate: 0.015,
        arhatiyaCommissionRate: 0.05,
        palledariChargesPerQtl: 22,
        spoilageFactorRate: 0.01,
        freightCostPerQtl: 45,
        netFarmerRealizationPerQtl: 2750,
        netPricePerKg: 27.5,
        directSpreadPerQtl: 350,
      },
    ],
  },
  Mustard: {
    cropName: 'Mustard',
    cropHindi: 'सरसों',
    farmDirectWholesaleRatePerQtl: 5400, // ₹54/kg
    farmDirectPricePerKg: 54,
    bestMandiNetRealizationPerQtl: 4850,
    maxArbitrageGainPerQtl: 550,
    highestSpreadMandi: 'Bharatpur Mandi',
    recommendationHindi: 'ऑयल मिल डायरेक्ट टाई-अप: प्रति क्विंटल ₹550 की अतिरिक्त बचत।',
    recommendationEn: 'Direct oil expeller procurement saves ₹550/qtl in APMC cess and trading commissions.',
    mandis: [
      {
        mandiName: 'Agra Mandi',
        mandiHindi: 'आगरा मंडी',
        distanceKm: 22,
        grossPricePerQtl: 5100,
        apmcCessRate: 0.015,
        arhatiyaCommissionRate: 0.05,
        palledariChargesPerQtl: 20,
        spoilageFactorRate: 0.01,
        freightCostPerQtl: 35,
        netFarmerRealizationPerQtl: 4700,
        netPricePerKg: 47.0,
        directSpreadPerQtl: 700,
      },
      {
        mandiName: 'Bharatpur Mandi',
        mandiHindi: 'भरतपुर मंडी',
        distanceKm: 55,
        grossPricePerQtl: 5250,
        apmcCessRate: 0.016,
        arhatiyaCommissionRate: 0.05,
        palledariChargesPerQtl: 22,
        spoilageFactorRate: 0.01,
        freightCostPerQtl: 45,
        netFarmerRealizationPerQtl: 4850,
        netPricePerKg: 48.5,
        directSpreadPerQtl: 550,
      },
    ],
  },
};

export function getCropArbitrage(crop: string): CropArbitrageSummary {
  const normalized = crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase();
  return CROP_MANDI_BENCHMARKS[normalized] || CROP_MANDI_BENCHMARKS['Tomato'];
}

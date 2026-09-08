export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN';
export type BuyerTier = 'RETAIL' | 'WHOLESALE';

export type ProductCategory = 'Vegetables' | 'Grains' | 'Fruits' | 'Pulses' | 'Spices';

export type ProductQuality = 'Grade A+ (Export Quality)' | 'Grade A (Premium)' | 'Grade B (Standard)' | 'Organic Certified';

export type OrderStatus = 'Pending' | 'Confirmed' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  quantity: number; // in kg
  initialQuantity: number;
  pricePerKg: number; // in INR
  location: string;
  harvestDate: string;
  quality: ProductQuality;
  farmerName: string;
  farmerPhone: string;
  farmerRating: number;
  imageUrl?: string;
  photoUpdatedAt?: string; // Timestamp when farmer last uploaded/verified produce photo
  photoExpiryHours?: number; // Overrideable lot-level photo expiry (default governed by Admin MarketRules)
  description?: string;
  isDemoAdded?: boolean;
  variety?: string;
  status?: 'Active' | 'Paused';
  aiQualityGrade?: string;
  freshnessScore?: number;
  shelfLifeDays?: number;
  qualityCertificateId?: string;
  batchId?: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  farmerName: string;
  buyerName: string;
  buyerTier?: BuyerTier;
  quantity: number; // in kg
  pricePerKg: number;
  totalPrice: number;
  logisticsFee: number;
  finalAmount: number;
  deliveryLocation: string;
  pickupLocation?: string;
  pickupCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  pickupScheduled?: string;
  distanceKm?: number;
  durationText?: string;
  orderDate: string;
  status: OrderStatus;
  estimatedDelivery: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  temperatureCelsius?: number;
  deliveryOtp?: string;
  rating?: number;
  reviewComment?: string;
  produceRating?: number;
  logisticsRating?: number;
  ratedAt?: string;
  paymentStatus?: 'PAID_ESCROW_LOCKED' | 'PAYOUT_RELEASED' | 'PENDING' | 'REFUNDED_TO_BUYER';
  paymentId?: string;
  paymentMode?: string;
  cfOrderId?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: 'BUYER' | 'FARMER' | 'ADMIN';
}

export interface HistoricalDemandPoint {
  day: string;
  date: string;
  demandKg: number;
  priceAvg: number;
}

export interface ForecastDemandPoint {
  day: string;
  date: string;
  predictedDemandKg: number;
  lowerBound: number;
  upperBound: number;
}

export interface CropForecastData {
  cropName: string;
  category: ProductCategory;
  currentDemand: number;
  predictedDemand: number;
  expectedGrowthPercent: number;
  recommendationType: 'Increase production' | 'Reduce production' | 'Maintain current supply';
  recommendationText: string;
  historicalData: HistoricalDemandPoint[];
  forecastData: ForecastDemandPoint[];
}

export interface RouteWaypoint {
  id: string;
  name: string;
  role: 'FARMER' | 'HUB' | 'BUYER';
  city: string;
  lat: number;
  lng: number;
  cargoKg: number;
  timeEstimate: string;
}

export interface LogisticsComparison {
  traditionalRoute: {
    name: string;
    totalDistanceKm: number;
    estimatedCostInr: number;
    transitHours: number;
    co2Kg: number;
    description: string;
    legs: { from: string; to: string; distanceKm: number; costInr: number }[];
  };
  optimizedRoute: {
    name: string;
    totalDistanceKm: number;
    estimatedCostInr: number;
    transitHours: number;
    co2Kg: number;
    description: string;
    stops: string[];
    savingsInr: number;
    distanceSavedPercent: number;
  };
}

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface FarmerKycData {
  pmKisanId: string;
  khasraNo: string;
  landSizeAcres: number;
  clusterLocation: string;
  lat?: number;
  lng?: number;
  verifiedAt?: string;
  verifiedCluster?: string;
  isVerified?: boolean;
  aadhaarNo?: string;
  panNo?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankName?: string;
  dbtLinked?: boolean;
}

export interface BuyerKycData {
  gstin: string;
  legalBusinessName: string;
  pan: string;
  state: string;
  fssaiLicense?: string;
  tradeType: 'RETAILER' | 'WHOLESALER' | 'PROCESSOR' | 'EXPORTER';
  aadhaarNo?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankName?: string;
}

export interface PriceCollar {
  cropName: string;
  floorPrice: number;
  ceilingPrice: number;
  benchmarkMandiFarmer: number;
  benchmarkMandiConsumer: number;
  optimalRecommendedPrice: number;
}

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  location: string;
  verificationStatus: VerificationStatus;
  accountStatus?: AccountStatus;
  suspensionReason?: string;
  farmerKyc?: FarmerKycData;
  buyerKyc?: BuyerKycData;
  buyerTier?: BuyerTier;
}

export interface MarketRules {
  retailMaxQtyKg: number;
  wholesaleMinQtyKg: number;
  retailDeliveryFee: number;
  wholesaleBaseFreight: number;
  wholesalePerKgFreight: number;
  isRationingActive: boolean;
  rationingReason: string;
  // --- Dynamic Produce Photo Freshness & Cancellation SLA (Governed by Admin) ---
  photoWarningHours: number;             // Hours threshold for Amber seller warning (default 12)
  photoExpiryHours: number;              // Hours threshold for Red hard purchase lock (default 24)
  isPhotoSlaEnforced: boolean;           // Whether purchase locking is actively enforced by Admin
  allowPreShipmentCancellation: boolean; // Whether buyers & farmers can cancel orders before dispatch
  cancellationRefundPercent: number;     // Percentage of escrow refunded on pre-shipment cancel (default 100%)
  updatedAt?: string;
}

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export type TicketCategory = 
  | 'DAMAGED_PRODUCE'
  | 'COLD_CHAIN_TEMP_BREACH'
  | 'PAYMENT_ESCROW'
  | 'WEIGHMENT_DISCREPANCY'
  | 'MIDDLEMAN_SUSPICION'
  | 'DELIVERY_DELAY'
  | 'OTHER';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus = 'OPEN' | 'IN_INVESTIGATION' | 'RESOLVED' | 'REJECTED';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userRole: 'FARMER' | 'BUYER';
  orderId?: string;
  subject: string;
  category: TicketCategory;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  adminNotes?: string;
  resolutionSummary?: string;
  createdAt: string;
  updatedAt?: string;
}

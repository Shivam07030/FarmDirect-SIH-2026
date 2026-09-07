export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN';

export type ProductCategory = 'Vegetables' | 'Grains' | 'Fruits' | 'Pulses' | 'Spices';

export type ProductQuality = 'Grade A+ (Export Quality)' | 'Grade A (Premium)' | 'Grade B (Standard)' | 'Organic Certified';

export type OrderStatus = 'Pending' | 'Confirmed' | 'In Transit' | 'Delivered';

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
  description?: string;
  isDemoAdded?: boolean;
  variety?: string;
  status?: 'Active' | 'Paused';
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  farmerName: string;
  buyerName: string;
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

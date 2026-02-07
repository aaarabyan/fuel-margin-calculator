export type FuelType = 'DT' | 'AI92';

export interface FuelConfig {
  name: string;
  density: number;
  exciseMode: 'fixed' | 'min_vat_excise';
  exciseFixedAmd?: number;
  baseExciseAmd?: number;
  minVatPlusExciseAmd?: number;
}

export interface Inputs {
  purchaseUsd: number;
  deliveryUsd: number;
  customsDutyUsd: number;
  sellAmdPerL: number;
  truckTons: number;
  truckLiters: number;
  usdRate: number;
  density: number;
  fuelType: FuelType;
}

export interface CalcResult {
  // Input conversions
  purchaseAmd: number;
  deliveryAmd: number;
  customsDutyAmd: number;
  
  // Tax
  exciseAmd: number;
  gasDiffAmd: number;
  ecoAmd: number;
  
  // Per ton
  vatBaseAmd: number;
  vatAmd: number;
  totalCostTonAmd: number;
  litersPerTon: number;
  costPerLAmd: number;
  marginPerLAmd: number;
  marginPct: number;
  
  // Per truck
  totalLiters: number;
  taxBlockAmd: number;
  totalCostTruckAmd: number;
  revenueTruckAmd: number;
  
  // Profit
  incomeTonAmd: number;
  incomeTruckAmd: number;
  overVatPerLAmd: number;
  overVatPerTonAmd: number;
  profitAfterVatAmd: number;
  netProfitAmd: number;
  
  // Break-even
  breakEvenPriceAmd: number;
  
  // Helpers
  rate: number;
  fuelName: string;
  density: number;
}

export interface Scenario {
  id: string;
  name: string;
  inputs: Inputs;
  result: CalcResult;
  timestamp: number;
}

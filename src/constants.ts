import type { FuelConfig, FuelType, Inputs } from './types';

export const VAT = 0.20;
export const ECO = 0.02;
export const TAX18 = 0.18;
export const FIXED_PER_TRUCK_AMD = 260000;

export const FUELS: Record<FuelType, FuelConfig> = {
  DT: {
    name: 'Дизельное топливо',
    density: 0.845,
    exciseMode: 'fixed',
    exciseFixedAmd: 17608,
  },
  AI92: {
    name: 'АИ‑92/95 Бензин',
    density: 0.745,
    exciseMode: 'min_vat_excise',
    baseExciseAmd: 54064,
    minVatPlusExciseAmd: 167400,
  },
};

export const DEFAULT_INPUTS: Inputs = {
  purchaseUsd: 750,
  deliveryUsd: 80,
  customsDutyUsd: 0,
  sellAmdPerL: 370,
  truckTons: 25,
  truckLiters: 29586,
  usdRate: 384,
  density: 0.845,
  fuelType: 'DT',
};

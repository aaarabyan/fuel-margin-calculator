import type { Inputs, CalcResult } from './types';
import { FUELS, VAT, ECO, TAX18, FIXED_PER_TRUCK_AMD } from './constants';

export function calculate(inputs: Inputs): CalcResult {
  const {
    purchaseUsd, deliveryUsd, customsDutyUsd,
    sellAmdPerL, truckTons, density: inputDensity, fuelType,
  } = inputs;
  
  const rate = Math.max(0.0000001, inputs.usdRate);
  const density = Math.max(0.0000001, inputDensity);
  const f = FUELS[fuelType];

  const purchaseAmd = purchaseUsd * rate;
  const deliveryAmd = deliveryUsd * rate;
  const customsDutyAmd = customsDutyUsd * rate;

  let exciseAmd = 0;
  let gasDiffAmd = 0;

  if (f.exciseMode === 'fixed') {
    exciseAmd = f.exciseFixedAmd!;
  } else {
    gasDiffAmd = (VAT * (purchaseAmd + deliveryAmd) + f.baseExciseAmd!) - f.minVatPlusExciseAmd!;
    const xFromMin = (f.minVatPlusExciseAmd! - VAT * (purchaseAmd + deliveryAmd)) / (1 + VAT);
    exciseAmd = Math.max(f.baseExciseAmd!, xFromMin);
  }

  const ecoAmd = (purchaseAmd + deliveryAmd) * ECO;
  const vatBaseAmd = purchaseAmd + deliveryAmd + exciseAmd;
  const vatAmd = vatBaseAmd * VAT;
  const totalCostTonAmd = purchaseAmd + deliveryAmd + exciseAmd + ecoAmd + customsDutyAmd + vatAmd;

  const litersPerTon = 1000 / density;
  const costPerLAmd = totalCostTonAmd / litersPerTon;
  const marginPerLAmd = sellAmdPerL - costPerLAmd;
  const marginPct = costPerLAmd === 0 ? 0 : marginPerLAmd / costPerLAmd;

  const totalLiters = litersPerTon * truckTons;
  const taxBlockAmd = (vatAmd + exciseAmd + ecoAmd + customsDutyAmd) * truckTons;

  const incomeTonAmd = sellAmdPerL * litersPerTon - totalCostTonAmd;
  const incomeTruckAmd = incomeTonAmd * truckTons;

  const outputVatPerLAmd = sellAmdPerL * VAT / (1 + VAT);
  const inputVatPerLAmd = vatAmd / litersPerTon;
  const overVatPerLAmd = outputVatPerLAmd - inputVatPerLAmd;
  const overVatPerTonAmd = overVatPerLAmd * litersPerTon;

  const profitAfterVatAmd = incomeTruckAmd - overVatPerLAmd * totalLiters - FIXED_PER_TRUCK_AMD;
  const netProfitAmd = profitAfterVatAmd * (1 - TAX18);

  const totalCostTruckAmd = totalCostTonAmd * truckTons;
  const revenueTruckAmd = sellAmdPerL * totalLiters;

  // Break-even: find sellPrice where netProfit = 0
  // netProfit = (income - overVat*totalLiters - FIXED) * (1-TAX18) = 0
  // income = sellPrice*totalLiters - totalCostTonAmd*truckTons
  // overVat = sellPrice*VAT/(1+VAT) - vatAmd/litersPerTon
  // Solving: (sellPrice*totalLiters - totalCostTruckAmd - (sellPrice*VAT/(1+VAT) - inputVatPerLAmd)*totalLiters - FIXED) = 0
  // sellPrice*totalLiters*(1 - VAT/(1+VAT)) - totalCostTruckAmd + inputVatPerLAmd*totalLiters - FIXED = 0
  // sellPrice*totalLiters/(1+VAT) = totalCostTruckAmd - inputVatPerLAmd*totalLiters + FIXED
  // sellPrice = (totalCostTruckAmd - inputVatPerLAmd*totalLiters + FIXED) * (1+VAT) / totalLiters
  const breakEvenPriceAmd = totalLiters > 0
    ? (totalCostTruckAmd - inputVatPerLAmd * totalLiters + FIXED_PER_TRUCK_AMD) * (1 + VAT) / totalLiters
    : 0;

  return {
    purchaseAmd, deliveryAmd, customsDutyAmd,
    exciseAmd, gasDiffAmd, ecoAmd,
    vatBaseAmd, vatAmd, totalCostTonAmd,
    litersPerTon, costPerLAmd, marginPerLAmd, marginPct,
    totalLiters, taxBlockAmd, totalCostTruckAmd, revenueTruckAmd,
    incomeTonAmd, incomeTruckAmd,
    overVatPerLAmd, overVatPerTonAmd,
    profitAfterVatAmd, netProfitAmd,
    breakEvenPriceAmd,
    rate, fuelName: f.name, density,
  };
}

export function generateSensitivityData(inputs: Inputs): Array<{ price: number; profit: number; profitUsd: number }> {
  const data: Array<{ price: number; profit: number; profitUsd: number }> = [];
  const step = 5;
  const range = 80;
  const basePrice = inputs.sellAmdPerL;
  
  for (let offset = -range; offset <= range; offset += step) {
    const price = basePrice + offset;
    if (price <= 0) continue;
    const r = calculate({ ...inputs, sellAmdPerL: price });
    data.push({
      price,
      profit: Math.round(r.netProfitAmd),
      profitUsd: Math.round(r.netProfitAmd / r.rate),
    });
  }
  return data;
}

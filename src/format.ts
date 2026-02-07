const nf0 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf4 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

export const fmtAmd0 = (x: number) => `${nf0.format(x)} AMD`;
export const fmtUsd2 = (x: number) => `${nf2.format(x)} $`;
export const fmtNum2 = (x: number) => nf2.format(x);
export const fmtNum4 = (x: number) => nf4.format(x);
export const fmtPct = (x: number) => `${nf2.format(x * 100)}%`;
export const fmtAmdPerL = (x: number) => `${nf4.format(x)} AMD/л`;
export const fmtUsdPerL = (x: number) => `${nf4.format(x)} $/л`;

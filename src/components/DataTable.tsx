import { useState } from 'react';
import type { CalcResult, FuelType } from '../types';
import { fmtAmd0, fmtUsd2, fmtNum2, fmtNum4, fmtPct, fmtAmdPerL, fmtUsdPerL } from '../format';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DataTableProps {
  result: CalcResult;
  inputs: { sellAmdPerL: number; truckTons: number; fuelType: FuelType };
}

interface TableSection {
  title: string;
  key: string;
  rows: TableRow[];
}

interface TableRow {
  label: string;
  amd: string;
  usd: string;
  bold?: boolean;
  hidden?: boolean;
}

export function DataTable({ result, inputs }: DataTableProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const r = result;
  const toUsd = (amd: number) => amd / r.rate;

  const sections: TableSection[] = [
    {
      title: 'Входные данные',
      key: 'input',
      rows: [
        { label: 'Цена закупки ($/тонна)', amd: fmtAmd0(r.purchaseAmd), usd: fmtUsd2(toUsd(r.purchaseAmd)) },
        { label: 'Доставка ($/тонна)', amd: fmtAmd0(r.deliveryAmd), usd: fmtUsd2(toUsd(r.deliveryAmd)) },
        { label: 'Пошлина ($/тонна)', amd: fmtAmd0(r.customsDutyAmd), usd: fmtUsd2(toUsd(r.customsDutyAmd)) },
        { label: 'Цена продажи (AMD/литр)', amd: `${fmtNum2(inputs.sellAmdPerL)} AMD/л`, usd: `${fmtNum4(toUsd(inputs.sellAmdPerL))} $/л` },
        { label: 'Тоннаж машины (тонн)', amd: fmtNum2(inputs.truckTons), usd: '—' },
        { label: 'Курс доллара (AMD/$)', amd: fmtNum4(r.rate), usd: '—' },
        { label: 'Плотность (кг/л)', amd: fmtNum4(r.density), usd: '—' },
      ],
    },
    {
      title: 'Налоги и сборы',
      key: 'tax',
      rows: [
        { label: 'Тип топлива', amd: r.fuelName, usd: '—' },
        { label: 'Акциз (AMD/тонна)', amd: fmtAmd0(r.exciseAmd), usd: fmtUsd2(toUsd(r.exciseAmd)) },
        { label: 'Разница до минимального платежа', amd: fmtAmd0(r.gasDiffAmd), usd: fmtUsd2(toUsd(r.gasDiffAmd)), hidden: inputs.fuelType !== 'AI92' },
        { label: 'Экологический налог (2%)', amd: fmtAmd0(r.ecoAmd), usd: fmtUsd2(toUsd(r.ecoAmd)) },
        { label: 'Пошлина', amd: fmtAmd0(r.customsDutyAmd), usd: fmtUsd2(toUsd(r.customsDutyAmd)) },
      ],
    },
    {
      title: 'Расчёт на 1 тонну',
      key: 'perton',
      rows: [
        { label: 'База для НДС (закупка+доставка+акциз)', amd: fmtAmd0(r.vatBaseAmd), usd: fmtUsd2(toUsd(r.vatBaseAmd)) },
        { label: 'НДС 20%', amd: fmtAmd0(r.vatAmd), usd: fmtUsd2(toUsd(r.vatAmd)) },
        { label: 'Итого затрат на тонну', amd: fmtAmd0(r.totalCostTonAmd), usd: fmtUsd2(toUsd(r.totalCostTonAmd)), bold: true },
        { label: 'Литров в тонне', amd: fmtNum4(r.litersPerTon), usd: '—' },
        { label: 'Себестоимость 1л', amd: fmtAmdPerL(r.costPerLAmd), usd: fmtUsdPerL(toUsd(r.costPerLAmd)) },
        { label: 'Маржа на 1л', amd: fmtAmdPerL(r.marginPerLAmd), usd: fmtUsdPerL(toUsd(r.marginPerLAmd)) },
        { label: 'Маржа %', amd: fmtPct(r.marginPct), usd: '—' },
      ],
    },
    {
      title: 'Расчёт на 1 машину',
      key: 'pertruck',
      rows: [
        { label: 'Общий объём (л.)', amd: fmtNum4(r.totalLiters), usd: '—' },
        { label: 'НДС+Акциз+ЭН+Пошлина на весь объём', amd: fmtAmd0(r.taxBlockAmd), usd: fmtUsd2(toUsd(r.taxBlockAmd)) },
        { label: 'Себестоимость всего', amd: fmtAmd0(r.totalCostTruckAmd), usd: fmtUsd2(toUsd(r.totalCostTruckAmd)) },
        { label: 'Выручка (все литры)', amd: fmtAmd0(r.revenueTruckAmd), usd: fmtUsd2(toUsd(r.revenueTruckAmd)) },
      ],
    },
    {
      title: 'Доход / НДС / прибыль',
      key: 'profit',
      rows: [
        { label: 'Доход на 1 тонну', amd: fmtAmd0(r.incomeTonAmd), usd: fmtUsd2(toUsd(r.incomeTonAmd)) },
        { label: 'Доход на 1 машину', amd: fmtAmd0(r.incomeTruckAmd), usd: fmtUsd2(toUsd(r.incomeTruckAmd)) },
        { label: 'Переплаченный НДС на 1 литр', amd: fmtAmdPerL(r.overVatPerLAmd), usd: fmtUsdPerL(toUsd(r.overVatPerLAmd)) },
        { label: 'Переплаченный НДС на 1 тонну', amd: fmtAmd0(r.overVatPerTonAmd), usd: fmtUsd2(toUsd(r.overVatPerTonAmd)) },
        { label: 'Прибыль до налогов', amd: fmtAmd0(r.profitAfterVatAmd), usd: fmtUsd2(toUsd(r.profitAfterVatAmd)) },
        { label: 'Безубыточная цена продажи', amd: fmtAmdPerL(r.breakEvenPriceAmd), usd: fmtUsdPerL(toUsd(r.breakEvenPriceAmd)) },
        { label: 'Чистая прибыль (18% налог)', amd: fmtAmd0(r.netProfitAmd), usd: fmtUsd2(toUsd(r.netProfitAmd)), bold: true },
      ],
    },
  ];

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-line bg-black/15" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full border-collapse min-w-[680px] bg-transparent">
        <thead>
          <tr>
            <th className="text-left text-[11px] font-semibold text-muted bg-black/30 uppercase tracking-wide px-3 py-3 sticky top-0 z-[1]" style={{ width: '52%' }}>
              Показатель
            </th>
            <th className="text-left text-[11px] font-semibold text-muted bg-black/30 uppercase tracking-wide px-3 py-3 sticky top-0 z-[1]" style={{ width: '24%' }}>
              AMD
            </th>
            <th className="text-left text-[11px] font-semibold text-muted bg-black/30 uppercase tracking-wide px-3 py-3 sticky top-0 z-[1]" style={{ width: '24%' }}>
              USD
            </th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => {
            const isCollapsed = collapsedSections.has(section.key);
            return (
              <SectionBlock
                key={section.key}
                section={section}
                isCollapsed={isCollapsed}
                onToggle={() => toggleSection(section.key)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SectionBlock({ section, isCollapsed, onToggle }: {
  section: TableSection;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer select-none group"
        onClick={onToggle}
      >
        <td
          colSpan={3}
          className="bg-gradient-to-r from-sky/8 to-transparent text-sky font-semibold text-xs uppercase tracking-wide px-3 py-3 border-b border-line"
        >
          <span className="flex items-center gap-2">
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            {section.title}
          </span>
        </td>
      </tr>
      {!isCollapsed && section.rows.filter(r => !r.hidden).map((row, i) => (
        <tr key={i} className="hover:bg-white/[0.02] transition-colors duration-150">
          <td className={`px-3 py-3 text-[13px] border-b border-line ${row.bold ? 'font-bold text-text' : 'text-text/80'}`}>
            {row.label}
          </td>
          <td className={`px-3 py-3 text-[13px] border-b border-line font-mono whitespace-nowrap ${row.bold ? 'font-bold text-accent' : 'font-medium'}`}>
            {row.amd}
          </td>
          <td className={`px-3 py-3 text-[13px] border-b border-line font-mono whitespace-nowrap ${row.bold ? 'font-bold text-accent' : 'font-medium'}`}>
            {row.usd}
          </td>
        </tr>
      ))}
    </>
  );
}

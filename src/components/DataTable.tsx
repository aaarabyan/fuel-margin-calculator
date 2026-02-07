import { useState } from 'react';
import type { CalcResult, FuelType } from '../types';
import { fmtAmd0, fmtUsd2, fmtNum2, fmtNum4, fmtPct, fmtAmdPerL, fmtUsdPerL } from '../format';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, Truck, Calculator, Receipt } from 'lucide-react';

interface DataTableProps {
  result: CalcResult;
  inputs: { sellAmdPerL: number; truckTons: number; fuelType: FuelType };
}

interface DataItem {
  label: string;
  value: string;
  subValue?: string;
  highlight?: 'positive' | 'negative' | 'neutral';
  hidden?: boolean;
}

interface DataSection {
  title: string;
  key: string;
  icon: React.ReactNode;
  items: DataItem[];
}

export function DataTable({ result, inputs }: DataTableProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profit', 'perton']));
  const r = result;
  const toUsd = (amd: number) => amd / r.rate;

  const sections: DataSection[] = [
    {
      title: 'Ключевые показатели',
      key: 'profit',
      icon: <TrendingUp size={16} />,
      items: [
        {
          label: 'Чистая прибыль',
          value: fmtAmd0(r.netProfitAmd),
          subValue: `≈ ${fmtUsd2(toUsd(r.netProfitAmd))}`,
          highlight: r.netProfitAmd >= 0 ? 'positive' : 'negative'
        },
        {
          label: 'Маржа на литр',
          value: fmtAmdPerL(r.marginPerLAmd),
          subValue: fmtPct(r.marginPct),
          highlight: r.marginPerLAmd >= 0 ? 'positive' : 'negative'
        },
        {
          label: 'Себестоимость литра',
          value: fmtAmdPerL(r.costPerLAmd),
          subValue: `≈ ${fmtUsdPerL(toUsd(r.costPerLAmd))}`
        },
        {
          label: 'Безубыточная цена',
          value: fmtAmdPerL(r.breakEvenPriceAmd),
          subValue: `≈ ${fmtUsdPerL(toUsd(r.breakEvenPriceAmd))}`
        },
        {
          label: 'Доход на машину',
          value: fmtAmd0(r.incomeTruckAmd),
          subValue: `≈ ${fmtUsd2(toUsd(r.incomeTruckAmd))}`
        },
      ],
    },
    {
      title: 'Расчёт на тонну',
      key: 'perton',
      icon: <Calculator size={16} />,
      items: [
        { label: 'Литров в тонне', value: fmtNum2(r.litersPerTon) },
        { label: 'База для НДС', value: fmtAmd0(r.vatBaseAmd), subValue: `≈ ${fmtUsd2(toUsd(r.vatBaseAmd))}` },
        { label: 'НДС 20%', value: fmtAmd0(r.vatAmd), subValue: `≈ ${fmtUsd2(toUsd(r.vatAmd))}` },
        { label: 'Итого затрат', value: fmtAmd0(r.totalCostTonAmd), subValue: `≈ ${fmtUsd2(toUsd(r.totalCostTonAmd))}`, highlight: 'neutral' },
        { label: 'Доход на тонну', value: fmtAmd0(r.incomeTonAmd), subValue: `≈ ${fmtUsd2(toUsd(r.incomeTonAmd))}` },
      ],
    },
    {
      title: 'Расчёт на машину',
      key: 'pertruck',
      icon: <Truck size={16} />,
      items: [
        { label: 'Объём (литров)', value: fmtNum2(r.totalLiters) },
        { label: 'Налоги всего', value: fmtAmd0(r.taxBlockAmd), subValue: `≈ ${fmtUsd2(toUsd(r.taxBlockAmd))}` },
        { label: 'Себестоимость', value: fmtAmd0(r.totalCostTruckAmd), subValue: `≈ ${fmtUsd2(toUsd(r.totalCostTruckAmd))}` },
        { label: 'Выручка', value: fmtAmd0(r.revenueTruckAmd), subValue: `≈ ${fmtUsd2(toUsd(r.revenueTruckAmd))}` },
      ],
    },
    {
      title: 'Налоги и сборы',
      key: 'tax',
      icon: <Receipt size={16} />,
      items: [
        { label: 'Тип топлива', value: r.fuelName },
        { label: 'Акциз', value: fmtAmd0(r.exciseAmd), subValue: `≈ ${fmtUsd2(toUsd(r.exciseAmd))}` },
        { label: 'Разница до мин. платежа', value: fmtAmd0(r.gasDiffAmd), subValue: `≈ ${fmtUsd2(toUsd(r.gasDiffAmd))}`, hidden: inputs.fuelType !== 'AI92' },
        { label: 'Экологический (2%)', value: fmtAmd0(r.ecoAmd), subValue: `≈ ${fmtUsd2(toUsd(r.ecoAmd))}` },
        { label: 'Пошлина', value: fmtAmd0(r.customsDutyAmd), subValue: `≈ ${fmtUsd2(toUsd(r.customsDutyAmd))}` },
        { label: 'Переплата НДС/л', value: fmtAmdPerL(r.overVatPerLAmd), subValue: `≈ ${fmtUsdPerL(toUsd(r.overVatPerLAmd))}` },
      ],
    },
    {
      title: 'Входные данные',
      key: 'input',
      icon: <DollarSign size={16} />,
      items: [
        { label: 'Закупка', value: fmtAmd0(r.purchaseAmd), subValue: `≈ ${fmtUsd2(toUsd(r.purchaseAmd))}` },
        { label: 'Доставка', value: fmtAmd0(r.deliveryAmd), subValue: `≈ ${fmtUsd2(toUsd(r.deliveryAmd))}` },
        { label: 'Пошлина (вход)', value: fmtAmd0(r.customsDutyAmd), subValue: `≈ ${fmtUsd2(toUsd(r.customsDutyAmd))}` },
        { label: 'Цена продажи', value: `${fmtNum2(inputs.sellAmdPerL)} AMD/л` },
        { label: 'Тоннаж', value: `${fmtNum2(inputs.truckTons)} т` },
        { label: 'Курс USD', value: `${fmtNum2(r.rate)} AMD/$` },
        { label: 'Плотность', value: `${fmtNum4(r.density)} кг/л` },
      ],
    },
  ];

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
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
    <div className="space-y-3">
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.key);
        const visibleItems = section.items.filter(item => !item.hidden);

        return (
          <div
            key={section.key}
            className="bg-black/20 rounded-2xl border border-line overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky/10 flex items-center justify-center text-sky">
                  {section.icon}
                </div>
                <span className="font-semibold text-sm text-text">{section.title}</span>
                <span className="text-xs text-muted/60 bg-white/5 px-2 py-0.5 rounded-full">
                  {visibleItems.length}
                </span>
              </div>
              <div className="text-muted">
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="px-4 pb-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {visibleItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-xl ${item.highlight === 'positive' ? 'bg-accent/10 border border-accent/20' :
                          item.highlight === 'negative' ? 'bg-danger/10 border border-danger/20' :
                            item.highlight === 'neutral' ? 'bg-sky/10 border border-sky/20' :
                              'bg-white/[0.03]'
                        }`}
                    >
                      <span className="text-xs text-muted truncate mr-2">{item.label}</span>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-semibold font-mono ${item.highlight === 'positive' ? 'text-accent' :
                            item.highlight === 'negative' ? 'text-danger' :
                              item.highlight === 'neutral' ? 'text-sky' :
                                'text-text'
                          }`}>
                          {item.value}
                        </div>
                        {item.subValue && (
                          <div className="text-[10px] text-muted/60 font-mono">
                            {item.subValue}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

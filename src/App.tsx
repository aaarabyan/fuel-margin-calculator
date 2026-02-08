import { useMemo, useCallback, useEffect, useState } from 'react';
import type { Inputs, FuelType, Scenario } from './types';
import { FUELS, DEFAULT_INPUTS } from './constants';
import { calculate } from './calc';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useExchangeRate } from './hooks/useExchangeRate';
import { FuelTabs } from './components/FuelTabs';
import { InputField } from './components/InputField';
import { ProfitSummary } from './components/ProfitSummary';
import { DataTable } from './components/DataTable';
import { SensitivityChart } from './components/SensitivityChart';
import { CostBreakdownChart } from './components/CostBreakdownChart';
import { ScenarioManager } from './components/ScenarioManager';
import { ExportButton } from './components/ExportButton';
import { SwipeSection } from './components/SwipeSection';
import { Copy, Check, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { fmtAmd0, fmtUsd2, fmtAmdPerL, fmtPct } from './format';

export function App() {
  const [inputs, setInputs] = useLocalStorage<Inputs>('fuel-calc-inputs', DEFAULT_INPUTS);
  const [scenarios, setScenarios] = useLocalStorage<Scenario[]>('fuel-calc-scenarios', []);
  const [copied, setCopied] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showTable, setShowTable] = useState(true);

  // Exchange rate hook
  const { rate: fetchedRate, loading: rateLoading, lastUpdated: rateDate, refetch: refetchRate } = useExchangeRate();

  const result = useMemo(() => calculate(inputs), [inputs]);

  const updateField = useCallback(<K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs(prev => {
      const next = { ...prev, [key]: value };

      // Bidirectional sync: tons <-> liters
      const density = Math.max(0.0000001, key === 'density' ? (value as number) : next.density);
      const litersPerTon = 1000 / density;

      if (key === 'truckTons') {
        next.truckLiters = Math.round((value as number) * litersPerTon);
      } else if (key === 'truckLiters') {
        next.truckTons = Number(((value as number) / litersPerTon).toFixed(2));
      } else if (key === 'density') {
        next.truckLiters = Math.round(next.truckTons * litersPerTon);
      }

      return next;
    });
  }, [setInputs]);

  const handleFuelChange = useCallback((fuel: FuelType) => {
    setInputs(prev => {
      const f = FUELS[fuel];
      const litersPerTon = 1000 / f.density;
      return {
        ...prev,
        fuelType: fuel,
        density: f.density,
        truckLiters: Math.round(prev.truckTons * litersPerTon),
      };
    });
  }, [setInputs]);

  const handleSaveScenario = useCallback((name: string, inp: Inputs) => {
    const res = calculate(inp);
    const scenario: Scenario = {
      id: Date.now().toString(),
      name,
      inputs: inp,
      result: res,
      timestamp: Date.now(),
    };
    setScenarios(prev => [scenario, ...prev].slice(0, 10));
  }, [setScenarios]);

  const handleDeleteScenario = useCallback((id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  }, [setScenarios]);

  const handleLoadScenario = useCallback((inp: Inputs) => {
    setInputs(inp);
  }, [setInputs]);

  const handleCopyResults = useCallback(() => {
    const toUsd = (amd: number) => amd / result.rate;
    const text = [
      `⛽ ${result.fuelName}`,
      `Чистая прибыль: ${fmtAmd0(result.netProfitAmd)} (≈ ${fmtUsd2(toUsd(result.netProfitAmd))})`,
      `Маржа на литр: ${fmtAmdPerL(result.marginPerLAmd)} (${fmtPct(result.marginPct)})`,
      `Себестоимость: ${fmtAmdPerL(result.costPerLAmd)}`,
      `Безубыточность: ${fmtAmdPerL(result.breakEvenPriceAmd)}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  // Initialize density from fuel type on first load
  useEffect(() => {
    if (!inputs.density) {
      updateField('density', FUELS[inputs.fuelType].density);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen">
      {/* Mobile sticky header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-[1000] bg-bg shadow-[0_4px_20px_rgba(0,0,0,0.5)]" style={{ paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))' }}>
        <div className="px-2.5 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-accent to-sky rounded-lg flex items-center justify-center text-sm">
                ⛽
              </div>
              <h1 className="text-sm font-bold bg-gradient-to-r from-text to-muted bg-clip-text text-transparent">
                Калькулятор маржинальности
              </h1>
            </div>
            <ExportButton result={result} inputs={inputs} />
          </div>
          <div className="bg-card backdrop-blur-xl border border-card-border rounded-xl p-2.5">
            <ProfitSummary result={result} compact />
            <div className="w-full h-1 bg-white/10 rounded-sm mt-2 overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-400 ${result.netProfitAmd >= 0
                  ? 'bg-gradient-to-r from-accent to-emerald-400'
                  : 'bg-gradient-to-r from-danger to-red-400'
                  }`}
                style={{
                  width: `${result.netProfitAmd >= 0
                    ? Math.min(100, 50 + result.netProfitAmd / 10000)
                    : Math.max(5, 50 + result.netProfitAmd / 10000)
                    }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 sm:pt-6 pb-12" style={{ paddingTop: 'calc(140px + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(48px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Desktop header */}
        <div className="hidden sm:flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-sky rounded-xl flex items-center justify-center text-xl shadow-lg">
              ⛽
            </div>
            <h1 className="text-[22px] font-bold bg-gradient-to-r from-text to-muted bg-clip-text text-transparent">
              Калькулятор маржинальности топлива
            </h1>
          </div>
          <button
            onClick={handleCopyResults}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-line text-muted text-xs font-medium cursor-pointer hover:bg-white/10 hover:border-sky/20 transition-all duration-200"
          >
            {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
        </div>

        {/* Inputs + Summary row */}
        <div className="flex gap-4 flex-wrap">
          {/* Input card */}
          <div className="flex-[1_1_560px] bg-card backdrop-blur-xl border border-card-border rounded-[20px] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:border-sky/25 transition-border-color duration-300">
            <FuelTabs current={inputs.fuelType} onChange={handleFuelChange} />

            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 sm:gap-4 mt-4">
              <InputField
                label="Цена закупки ($/тонна)"
                value={inputs.purchaseUsd}
                onChange={(v) => updateField('purchaseUsd', v)}
                tooltip="Цена закупки топлива у поставщика в долларах за тонну"
                suffix="$/т"
              />
              <InputField
                label="Доставка ($/тонна)"
                value={inputs.deliveryUsd}
                onChange={(v) => updateField('deliveryUsd', v)}
                tooltip="Стоимость доставки топлива за тонну"
                suffix="$/т"
              />
              <InputField
                label="Пошлина ($/тонна)"
                value={inputs.customsDutyUsd}
                onChange={(v) => updateField('customsDutyUsd', v)}
                tooltip="Таможенная пошлина за тонну"
                suffix="$/т"
              />
              <InputField
                label="Цена продажи (AMD/литр)"
                value={inputs.sellAmdPerL}
                onChange={(v) => updateField('sellAmdPerL', v)}
                tooltip="Розничная цена продажи за литр в армянских драмах"
                suffix="AMD/л"
              />
              <InputField
                label="Тоннаж машины (тонн)"
                value={inputs.truckTons}
                onChange={(v) => updateField('truckTons', v)}
                tooltip="Грузоподъёмность бензовоза"
                suffix="т"
              />
              <InputField
                label="Литраж машины (литров)"
                value={inputs.truckLiters}
                onChange={(v) => updateField('truckLiters', v)}
                step="1"
                tooltip="Объём бензовоза в литрах (рассчитывается из тоннажа и плотности)"
                suffix="л"
              />
              <div className="relative">
                <InputField
                  label="Курс доллара (AMD/$)"
                  value={inputs.usdRate}
                  onChange={(v) => updateField('usdRate', v)}
                  step="0.0001"
                  tooltip={`Курс ЦБ Армении${rateDate ? ` от ${rateDate}` : ''}`}
                  suffix="AMD/$"
                />
                <button
                  onClick={async () => {
                    await refetchRate();
                    if (fetchedRate) updateField('usdRate', fetchedRate);
                  }}
                  disabled={rateLoading}
                  className="absolute right-12 top-6 p-1.5 rounded-lg bg-sky/20 hover:bg-sky/30 text-sky transition-colors disabled:opacity-50"
                  title="Обновить курс ЦБ Армении"
                >
                  <RefreshCw size={14} className={rateLoading ? 'animate-spin' : ''} />
                </button>
              </div>
              <InputField
                label="Плотность (кг/л)"
                value={inputs.density}
                onChange={(v) => updateField('density', v)}
                step="0.0001"
                tooltip="Плотность топлива. Дизель ~0.845, Бензин ~0.745"
                suffix="кг/л"
              />
            </div>
          </div>

          {/* Summary card — hidden on mobile (shown in sticky header) */}
          <div className="hidden sm:block flex-[1_1_320px] bg-card backdrop-blur-xl border border-card-border rounded-[20px] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:border-sky/25 transition-border-color duration-300">
            <ProfitSummary result={result} />
          </div>
        </div>

        {/* Analytics section */}
        <div className="mt-4">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-card-border text-muted text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/5 hover:border-sky/20 transition-all duration-200 mb-4 w-full sm:w-auto justify-center sm:justify-start"
          >
            {showAnalytics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Аналитика и сценарии
          </button>

          {showAnalytics && (
            <SwipeSection labels={['Чувствительность', 'Структура', 'Сценарии']}>
              {/* Sensitivity chart */}
              <div className="bg-card backdrop-blur-xl border border-card-border rounded-[20px] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                <SensitivityChart inputs={inputs} />
              </div>

              {/* Cost breakdown */}
              <div className="bg-card backdrop-blur-xl border border-card-border rounded-[20px] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                <CostBreakdownChart result={result} />
              </div>

              {/* Scenario manager */}
              <div className="bg-card backdrop-blur-xl border border-card-border rounded-[20px] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                <ScenarioManager
                  scenarios={scenarios}
                  onSave={handleSaveScenario}
                  onDelete={handleDeleteScenario}
                  onLoad={handleLoadScenario}
                  currentInputs={inputs}
                />
              </div>
            </SwipeSection>
          )}
        </div>

        {/* Data table */}
        <div className="mt-4">
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-card-border text-muted text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/5 hover:border-sky/20 transition-all duration-200 mb-4 w-full sm:w-auto justify-center sm:justify-start"
          >
            {showTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Подробная таблица
          </button>

          {showTable && (
            <div className="bg-card backdrop-blur-xl border border-card-border rounded-[20px] p-3 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.2)] animate-fade-in">
              <DataTable result={result} inputs={inputs} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

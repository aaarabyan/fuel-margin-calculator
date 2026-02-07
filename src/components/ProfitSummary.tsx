import type { CalcResult } from '../types';
import { fmtAmd0, fmtUsd2, fmtNum4, fmtAmdPerL, fmtPct } from '../format';
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';

interface ProfitSummaryProps {
  result: CalcResult;
  compact?: boolean;
}

export function ProfitSummary({ result, compact = false }: ProfitSummaryProps) {
  const isPositive = result.netProfitAmd >= 0;
  const barWidth = isPositive
    ? Math.min(100, 50 + result.netProfitAmd / 10000)
    : Math.max(5, 50 + result.netProfitAmd / 10000);

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <span className={`text-xl font-bold ${isPositive ? 'text-accent' : 'text-danger'}`}>
          {fmtAmd0(result.netProfitAmd)}
        </span>
        <span className="text-xs text-muted">
          ≈ {fmtUsd2(result.netProfitAmd / result.rate)}
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky/10 border border-sky/20 rounded-full text-[10px] text-sky">
          ⛽ {result.fuelName}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">
        Чистая прибыль на машину
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
        <div className="flex items-center gap-2 mb-1">
          {isPositive ? (
            <TrendingUp size={20} className="text-accent" />
          ) : (
            <TrendingDown size={20} className="text-danger" />
          )}
          <p className={`text-3xl font-extrabold m-0 transition-colors duration-300 ${
            isPositive ? 'text-accent drop-shadow-[0_0_30px_rgba(34,197,94,0.25)]' : 'text-danger drop-shadow-[0_0_30px_rgba(239,68,68,0.25)]'
          }`}>
            {fmtAmd0(result.netProfitAmd)}
          </p>
        </div>
        <p className="text-sm text-muted mt-1">
          ≈ {fmtUsd2(result.netProfitAmd / result.rate)}
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky/10 border border-sky/20 rounded-full text-xs text-sky mt-4">
          <span>⛽</span>
          <span>{result.fuelName} • {fmtNum4(result.density)} кг/л</span>
        </div>

        {/* Profit bar */}
        <div className="w-full h-1 bg-white/10 rounded-sm mt-5 overflow-hidden">
          <div
            className={`h-full rounded-sm transition-all duration-400 ${
              isPositive
                ? 'bg-gradient-to-r from-accent to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.25)]'
                : 'bg-gradient-to-r from-danger to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
            }`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-line">
        <QuickStat
          icon={<Target size={12} />}
          label="Безубыточность"
          value={`${fmtNum4(result.breakEvenPriceAmd)} AMD/л`}
          color="text-sky"
        />
        <QuickStat
          icon={result.marginPerLAmd >= 0 ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
          label="Маржа на литр"
          value={fmtAmdPerL(result.marginPerLAmd)}
          color={result.marginPerLAmd >= 0 ? 'text-accent' : 'text-danger'}
        />
        <QuickStat
          label="Маржа %"
          value={fmtPct(result.marginPct)}
          color={result.marginPct >= 0 ? 'text-accent' : 'text-danger'}
        />
        <QuickStat
          label="Себестоимость"
          value={fmtAmdPerL(result.costPerLAmd)}
          color="text-amber"
        />
      </div>
    </div>
  );
}

function QuickStat({ icon, label, value, color }: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-black/20 rounded-lg p-2.5">
      <div className="flex items-center gap-1 mb-1">
        {icon && <span className={color}>{icon}</span>}
        <span className="text-[9px] text-muted uppercase tracking-wide">{label}</span>
      </div>
      <span className={`text-xs font-semibold ${color}`}>{value}</span>
    </div>
  );
}

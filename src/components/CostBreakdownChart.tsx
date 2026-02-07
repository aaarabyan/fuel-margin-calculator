import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CalcResult } from '../types';

interface CostBreakdownChartProps {
  result: CalcResult;
}

const COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4'];

export function CostBreakdownChart({ result }: CostBreakdownChartProps) {
  const data = useMemo(() => {
    const r = result;
    return [
      { name: 'Закупка', value: Math.max(0, r.purchaseAmd) },
      { name: 'Доставка', value: Math.max(0, r.deliveryAmd) },
      { name: 'Акциз', value: Math.max(0, r.exciseAmd) },
      { name: 'НДС', value: Math.max(0, r.vatAmd) },
      { name: 'Экологический', value: Math.max(0, r.ecoAmd) },
      { name: 'Пошлина', value: Math.max(0, r.customsDutyAmd) },
    ].filter(d => d.value > 0);
  }, [result]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">
        Структура затрат на тонну
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '11px',
                  padding: '8px 12px',
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [
                  `${new Intl.NumberFormat('ru-RU').format(Math.round(value as number))} AMD (${(((value as number) / total) * 100).toFixed(1)}%)`,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-muted truncate">{item.name}</span>
              <span className="text-text/80 font-medium ml-auto tabular-nums whitespace-nowrap">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

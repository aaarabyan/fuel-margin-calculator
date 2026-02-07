import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { Inputs } from '../types';
import { generateSensitivityData } from '../calc';

interface SensitivityChartProps {
  inputs: Inputs;
}

export function SensitivityChart({ inputs }: SensitivityChartProps) {
  const data = useMemo(() => generateSensitivityData(inputs), [inputs]);

  const currentPrice = inputs.sellAmdPerL;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider">
          Анализ чувствительности — цена продажи vs прибыль
        </h3>
      </div>
      <div className="h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="profitGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profitRed" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="price"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(148,163,184,0.12)' }}
              label={{ value: 'AMD/л', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(56,189,248,0.2)',
                borderRadius: '12px',
                color: '#f1f5f9',
                fontSize: '12px',
                padding: '10px 14px',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [
                `${new Intl.NumberFormat('ru-RU').format(value as number)} AMD`,
                'Прибыль'
              ]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) => `Цена: ${label} AMD/л`}
            />
            <ReferenceLine y={0} stroke="rgba(148,163,184,0.3)" strokeDasharray="3 3" />
            <ReferenceLine
              x={currentPrice}
              stroke="#38bdf8"
              strokeDasharray="4 4"
              label={{
                value: `${currentPrice}`,
                position: 'top',
                fill: '#38bdf8',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#profitGreen)"
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e', stroke: '#0a0f1a', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

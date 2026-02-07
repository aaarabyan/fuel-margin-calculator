import { useState } from 'react';
import type { Scenario, Inputs } from '../types';
import { fmtAmd0, fmtUsd2, fmtAmdPerL, fmtPct } from '../format';
import { Plus, Trash2, RotateCcw, Copy } from 'lucide-react';

interface ScenarioManagerProps {
  scenarios: Scenario[];
  onSave: (name: string, inputs: Inputs) => void;
  onDelete: (id: string) => void;
  onLoad: (inputs: Inputs) => void;
  currentInputs: Inputs;
}

export function ScenarioManager({
  scenarios,
  onSave,
  onDelete,
  onLoad,
  currentInputs,
}: ScenarioManagerProps) {
  const [name, setName] = useState('');

  const handleSave = () => {
    const scenarioName = name.trim() || `Сценарий ${scenarios.length + 1}`;
    onSave(scenarioName, currentInputs);
    setName('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider">
          Сохранённые сценарии
        </h3>
        <span className="text-[10px] text-muted/60">{scenarios.length}/10</span>
      </div>

      {/* Save new */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Название сценария..."
          className="flex-1 py-2.5 px-3 rounded-lg border border-line bg-input-bg text-text text-sm outline-none placeholder:text-muted/40 focus:border-accent focus:shadow-[0_0_0_2px_rgba(34,197,94,0.1)] transition-all duration-200"
        />
        <button
          onClick={handleSave}
          disabled={scenarios.length >= 10}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-accent/15 border border-accent/30 text-accent text-xs font-semibold cursor-pointer hover:bg-accent/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Сохранить</span>
        </button>
      </div>

      {/* List */}
      {scenarios.length === 0 ? (
        <div className="text-center py-6 text-muted/40 text-xs">
          Нет сохранённых сценариев.<br />Сохраните текущие параметры для сравнения.
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {scenarios.map((s) => {
            const isPositive = s.result.netProfitAmd >= 0;
            return (
              <div
                key={s.id}
                className="bg-black/20 border border-line rounded-xl p-3 hover:border-sky/20 transition-all duration-200 animate-fade-in"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text truncate">{s.name}</div>
                    <div className="text-[10px] text-muted/50 mt-0.5">
                      {new Date(s.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => onLoad(s.inputs)}
                      title="Загрузить"
                      className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-sky transition-colors duration-150 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      onClick={() => {
                        const text = `${s.name}: ${fmtAmd0(s.result.netProfitAmd)} (${fmtUsd2(s.result.netProfitAmd / s.result.rate)})`;
                        navigator.clipboard.writeText(text);
                      }}
                      title="Копировать"
                      className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-accent transition-colors duration-150 cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      title="Удалить"
                      className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-danger transition-colors duration-150 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-sm font-bold ${isPositive ? 'text-accent' : 'text-danger'}`}>
                    {fmtAmd0(s.result.netProfitAmd)}
                  </span>
                  <span className="text-[10px] text-muted">
                    ≈ {fmtUsd2(s.result.netProfitAmd / s.result.rate)}
                  </span>
                  <span className="text-[10px] text-muted/60">
                    маржа {fmtAmdPerL(s.result.marginPerLAmd)} ({fmtPct(s.result.marginPct)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

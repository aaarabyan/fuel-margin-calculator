import { useState, useRef } from 'react';
import { Info } from 'lucide-react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  tooltip?: string;
  suffix?: string;
}

export function InputField({ label, value, onChange, step = '0.01', tooltip, suffix }: InputFieldProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleTooltipEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowTooltip(true);
  };

  const handleTooltipLeave = () => {
    timeoutRef.current = setTimeout(() => setShowTooltip(false), 200);
  };

  return (
    <div className="flex flex-col relative">
      <div className="flex items-center gap-1 mb-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wide leading-tight">
          {label}
        </label>
        {tooltip && (
          <div className="relative"
            onMouseEnter={handleTooltipEnter}
            onMouseLeave={handleTooltipLeave}
            onTouchStart={handleTooltipEnter}
          >
            <Info size={12} className="text-muted/50 cursor-help" />
            {showTooltip && (
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1e293b] border border-card-border rounded-lg text-xs text-text w-48 shadow-xl animate-fade-in">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1e293b]" />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full py-4 px-4 rounded-xl border border-line bg-input-bg text-text outline-none text-lg font-semibold font-[inherit] transition-all duration-200 hover:border-sky/30 focus:border-accent focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)] min-h-[52px]"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted/60 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

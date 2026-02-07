import { useState, useRef, useEffect } from 'react';
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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTooltipToggle = () => {
    clearTimeout(timeoutRef.current);
    setShowTooltip(!showTooltip);
  };

  const handleTooltipLeave = () => {
    timeoutRef.current = setTimeout(() => setShowTooltip(false), 200);
  };

  // Закрыть тултип при клике вне
  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (e: TouchEvent | MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  // Корректировка позиции тултипа чтобы не вылезал за экран
  useEffect(() => {
    if (showTooltip && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();

      // Если вылезает слева
      if (rect.left < 8) {
        tooltip.style.left = '0';
        tooltip.style.transform = 'translateX(0)';
      }
      // Если вылезает справа
      else if (rect.right > window.innerWidth - 8) {
        tooltip.style.left = 'auto';
        tooltip.style.right = '0';
        tooltip.style.transform = 'translateX(0)';
      }
    }
  }, [showTooltip]);

  return (
    <div className="flex flex-col relative" ref={containerRef}>
      <div className="flex items-start gap-1 mb-1.5">
        <label className="text-[10px] sm:text-xs font-medium text-muted uppercase tracking-wide leading-tight flex-1 min-w-0">
          {label}
        </label>
        {tooltip && (
          <div className="relative flex-shrink-0"
            onMouseEnter={() => { clearTimeout(timeoutRef.current); setShowTooltip(true); }}
            onMouseLeave={handleTooltipLeave}
            onClick={handleTooltipToggle}
          >
            <Info size={14} className="text-muted/50 cursor-help" />
            {showTooltip && (
              <div
                ref={tooltipRef}
                className="fixed z-[100] px-3 py-2.5 bg-[#1a2332] border border-sky/30 rounded-xl text-xs text-text shadow-2xl animate-fade-in"
                style={{
                  width: 'min(280px, calc(100vw - 32px))',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: 'auto',
                  bottom: 'auto',
                  marginTop: '8px',
                }}
              >
                <div className="leading-relaxed">{tooltip}</div>
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
          className="w-full py-3 px-3 rounded-xl border border-line bg-input-bg text-text outline-none text-base font-semibold font-[inherit] transition-all duration-200 hover:border-sky/30 focus:border-accent focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)] min-h-[48px]"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted/60 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

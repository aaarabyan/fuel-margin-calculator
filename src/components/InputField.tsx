import { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTooltipToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  // Закрыть тултип при клике вне
  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (e: TouchEvent | MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };

    // Небольшая задержка чтобы не закрылся сразу
    const timer = setTimeout(() => {
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <div className="flex flex-col relative" ref={containerRef}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-[10px] font-medium text-muted uppercase tracking-wide leading-tight truncate">
          {label}
        </label>
        {tooltip && (
          <button
            type="button"
            onClick={handleTooltipToggle}
            onTouchEnd={handleTooltipToggle}
            className="flex-shrink-0 touch-manipulation"
          >
            <Info size={13} className="text-muted/50" />
          </button>
        )}
      </div>

      {/* Tooltip - появляется под лейблом, на всю ширину поля */}
      {showTooltip && tooltip && (
        <div className="absolute left-0 right-0 top-6 z-[100] animate-fade-in">
          <div className="bg-[#1a2332] border border-sky/30 rounded-xl p-3 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-text leading-relaxed flex-1">{tooltip}</p>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-muted/50 hover:text-text flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

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
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted/60 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

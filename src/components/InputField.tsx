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
  // Внутреннее строковое состояние для правильной обработки ввода
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Синхронизация с внешним value когда поле не в фокусе
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleTooltipToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Если значение пустое, не вызываем onChange (оставляем поле пустым визуально)
    if (newValue === '' || newValue === '-') {
      return;
    }
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // При потере фокуса, если поле пустое, устанавливаем 0
    if (inputValue === '' || inputValue === '-') {
      setInputValue('0');
      onChange(0);
    } else {
      // Нормализуем значение (убираем лишние нули)
      const numValue = parseFloat(inputValue) || 0;
      setInputValue(numValue.toString());
      onChange(numValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // При фокусе, если значение 0, очищаем поле для удобства ввода
    if (inputValue === '0') {
      setInputValue('');
    }
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
          type="text"
          inputMode="decimal"
          step={step}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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

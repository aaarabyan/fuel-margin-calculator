import type { FuelType } from '../types';
import { Fuel, Droplets } from 'lucide-react';

interface FuelTabsProps {
  current: FuelType;
  onChange: (fuel: FuelType) => void;
}

const tabs: { key: FuelType; label: string; icon: typeof Fuel }[] = [
  { key: 'DT', label: 'Дизель', icon: Droplets },
  { key: 'AI92', label: 'АИ‑92/95', icon: Fuel },
];

export function FuelTabs({ current, onChange }: FuelTabsProps) {
  return (
    <div className="flex gap-1.5 p-1 bg-black/20 rounded-[14px] w-fit">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-[10px] border-none font-semibold text-sm font-[inherit] transition-all duration-200 cursor-pointer ${
            current === key
              ? 'bg-gradient-to-br from-accent/20 to-sky/15 text-text shadow-[0_0_20px_rgba(34,197,94,0.15)]'
              : 'bg-transparent text-muted hover:text-text hover:bg-white/5'
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

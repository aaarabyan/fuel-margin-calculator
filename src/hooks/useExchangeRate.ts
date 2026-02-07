import { useState, useCallback } from 'react';

interface ExchangeRateResult {
    rate: number | null;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
    refetch: () => Promise<void>;
}

const CACHE_KEY = 'cb_exchange_rate';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CachedRate {
    rate: number;
    timestamp: number;
    date: string;
}

export function useExchangeRate(): ExchangeRateResult {
    const [rate, setRate] = useState<number | null>(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed: CachedRate = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < CACHE_TTL) {
                    return parsed.rate;
                }
            }
        } catch { }
        return null;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed: CachedRate = JSON.parse(cached);
                return parsed.date;
            }
        } catch { }
        return null;
    });

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Try CB Armenia API directly
            const response = await fetch('https://cb.am/latest.json.php?currency=USD', {
                mode: 'cors',
                cache: 'no-cache',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch');
            }

            const data = await response.json();
            // CB API returns { USD: "384.00", date: "2026-02-08" } format
            const usdRate = parseFloat(data.USD || data.rate || data.value);

            if (isNaN(usdRate)) {
                throw new Error('Invalid rate format');
            }

            const dateStr = data.date || new Date().toLocaleDateString('ru-RU');

            // Cache the result
            const cacheData: CachedRate = {
                rate: usdRate,
                timestamp: Date.now(),
                date: dateStr,
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

            setRate(usdRate);
            setLastUpdated(dateStr);
        } catch (err) {
            // Fallback: try alternative API
            try {
                const altResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (altResponse.ok) {
                    const altData = await altResponse.json();
                    const amdRate = altData.rates?.AMD;
                    if (amdRate) {
                        const dateStr = new Date().toLocaleDateString('ru-RU');
                        const cacheData: CachedRate = {
                            rate: amdRate,
                            timestamp: Date.now(),
                            date: dateStr,
                        };
                        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                        setRate(amdRate);
                        setLastUpdated(dateStr);
                        return;
                    }
                }
            } catch { }

            setError('Не удалось загрузить курс. Введите вручную.');
        } finally {
            setLoading(false);
        }
    }, []);

    return { rate, loading, error, lastUpdated, refetch };
}

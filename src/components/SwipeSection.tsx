import { useRef, useState, useEffect, ReactNode } from 'react';

interface SwipeSectionProps {
    children: ReactNode[];
    labels?: string[];
}

export function SwipeSection({ children, labels }: SwipeSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const childWidth = container.offsetWidth;
            const newIndex = Math.round(scrollLeft / childWidth);
            setActiveIndex(Math.min(newIndex, children.length - 1));
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [children.length]);

    const scrollTo = (index: number) => {
        const container = containerRef.current;
        if (!container) return;
        const childWidth = container.offsetWidth;
        container.scrollTo({ left: childWidth * index, behavior: 'smooth' });
    };

    // На десктопе показываем все секции вертикально
    if (!isMobile) {
        return (
            <div className="space-y-4">
                {children.map((child, i) => (
                    <div key={i}>{child}</div>
                ))}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Tabs */}
            {labels && labels.length > 0 && (
                <div className="flex gap-1 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
                    {labels.map((label, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeIndex === i
                                    ? 'bg-sky/20 text-sky'
                                    : 'bg-white/5 text-muted hover:bg-white/10'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Swipe container */}
            <div
                ref={containerRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {children.map((child, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 w-full snap-center pr-4 last:pr-0"
                    >
                        {child}
                    </div>
                ))}
            </div>

            {/* Dots indicator */}
            {children.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {children.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`w-2 h-2 rounded-full transition-all ${activeIndex === i
                                    ? 'bg-sky w-4'
                                    : 'bg-white/20 hover:bg-white/30'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

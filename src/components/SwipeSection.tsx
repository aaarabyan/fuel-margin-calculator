import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';

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

    // Handle scroll events to sync active index
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const scrollLeft = container.scrollLeft;
        const childWidth = container.offsetWidth;

        if (childWidth === 0) return;

        const newIndex = Math.round(scrollLeft / childWidth);
        const clampedIndex = Math.max(0, Math.min(newIndex, children.length - 1));

        if (clampedIndex !== activeIndex) {
            setActiveIndex(clampedIndex);
        }
    }, [children.length, activeIndex]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isMobile) return;

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll, isMobile]);

    const scrollTo = (index: number) => {
        const container = containerRef.current;
        if (!container) return;

        setActiveIndex(index);
        const childWidth = container.offsetWidth;
        container.scrollTo({ left: childWidth * index, behavior: 'smooth' });
    };

    // Desktop: show all sections in grid
    if (!isMobile) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
                {children.map((child, i) => (
                    <div key={i} className={i === 0 ? 'lg:col-span-2' : i === children.length - 1 ? 'lg:col-span-3' : ''}>
                        {child}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Tabs */}
            {labels && labels.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {labels.map((label, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeIndex === i
                                ? 'bg-sky/20 text-sky border border-sky/30'
                                : 'bg-white/5 text-muted hover:bg-white/10 border border-transparent'
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
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {children.map((child, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 w-full snap-center"
                        style={{ minWidth: '100%' }}
                    >
                        {child}
                    </div>
                ))}
            </div>

            {/* Dots indicator */}
            {children.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {children.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`h-2 rounded-full transition-all duration-200 ${activeIndex === i
                                ? 'bg-sky w-6'
                                : 'bg-white/20 hover:bg-white/30 w-2'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

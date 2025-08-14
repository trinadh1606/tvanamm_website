import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSiteStatistics } from '@/hooks/useStatistics';

type StatKey = 'tea_varieties' | 'customers_served' | 'franchise_locations' | 'years_experience';

const ORDER: StatKey[] = [
  'tea_varieties',
  'customers_served',
  'franchise_locations',
  'years_experience',
];

const LABELS: Record<StatKey, string> = {
  tea_varieties: 'Tea Varieties',
  customers_served: 'Customers Served',
  franchise_locations: 'Franchise Locations',
  years_experience: 'Years of Experience',
};

const nf = new Intl.NumberFormat('en-IN');

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function normalizeStats(raw: any): Record<StatKey, number> {
  return {
    tea_varieties: Number(raw?.tea_varieties) || 0,
    customers_served: Number(raw?.customers_served) || 0,
    franchise_locations: Number(raw?.franchise_locations) || 0,
    years_experience: Number(raw?.years_experience) || 0,
  };
}

function formatValue(key: StatKey, num: number) {
  if (key === 'customers_served' && num >= 1000) {
    return `${nf.format(Math.round(num / 1000))}K+`;
  }
  const base = nf.format(Math.round(num));
  if (key === 'tea_varieties' || key === 'franchise_locations') return `${base}+`;
  return base;
}

const StatisticsSection: React.FC = () => {
  const { data: stats, isLoading } = useSiteStatistics();

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [values, setValues] = useState<Record<StatKey, number>>({
    tea_varieties: 0,
    customers_served: 0,
    franchise_locations: 0,
    years_experience: 0,
  });

  const targets = useMemo(() => normalizeStats(stats), [stats]);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Observe visibility to only animate when near viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Animate counters when visible and data ready
  useEffect(() => {
    if (!inView || !stats) return;

    // If user prefers reduced motion, jump straight to targets
    if (prefersReducedMotion) {
      setValues(targets);
      return;
    }

    // Cancel a previous run
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    // Shorter duration on mobile helps TBT
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const duration = isMobile ? 900 : 1200; // ms

    const startValues = { ...values }; // current displayed numbers when animation starts

    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      const eased = easeOutCubic(t);

      // Compute all next values in one pass; one setState per frame
      const next: Record<StatKey, number> = { ...startValues } as any;
      for (const key of ORDER) {
        const from = startValues[key] || 0;
        const to = targets[key] || 0;
        next[key] = from + (to - from) * eased;
      }

      setValues(next);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        // Snap to exact targets at the end
        setValues(targets);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, targets, prefersReducedMotion]);

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-12 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">T VANAMM by Numbers</h2>
          <p className="text-lg text-muted-foreground">
            Our journey in bringing authentic tea experiences across India
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {ORDER.map((key) => (
            <div key={key} className="text-center" aria-live="polite">
              <div
                className="text-4xl md:text-5xl font-bold text-primary mb-2 tabular-nums"
                style={{ minHeight: '1.2em' }} /* avoids CLS */
                data-stat-key={key}
              >
                {formatValue(key, values[key] || 0)}
              </div>
              <div className="text-muted-foreground font-medium">{LABELS[key]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;

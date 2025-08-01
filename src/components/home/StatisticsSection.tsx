import React, { useEffect, useState } from 'react';
import { useSiteStatistics } from '@/hooks/useStatistics';

const StatisticsSection = () => {
  const { data: stats, isLoading } = useSiteStatistics();
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (stats) {
      // Initialize animated values
      setAnimatedValues({
        tea_varieties: 0,
        customers_served: 0,
        franchise_locations: 0,
        years_experience: 0
      });

      // Animate to actual values
      const timer = setTimeout(() => {
        Object.keys(stats).forEach((key) => {
          animateCounter(key, stats[key]);
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [stats]);

  const animateCounter = (key: string, targetValue: number) => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = targetValue / steps;
    let currentValue = 0;

    const interval = setInterval(() => {
      currentValue += stepValue;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(interval);
      }
      
      setAnimatedValues(prev => ({
        ...prev,
        [key]: Math.floor(currentValue)
      }));
    }, duration / steps);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-12 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const statLabels = {
    tea_varieties: 'Tea Varieties',
    customers_served: 'Customers Served',
    franchise_locations: 'Franchise Locations',
    years_experience: 'Years of Experience'
  };

  const formatNumber = (num: number, key: string) => {
    if (key === 'customers_served' && num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`;
    }
    return `${num}${key === 'tea_varieties' ? '+' : key === 'franchise_locations' ? '+' : ''}`;
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            T VANAMM by Numbers
          </h2>
          <p className="text-lg text-muted-foreground">
            Our journey in bringing authentic tea experiences across India
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(statLabels).map(([key, label]) => (
            <div key={key} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {formatNumber(animatedValues[key] || 0, key)}
              </div>
              <div className="text-muted-foreground font-medium">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
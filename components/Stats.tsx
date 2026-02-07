
import React, { useState, useEffect, useRef } from 'react';

interface StatItemProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: React.ReactNode;
  delay?: number;
}

const StatItem: React.FC<StatItemProps> = ({ value, suffix = '', prefix = '', label, icon, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let currentStep = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++;
        setCount(Math.min(Math.round(stepValue * currentStep), value));

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, value, delay]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    }
    return num.toLocaleString('ar-SA');
  };

  return (
    <div
      ref={ref}
      className={`group text-center transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Icon Container */}
      <div className="mb-4 inline-flex">
        <div className="w-16 h-16 bg-gradient-to-br from-[#4F8751] to-[#6ba96d] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="stat-value text-4xl md:text-5xl lg:text-6xl font-black text-[#034289] mb-2 group-hover:scale-105 transition-transform duration-300">
        <span className="text-[#4F8751]">{prefix}</span>
        {count >= 1000 ? formatNumber(count) : count.toLocaleString('ar-SA')}
        <span className="text-[#4F8751]">{suffix}</span>
      </div>

      {/* Label */}
      <p className="text-lg md:text-xl text-[#034289]/70 font-medium">{label}</p>
    </div>
  );
};

const Stats: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D2E1D9]/60 via-[#D2E1D9]/40 to-[#D2E1D9]/60" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4F8751]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#034289]/30 to-transparent" />

      {/* Floating shapes */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#4F8751]/10 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#034289]/10 rounded-full blur-xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#034289] mb-3">أرقام نفتخر بها</h2>
          <p className="text-[#034289]/70 text-lg">نمو مستمر وثقة متزايدة من مجتمعنا التعليمي</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <StatItem
            value={10000}
            prefix="+"
            label="طالب نشط"
            delay={0}
            icon={
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1H9m3-18a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            }
          />
          <StatItem
            value={500}
            prefix="+"
            label="مدرس محترف"
            delay={100}
            icon={
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatItem
            value={1200}
            prefix="+"
            label="دورة تعليمية"
            delay={200}
            icon={
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatItem
            value={95}
            suffix="%"
            label="رضا الطلاب"
            delay={300}
            icon={
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default Stats;


import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { getStats } from '../api/content.api';

interface HeroProps {
  onNavigate: (page: Page) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [studentCount, setStudentCount] = useState<string | null>(null);

  useEffect(() => {
    getStats().then((json) => {
      const data = json?.data || json;
      if (data?.totalStudents) {
        const n = data.totalStudents;
        setStudentCount(n >= 1000 ? `+${(n / 1000).toFixed(0)}K` : `+${n}`);
      }
    }).catch(() => {});
  }, []);
  return (
    <div dir="rtl" className="relative overflow-hidden bg-[#faf9ff]">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#034289]/[0.04] via-transparent to-[#4F8751]/[0.06]" />
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-[#4F8751]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-[#034289]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        {/* Floating dots */}
        <div className="absolute top-1/4 right-[12%] w-3 h-3 bg-[#4F8751]/30 rounded-full" />
        <div className="absolute top-1/3 left-[18%] w-2 h-2 bg-[#034289]/30 rounded-full" />
        <div className="absolute bottom-1/3 right-[25%] w-4 h-4 bg-[#4F8751]/20 rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20 md:py-32 lg:py-40">

          

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#002c61] leading-tight mb-6">
            ابدأ رحلة تعلمك اليوم
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-gradient-to-l from-[#4F8751] via-[#6ba96d] to-[#4F8751] bg-clip-text text-transparent">
                مع أفضل الخبراء
              </span>
              {/* Underline decoration */}
              <svg
                className="absolute -bottom-2 right-0 w-full"
                height="10"
                viewBox="0 0 300 10"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0,5 Q75,0 150,5 T300,5"
                  fill="none"
                  stroke="url(#heroGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F8751" />
                    <stop offset="100%" stopColor="#6ba96d" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-[#434751] mb-10 leading-relaxed">
            منصة تعليمية عربية متكاملة توفر دورات احترافية، بث مباشر، واختبارات متقدمة.
            <br className="hidden md:block" />
            <span className="font-semibold text-[#034289]">انضم الآن وابدأ التعلم أو التدريس.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary CTA */}
            <button
              onClick={() => onNavigate('courses')}
              className="cursor-pointer group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 text-lg font-bold text-white rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#034289] focus:ring-offset-2"
              style={{ background: 'linear-gradient(135deg, #002c61 0%, #034289 100%)' }}
            >
              <span>ابدأ الآن</span>
              {/* Arrow icon pointing RTL */}
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-[-4px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            {/* Ghost CTA */}
            <button
              onClick={() => onNavigate('live-stream')}
              className="cursor-pointer group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 text-lg font-bold text-[#034289] bg-white border-2 border-[#034289]/20 rounded-2xl shadow-md transition-all duration-200 hover:border-[#4F8751]/40 hover:bg-[#f3f3fa] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#034289] focus:ring-offset-2"
            >
              {/* Play icon */}
              <span className="relative flex-shrink-0">
                <span className="flex w-10 h-10 items-center justify-center bg-[#4F8751] rounded-full shadow-md transition-transform duration-200 group-hover:scale-110">
                  <svg
                    className="w-4 h-4 text-white mr-[-2px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {/* Pulse ring */}
                <span className="absolute inset-0 w-10 h-10 bg-[#4F8751]/25 rounded-full animate-ping" aria-hidden="true" />
              </span>
              <span>شاهد الفيديو</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16">
            <p className="text-sm text-[#737782] mb-5">موثوق من قبل آلاف الطلاب والمدرسين</p>
            <div className="flex flex-wrap items-center justify-center gap-8">

              {/* Student count with avatar stack */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3 space-x-reverse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-[#034289] to-[#4F8751] flex items-center justify-center text-white text-xs font-bold"
                      style={{ zIndex: 5 - i }}
                      aria-hidden="true"
                    >
                      {String.fromCharCode(1574 + i)}
                    </div>
                  ))}
                  <div
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm bg-[#4F8751] flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ zIndex: 0 }}
                    aria-hidden="true"
                  >
                    {studentCount ?? '...'}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#002c61] font-bold text-sm">{studentCount ?? '...'} طالب</p>
                  <p className="text-[#737782] text-xs">مسجل في المنصة</p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-10 bg-[#c3c6d2]/50" aria-hidden="true" />

              {/* Star rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5" aria-label="تقييم 4.9 من 5 نجوم">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-[#002c61] font-bold text-sm">4.9 / 5</p>
                  <p className="text-[#737782] text-xs">(2,847 تقييم)</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;

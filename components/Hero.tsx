
import React from 'react';
import { Page } from '../App';
import PlayIcon from './icons/PlayIcon';

interface HeroProps {
  onNavigate: (page: Page) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#034289]/[0.03] via-transparent to-[#4F8751]/[0.05]" />

        {/* Animated blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#4F8751]/20 rounded-full blur-[100px] animate-pulse-gentle" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#034289]/15 rounded-full blur-[100px] animate-pulse-gentle" style={{ animationDelay: '1s' }} />

        {/* Dots pattern */}
        <div className="absolute inset-0 dots-pattern opacity-40" />

        {/* Floating decorative shapes */}
        <div className="absolute top-1/4 left-[15%] w-4 h-4 bg-[#4F8751]/40 rounded-full animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-[20%] w-3 h-3 bg-[#034289]/40 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-[25%] w-2 h-2 bg-[#4F8751]/50 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-[10%] w-5 h-5 bg-[#034289]/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20 md:py-32 lg:py-40">
          {/* Badge */}
          <div className="animate-fade-in-down mb-6">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-[#D2E1D9]/50 rounded-full text-[#034289] font-semibold text-sm border border-[#D2E1D9]">
              <span className="w-2 h-2 bg-[#4F8751] rounded-full animate-pulse" />
              منصة تعليمية رائدة في الوطن العربي
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#034289] leading-tight mb-6 animate-fade-in-up">
            ابدأ رحلتك التعليمية
            <br />
            <span className="relative inline-block mt-2">
              <span className="text-gradient bg-gradient-to-l from-[#4F8751] via-[#6ba96d] to-[#4F8751] bg-clip-text text-transparent animate-gradient">
                مع أفضل المدرسين
              </span>
              {/* Underline decoration */}
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" preserveAspectRatio="none">
                <path
                  d="M0,6 Q75,0 150,6 T300,6"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F8751" />
                    <stop offset="100%" stopColor="#6ba96d" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-[#034289]/80 mb-10 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            منصة تعليمية عربية متكاملة توفر دورات احترافية، بث مباشر، واختبارات متقدمة.
            <br className="hidden md:block" />
            <span className="font-semibold text-[#034289]">انضم الآن وابدأ التعلم أو التدريس.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => onNavigate('courses')}
              className="group w-full sm:w-auto btn-primary px-10 py-5 text-lg font-bold text-white rounded-2xl shadow-xl flex items-center justify-center gap-3"
            >
              <span className="relative z-10">ابدأ الآن مجاناً</span>
              <svg
                className="w-5 h-5 relative z-10 transform rotate-180 group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button className="group w-full sm:w-auto flex items-center justify-center px-10 py-5 text-lg font-bold text-[#034289] bg-white border-2 border-[#D2E1D9] rounded-2xl hover:bg-[#D2E1D9]/20 hover:border-[#4F8751]/30 transition-all duration-300 shadow-md hover:shadow-lg">
              <div className="relative ml-3">
                <div className="w-12 h-12 bg-[#4F8751] rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <PlayIcon className="w-5 h-5 text-white mr-[-2px]" />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 w-12 h-12 bg-[#4F8751]/30 rounded-full animate-ping" />
              </div>
              شاهد الفيديو التعريفي
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm text-[#034289]/60 mb-4">موثوق من قبل آلاف الطلاب والمدرسين</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {/* Avatars stack */}
              <div className="flex -space-x-3 space-x-reverse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#034289] to-[#4F8751]"
                    style={{
                      zIndex: 5 - i,
                      opacity: 1 - (i * 0.1)
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(1574 + i)}
                    </div>
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-[#4F8751] flex items-center justify-center text-white text-xs font-bold">
                  +10K
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[#034289] font-bold">4.9</span>
                <span className="text-[#034289]/60 text-sm">(2,847 تقييم)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

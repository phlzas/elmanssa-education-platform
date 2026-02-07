
import React, { useRef, useEffect, useState } from 'react';
import BookOpenIcon from './icons/BookOpenIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
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
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative card-premium bg-white p-8 lg:p-10 rounded-2xl border border-[#D2E1D9]/50 text-center transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Gradient top border on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F8751] to-[#034289] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon Container */}
      <div className="relative mb-8 inline-flex">
        <div className="w-20 h-20 bg-gradient-to-br from-[#D2E1D9] to-[#D2E1D9]/50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl">
          {icon}
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 w-20 h-20 border-2 border-[#4F8751]/20 rounded-2xl scale-110 rotate-6 group-hover:rotate-12 group-hover:scale-125 transition-all duration-500" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-[#034289] mb-4 group-hover:text-[#4F8751] transition-colors duration-300">{title}</h3>

      {/* Description */}
      <p className="text-[#034289]/70 leading-relaxed text-lg">{description}</p>

      {/* Hover indicator */}
      <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <span className="inline-flex items-center gap-2 text-[#4F8751] font-semibold">
          اكتشف المزيد
          <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <section className="relative py-20 md:py-32 bg-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#4F8751]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#034289]/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 dots-pattern opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-[#4F8751]/10 rounded-full text-[#4F8751] font-semibold text-sm mb-4">
            مميزاتنا
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#034289] mb-6">
            لماذا تختار{' '}
            <span className="relative inline-block">
              <span className="text-[#4F8751]">منصتنا</span>
              <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,4 Q25,0 50,4 T100,4" fill="none" stroke="#4F8751" strokeWidth="2" opacity="0.5" />
              </svg>
            </span>
            ؟
          </h2>
          <p className="text-lg md:text-xl text-[#034289]/70 leading-relaxed">
            نوفر لك كل ما تحتاجه لتجربة تعليمية مميزة وفعالة، مع أحدث التقنيات وأفضل المحتوى
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          <FeatureCard
            icon={<BookOpenIcon className="w-10 h-10 text-[#4F8751]" />}
            title="دورات احترافية"
            description="أتقن مهارات جديدة مع دورات مصممة من قبل خبراء الصناعة لتلبية متطلبات سوق العمل الحديث."
            index={0}
          />
          <FeatureCard
            icon={<VideoCameraIcon className="w-10 h-10 text-[#4F8751]" />}
            title="بث مباشر تفاعلي"
            description="تواصل مع المدرسين في الوقت الفعلي، اطرح الأسئلة، واحصل على إجابات فورية لتعزيز فهمك."
            index={1}
          />
          <FeatureCard
            icon={<CheckBadgeIcon className="w-10 h-10 text-[#4F8751]" />}
            title="اختبارات متقدمة"
            description="قم بتقييم مستواك من خلال اختبارات تفاعلية وتقارير مفصلة لتتبع تقدمك الدراسي."
            index={2}
          />
        </div>

        {/* Additional features list */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {[
            'شهادات معتمدة',
            'دعم فني متواصل',
            'محتوى محدث',
            'تطبيق موبايل',
            'مجتمع تفاعلي'
          ].map((feature, index) => (
            <div
              key={feature}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D2E1D9]/30 border border-[#D2E1D9]"
            >
              <svg className="w-5 h-5 text-[#4F8751]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[#034289] font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

import React, { useRef, useEffect, useState } from 'react';

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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgba(3,66,137,0.06)] hover:shadow-[0_12px_40px_rgba(3,66,137,0.12)] transition-all duration-200 cursor-pointer transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 right-6 left-6 h-0.5 bg-gradient-to-l from-[#4F8751] to-[#034289] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-right" />

      {/* Icon */}
      <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#D2E1D9]/40 group-hover:bg-[#4F8751]/15 transition-colors duration-200">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-[#034289] mb-3 group-hover:text-[#4F8751] transition-colors duration-200 text-right">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[#034289]/65 leading-relaxed text-base text-right">
        {description}
      </p>
    </div>
  );
};

// SVG icons — 24x24 viewBox, stroke-based
const LiveSessionIcon = () => (
  <svg className="w-6 h-6 text-[#4F8751]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
);

const CertificateIcon = () => (
  <svg className="w-6 h-6 text-[#4F8751]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const ExpertTutorIcon = () => (
  <svg className="w-6 h-6 text-[#4F8751]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const LibraryIcon = () => (
  <svg className="w-6 h-6 text-[#4F8751]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const ProgressIcon = () => (
  <svg className="w-6 h-6 text-[#4F8751]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const CommunityIcon = () => (
  <svg className="w-6 h-6 text-[#4F8751]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const FEATURES = [
  {
    icon: <LiveSessionIcon />,
    title: 'جلسات تفاعلية مباشرة',
    description: 'تواصل مع المدرسين في الوقت الفعلي، اطرح الأسئلة، واحصل على إجابات فورية لتعزيز فهمك.',
  },
  {
    icon: <ExpertTutorIcon />,
    title: 'مدرسون ومرشدون خبراء',
    description: 'كل معلم يمر بمراجعة صارمة قبل النشر. خبرة حقيقية في الميدان، وليس مجرد نظريات أكاديمية.',
  },
  {
    icon: <LibraryIcon />,
    title: 'مكتبة موارد شاملة',
    description: 'وصول دائم لمئات الدورات والمواد التعليمية المحدّثة باستمرار لتواكب متطلبات سوق العمل.',
  },
  {
    icon: <ProgressIcon />,
    title: 'تتبع التقدم الشخصي',
    description: 'قم بتقييم مستواك من خلال تقارير مفصلة وإحصاءات دقيقة لتتبع تقدمك الدراسي في كل مادة.',
  },
  {
    icon: <CommunityIcon />,
    title: 'مجتمع تعليمي تفاعلي',
    description: 'انضم لمجتمع من الطلاب والمدرسين، شارك المعرفة، وتعاون مع زملائك لتحقيق أهدافك.',
  },
];

const Features: React.FC = () => {
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section dir="rtl" className="relative py-20 md:py-32 bg-[#f3f4f5] overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#4F8751]/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#034289]/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block px-4 py-2 bg-[#4F8751]/10 rounded-full text-[#4F8751] font-semibold text-sm mb-4">
            مميزاتنا
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#034289] mb-6">
            لماذا تختار{' '}
            <span className="text-[#4F8751]">منصتنا</span>
            ؟
          </h2>
          <p className="text-lg text-[#034289]/65 leading-relaxed">
            نوفر لك كل ما تحتاجه لتجربة تعليمية مميزة وفعالة، مع أحدث التقنيات وأفضل المحتوى
          </p>
        </div>

        {/* Features Grid — 2 cols mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Bottom tag strip */}
        <div
          className={`mt-16 flex flex-wrap items-center justify-center gap-3 md:gap-6 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          {[  ,'دعم فني متواصل', 'محتوى محدث', 'تطبيق موبايل'].map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#D2E1D9]/60 shadow-sm"
            >
              <svg className="w-4 h-4 text-[#4F8751] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[#034289] font-medium text-sm">{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;


import React, { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
  course: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'أحمد الشمري',
    role: 'مطور ويب',
    avatar: 'https://i.pravatar.cc/150?u=ahmed',
    text: 'بفضل منصة المنصة، تمكنت من الانتقال من مبتدئ إلى مطور ويب محترف خلال 6 أشهر فقط. المحتوى عملي ومنظم بشكل ممتاز.',
    rating: 5,
    course: 'تطوير الويب Full Stack',
  },
  {
    id: 2,
    name: 'فاطمة العلي',
    role: 'مصممة UI/UX',
    avatar: 'https://i.pravatar.cc/150?u=fatima',
    text: 'الدورات هنا مختلفة تماماً عن أي منصة أخرى. الشرح بالعربي والتطبيق العملي جعلني أتقن التصميم بثقة كاملة.',
    rating: 5,
    course: 'تصميم واجهات المستخدم',
  },
  {
    id: 3,
    name: 'محمد القحطاني',
    role: 'محلل بيانات',
    avatar: 'https://i.pravatar.cc/150?u=mohammed',
    text: 'حصلت على وظيفة أحلامي كمحلل بيانات بعد إكمال المسار التعليمي. الشهادات المعتمدة أعطتني ميزة تنافسية قوية.',
    rating: 5,
    course: 'علم البيانات وتحليل البيج داتا',
  },
  {
    id: 4,
    name: 'نورة الحربي',
    role: 'مدربة تسويق رقمي',
    avatar: 'https://i.pravatar.cc/150?u=noura',
    text: 'كمدربة، أقدر جودة المحتوى العالية في المنصة. البث المباشر التفاعلي يعطي تجربة تعليمية فريدة لا تتوفر في مكان آخر.',
    rating: 5,
    course: 'التسويق الرقمي',
  },
  {
    id: 5,
    name: 'عبدالله الدوسري',
    role: 'طالب هندسة برمجيات',
    avatar: 'https://i.pravatar.cc/150?u=abdullah',
    text: 'المنصة أفضل استثمار عملته في نفسي. مساعد الـ AI يجيب على أسئلتي في أي وقت، والمدرسين يتابعون تقدمي باستمرار.',
    rating: 5,
    course: 'أساسيات البرمجة',
  },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index: number) => {
    if (index === activeIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
    }, 400);
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white to-[#F0F6F2] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-[#4F8751]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#034289]/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-[#D2E1D9]/50 text-[#4F8751] font-bold text-sm px-5 py-2 rounded-full mb-4 border border-[#4F8751]/20">
            آراء طلابنا
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#034289] mb-4">
            ماذا يقول <span className="text-[#4F8751]">طلابنا</span> عنا؟
          </h2>
          <p className="text-[#034289]/60 text-lg max-w-2xl mx-auto">
            أكثر من 10,000 طالب يثقون بنا لتحقيق أهدافهم المهنية
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div
            className={`bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#D2E1D9]/50 relative transition-all duration-400 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Quote Mark */}
            <div className="absolute top-6 right-8 text-8xl font-serif text-[#D2E1D9]/60 leading-none pointer-events-none select-none">
              "
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-[#4F8751]/20 shadow-lg">
                    <img
                      src={testimonials[activeIndex].avatar}
                      alt={testimonials[activeIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-[#4F8751] text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-right">
                <StarRating rating={testimonials[activeIndex].rating} />
                <p className="text-lg md:text-xl text-[#034289]/80 leading-relaxed mt-4 mb-6">
                  {testimonials[activeIndex].text}
                </p>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-[#034289]">
                      {testimonials[activeIndex].name}
                    </h4>
                    <p className="text-[#4F8751] font-medium text-sm">
                      {testimonials[activeIndex].role}
                    </p>
                  </div>
                  <span className="hidden md:block text-[#D2E1D9]">|</span>
                  <span className="text-sm text-[#034289]/50 bg-[#F0F6F2] px-3 py-1 rounded-full">
                    🎓 {testimonials[activeIndex].course}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots & Mini Avatars */}
        <div className="flex items-center justify-center gap-4">
          {testimonials.map((t, index) => (
            <button
              key={t.id}
              onClick={() => goTo(index)}
              className={`relative transition-all duration-300 rounded-full overflow-hidden ${
                index === activeIndex
                  ? 'w-12 h-12 ring-3 ring-[#4F8751] shadow-lg scale-110'
                  : 'w-10 h-10 ring-2 ring-[#D2E1D9] opacity-50 hover:opacity-80 hover:scale-105'
              }`}
            >
              <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60">
          {['⭐ تقييم 4.9/5', '🎓 +10,000 خريج', '📜 شهادات معتمدة', '🌍 20+ دولة'].map((badge, idx) => (
            <span key={idx} className="text-[#034289]/70 font-semibold text-sm bg-white/50 px-5 py-2 rounded-full border border-[#D2E1D9]">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

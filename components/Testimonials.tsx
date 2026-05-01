import React, { useRef, useEffect, useState } from 'react';

interface Testimonial {
  name: string;
  role: string;
  rating: number;
  text: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'محمد العمري',
    role: 'مهندس برمجيات',
    rating: 5,
    text: 'المنصة غيّرت مساري المهني بالكامل. الدورات عملية ومباشرة، والمدرسون متجاوبون جداً. أنصح بها بشدة لكل من يريد تطوير مهاراته.',
  },
  {
    name: 'سارة الزهراني',
    role: 'مصممة جرافيك',
    rating: 5,
    text: 'تجربة تعليمية استثنائية! المحتوى العربي الأصيل يجعل الفهم أسهل بكثير. حصلت على شهادتي وأضفتها لـ LinkedIn وفتحت لي أبواباً جديدة.',
  },
  {
    name: 'أحمد الشمري',
    role: 'طالب جامعي',
    rating: 5,
    text: 'أفضل استثمار قمت به في حياتي. البث المباشر التفاعلي يجعلك تشعر أنك في فصل دراسي حقيقي. المساعد الذكي يجيب على أسئلتي في أي وقت.',
  },
  {
    name: 'نورة القحطاني',
    role: 'محاسبة قانونية',
    rating: 5,
    text: 'وجدت هنا ما لم أجده في أي منصة أخرى. المحتوى محدّث باستمرار ويواكب متطلبات السوق. الدعم الفني ممتاز والاستجابة سريعة جداً.',
  },
  {
    name: 'عبدالله المطيري',
    role: 'رائد أعمال',
    rating: 5,
    text: 'المنصة تجمع بين الجودة والسهولة. أتمكن من التعلم في أي وقت ومن أي مكان. الشهادات المعتمدة أضافت قيمة حقيقية لسيرتي الذاتية.',
  },
  {
    name: 'ريم الدوسري',
    role: 'معلمة ابتدائي',
    rating: 5,
    text: 'استفدت كثيراً من دورات التطوير المهني. الأسلوب التعليمي ممتاز والمدرسون يشرحون بطريقة مبسطة وواضحة. شكراً لهذه المنصة الرائعة.',
  },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5" role="img" aria-label={`تقييم ${rating} من 5 نجوم`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-[#D2E1D9]'}`}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
};

const TestimonialCard: React.FC<{ testimonial: Testimonial; index: number }> = ({
  testimonial,
  index,
}) => {
  const { ref, visible } = useInView();

  return (
    <div
      ref={ref}
      className={`group bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(3,66,137,0.06)] hover:shadow-[0_12px_32px_rgba(3,66,137,0.12)] transition-all duration-200 flex flex-col gap-4 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Quote mark */}
      <svg
        className="w-8 h-8 text-[#4F8751]/25 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>

      {/* Testimonial text */}
      <p className="text-[#034289]/70 text-sm leading-relaxed flex-grow text-right">
        {testimonial.text}
      </p>

      {/* Divider */}
      <div className="h-px bg-[#D2E1D9]/50" aria-hidden="true" />

      {/* Student info */}
      <div className="flex items-center justify-between">
        <StarRating rating={testimonial.rating} />
        <div className="text-right">
          <p className="font-bold text-[#034289] text-sm">{testimonial.name}</p>
          <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#034289]/8 rounded-full text-[#034289]/65 text-xs font-medium">
            {testimonial.role}
          </span>
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const { ref: headerRef, visible: headerVisible } = useInView(0.1);

  return (
    <section dir="rtl" className="py-24 px-4 bg-gradient-to-b from-white to-[#F0F6F2] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-[#4F8751]/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#034289]/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block bg-[#D2E1D9]/50 text-[#4F8751] font-bold text-sm px-5 py-2 rounded-full mb-4 border border-[#4F8751]/20">
            آراء طلابنا
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#034289] mb-4">
            ماذا يقول{' '}
            <span className="text-[#4F8751]">طلابنا</span>
            ؟
          </h2>
          <p className="text-[#034289]/60 text-lg max-w-2xl mx-auto">
            آلاف الطلاب غيّروا مساراتهم المهنية معنا — اقرأ تجاربهم الحقيقية
          </p>
        </div>

        {/* Testimonials grid — 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={i} />
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          className={`mt-16 bg-gradient-to-l from-[#034289] to-[#0459b7] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="text-center md:text-right">
            <h3 className="text-2xl font-black text-white mb-1">جاهز للبدء؟</h3>
            <p className="text-white/70 text-sm">انضم لآلاف الطلاب الذين غيّروا مساراتهم المهنية</p>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            {[
              { value: '+10K', label: 'طالب مسجّل' },
              { value: '+200', label: 'مادة دراسية' },
              { value: '4.9', label: 'متوسط التقييم' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-[#4F8751]">{s.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

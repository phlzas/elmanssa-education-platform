
import React, { useRef, useEffect, useState } from 'react';
import { MOCK_COURSES } from '../constants';
import CourseCard from './CourseCard';
import { Page } from '../App';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface PopularCoursesProps {
  onNavigate: (page: Page) => void;
}

const PopularCourses: React.FC<PopularCoursesProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F8751]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#034289]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12 transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div>
            <span className="inline-block px-4 py-2 bg-[#034289]/10 rounded-full text-[#034289] font-semibold text-sm mb-4">
              اختيارات مميزة
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#034289] mb-3">
              الدورات الأكثر{' '}
              <span className="text-[#4F8751]">شعبية</span>
            </h2>
            <p className="text-[#034289]/70 text-lg max-w-2xl">
              اكتشف الدورات الأكثر طلباً والتي حققت أعلى تقييمات من طلابنا
            </p>
          </div>

          <button
            onClick={() => onNavigate('courses')}
            className="group flex items-center gap-3 px-6 py-3 bg-[#D2E1D9]/30 hover:bg-[#D2E1D9]/50 rounded-xl border border-[#D2E1D9] transition-all duration-300"
          >
            <span className="text-lg font-bold text-[#034289] group-hover:text-[#4F8751] transition-colors">
              عرض كل الدورات
            </span>
            <div className="w-8 h-8 bg-[#4F8751] rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:-translate-x-1 transition-all duration-300">
              <ArrowLeftIcon className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_COURSES.slice(0, 3).map((course, index) => (
            <div
              key={course.id}
              className={`transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* Bottom decoration */}
        <div className={`mt-16 text-center transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '600ms' }}>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D2E1D9]" />
            <span className="text-[#034289]/50 text-sm">أكثر من 1,200 دورة متاحة</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D2E1D9]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;

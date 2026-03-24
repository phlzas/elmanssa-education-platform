
import React, { useRef, useEffect, useState } from 'react';
import { getPopularCourses } from '../api/courses.api';
import { Course } from '../types';
import CourseCard from './CourseCard';
import { Page } from '../App';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface PopularCoursesProps {
  onNavigate: (page: Page) => void;
}

const FALLBACK_COURSES: Course[] = [
  {
    id: 1,
    title: 'تطوير الويب Full Stack',
    category: 'برمجة',
    description: 'تعلم تطوير الويب من الصفر حتى الاحتراف باستخدام أحدث التقنيات',
    instructorName: 'أحمد محمد',
    rating: 4.9,
    duration: 40,
    lecturesCount: 120,
    level: 'مبتدئ',
    language: 'العربية',
    students: 3200,
    price: 299,
    isFree: false,
    imageUrl: '/assets/courses/web_development_course_cover_1774214768064.png',
  },
  {
    id: 2,
    title: 'تصميم واجهات المستخدم UI/UX',
    category: 'تصميم',
    description: 'احترف تصميم تجربة المستخدم وواجهات التطبيقات الحديثة',
    instructorName: 'سارة العلي',
    rating: 4.8,
    duration: 30,
    lecturesCount: 85,
    level: 'متوسط',
    language: 'العربية',
    students: 2100,
    price: 249,
    isFree: false,
    imageUrl: '/assets/courses/ui_ux_cover_1774214868681.png',
  },
  {
    id: 3,
    title: 'التسويق الرقمي والسوشيال ميديا',
    category: 'تسويق',
    description: 'استراتيجيات التسويق الرقمي وإدارة منصات التواصل الاجتماعي',
    instructorName: 'خالد الشمري',
    rating: 4.7,
    duration: 25,
    lecturesCount: 70,
    level: 'مبتدئ',
    language: 'العربية',
    students: 1800,
    price: 199,
    isFree: false,
    imageUrl: '/assets/courses/social_media_cover_1774214883097.png',
  },
];

const PopularCourses: React.FC<PopularCoursesProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    getPopularCourses().then((json: any) => {
      const raw = Array.isArray(json) ? json : (json?.data ?? []);
      const items = (Array.isArray(raw) ? raw : []).map((item: any) => ({
        id: item.id,
        guidId: item.id,
        title: item.title ?? item.name ?? '',
        category: item.category ?? 'عام',
        description: item.description ?? '',
        instructorName: item.instructorName ?? undefined,
        rating: typeof item.rating === 'number' ? item.rating : 4.5,
        duration: typeof item.duration === 'number' ? item.duration : undefined,
        lecturesCount: typeof item.lecturesCount === 'number' ? item.lecturesCount : undefined,
        level: item.level ?? undefined,
        language: item.language ?? 'العربية',
        students: typeof item.studentsCount === 'number' ? item.studentsCount : 0,
        price: typeof item.price === 'number' ? item.price : 0,
        isFree: item.price === 0,
        imageUrl: item.imageUrl || '/assets/courses/default.png',
        lastUpdated: item.createdAt ?? undefined,
      }));
      if (items.length > 0) setCourses(items);
    }).catch(() => {});
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
          {courses.slice(0, 3).map((course, index) => (
            <div
              key={course.id}
              className={`transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <CourseCard
                course={course}
                onClick={() => onNavigate('course-detail', { courseId: course.guidId || course.id })}
              />
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


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FILTER_LEVELS } from '../constants';
import CourseCard from './CourseCard';
import { getCourses } from '../api/courses.api';
import { Course } from '../types';
import { Page } from '../App';

interface CoursesPageProps {
  onNavigate?: (page: Page, payload?: any) => void;
  isTeacher?: boolean;
}

const PER_PAGE = 9;
const DEBOUNCE_MS = 400;

function mapCourseItem(item: any): Course {
  return {
    id: Number(item.id),
    guidId: item.guidId || undefined,
    title: item.title ?? '',
    category: item.category ?? 'عام',
    description: item.description ?? '',
    instructorName: item.instructorName ?? undefined,
    instructorId: typeof item.instructorId === 'number' ? item.instructorId : undefined,
    rating: typeof item.rating === 'number' ? item.rating : 4.5,
    duration: typeof item.duration === 'number' ? item.duration : undefined,
    lecturesCount: typeof item.lecturesCount === 'number' ? item.lecturesCount : undefined,
    level: item.level ?? undefined,
    language: item.language ?? 'العربية',
    students: typeof item.studentsCount === 'number' ? item.studentsCount : 0,
    price: typeof item.price === 'number' ? item.price : 0,
    isFree: item.price === 0,
    imageUrl: item.imageUrl || '/assets/courses/default.png',
    lastUpdated: item.createdAt ?? item.updatedAt ?? undefined,
  };
}

const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigate, isTeacher = false }) => {

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, per_page: PER_PAGE };
      if (searchQuery) params.search = searchQuery;
      if (selectedLevel && selectedLevel !== 'جميع المستويات') params.level = selectedLevel;
      if (selectedCategory) params.category = selectedCategory;

      const json = await getCourses(params);
      const raw = Array.isArray(json) ? json : (json.data ?? []);
      const items: Course[] = (Array.isArray(raw) ? raw : []).map(mapCourseItem);
      setCourses(items);

      if (json.meta) {
        const total = json.meta.total ?? 0;
        const perPage = json.meta.perPage ?? PER_PAGE;
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / perPage)));
      } else {
        setTotalCount(items.length);
        setTotalPages(1);
      }

      if (!selectedCategory && !selectedLevel && !searchQuery && currentPage === 1) {
        const cats = [...new Set(items.map(c => c.category).filter(Boolean))];
        if (cats.length) setAllCategories(cats);
      }
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedLevel, selectedCategory]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced search input
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      setSearchQuery(value);
    }, DEBOUNCE_MS);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(prev => prev === level ? '' : level);
    setCurrentPage(1);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(prev => prev === cat ? '' : cat);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSelectedLevel('');
    setSelectedCategory('');
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="relative">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-[#034289]/5 via-transparent to-[#4F8751]/5 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <span className="inline-block px-4 py-2 bg-[#4F8751]/10 rounded-full text-[#4F8751] font-semibold text-sm mb-4">
              اكتشف الدورات
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-[#034289] mb-4">
              استكشف{' '}
              <span className="text-[#4F8751]">مكتبة الدورات</span>
            </h1>
            <p className="text-[#034289]/70 text-lg mb-8">
              {totalCount > 0 ? `${totalCount} دورة تعليمية في مختلف المجالات` : 'أكثر من 1,200 دورة تعليمية في مختلف المجالات'}
            </p>

            {/* Debounced Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#034289]/40 pointer-events-none">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ابحث عن دورة..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="w-full pr-14 pl-12 py-4 bg-white border-2 border-[#D2E1D9] rounded-2xl text-[#034289] placeholder:text-[#034289]/40 focus:border-[#4F8751] focus:ring-4 focus:ring-[#4F8751]/10 shadow-lg transition-all duration-300 text-lg"
              />
              {searchInput && (
                <button
                  onClick={() => handleSearchInputChange('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#034289]/40 hover:text-[#034289] transition-colors"
                  aria-label="مسح البحث"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => handleCategoryClick('')}
              className={`px-4 py-2 font-medium rounded-full text-sm transition-all hover:shadow-lg ${!selectedCategory ? 'bg-[#4F8751] text-white' : 'bg-white border border-[#D2E1D9] text-[#034289] hover:border-[#4F8751] hover:text-[#4F8751]'}`}
            >
              الكل
            </button>
            {allCategories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 font-medium rounded-full text-sm transition-all shadow-sm ${selectedCategory === cat ? 'bg-[#4F8751] text-white' : 'bg-white border border-[#D2E1D9] text-[#034289] hover:border-[#4F8751] hover:text-[#4F8751]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFiltersOnMobile(!showFiltersOnMobile)}
            className="w-full flex items-center justify-between px-5 py-4 bg-white border border-[#D2E1D9] rounded-xl shadow-sm"
          >
            <span className="flex items-center gap-2 text-[#034289] font-semibold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              الفلاتر
            </span>
            <svg className={`w-5 h-5 text-[#034289] transition-transform duration-300 ${showFiltersOnMobile ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`w-full lg:w-72 xl:w-80 flex-shrink-0 ${showFiltersOnMobile ? 'block' : 'hidden lg:block'}`}>
            <div className="card-premium glass bg-white/90 p-6 rounded-2xl border border-[#D2E1D9]/50 sticky top-24 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#034289]">الفلاتر</h3>
                <button onClick={handleReset} className="text-sm text-[#4F8751] font-medium hover:underline">
                  إعادة تعيين
                </button>
              </div>

              {/* Level Filter */}
              <div className="mb-8">
                <h4 className="text-md font-bold text-[#034289] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#D2E1D9]/50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </span>
                  المستوى
                </h4>
                <div className="space-y-3">
                  {FILTER_LEVELS.map((level) => (
                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="level"
                        checked={selectedLevel === level}
                        onChange={() => handleLevelChange(level)}
                        className="w-5 h-5 text-[#4F8751] focus:ring-[#4F8751] border-2 border-[#D2E1D9] rounded-full"
                      />
                      <span className="text-[#034289]/80 group-hover:text-[#034289] transition-colors">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              {allCategories.length > 0 && (
                <div>
                  <h4 className="text-md font-bold text-[#034289] mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#D2E1D9]/50 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </span>
                    التصنيف
                  </h4>
                  <div className="space-y-3">
                    {allCategories.map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategory === cat}
                          onChange={() => handleCategoryClick(cat)}
                          className="w-5 h-5 text-[#4F8751] rounded focus:ring-[#4F8751] border-2 border-[#D2E1D9]"
                        />
                        <span className="text-[#034289]/80 group-hover:text-[#034289] transition-colors">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Courses Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <p className="text-[#034289]/70">
                عرض <span className="font-bold text-[#034289]">{totalCount}</span> دورة
                {totalPages > 1 && (
                  <span className="mr-2 text-sm">(صفحة {currentPage} من {totalPages})</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                <p className="text-center w-full col-span-3 py-10 text-[#034289]/60">جاري تحميل الدورات...</p>
              ) : error ? (
                <p className="text-center w-full col-span-3 py-10 text-red-600">حدث خطأ أثناء تحميل الدورات: {error}</p>
              ) : courses.length > 0 ? (
                courses.map((course, index) => (
                  <div key={course.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <CourseCard
                      course={course}
                      onClick={() => onNavigate && onNavigate('course-detail', { courseId: course.guidId || course.id })}
                      onEnroll={() => onNavigate && onNavigate('checkout', { courseId: course.guidId || course.id })}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center w-full col-span-3 py-10 text-[#034289]/60">لا توجد دورات مطابقة للبحث</p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#D2E1D9] text-[#034289] hover:bg-[#D2E1D9]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {getPageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="text-[#034289]/50 px-1">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p as number)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-colors ${currentPage === p ? 'bg-[#4F8751] text-white' : 'border border-[#D2E1D9] text-[#034289] hover:bg-[#D2E1D9]/30'}`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#D2E1D9] text-[#034289] hover:bg-[#D2E1D9]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB: teacher → "Create Course", others → Back to Top (after scroll) */}
      {isTeacher ? (
        <button
          onClick={() => onNavigate && onNavigate('teacher-dashboard')}
          className="fixed bottom-8 left-8 z-50 flex items-center gap-2 px-5 py-3.5 bg-[#4F8751] text-white font-bold rounded-2xl shadow-2xl hover:bg-[#3d6b3f] transition-all duration-200 hover:scale-105"
          aria-label="إنشاء دورة جديدة"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>إنشاء دورة</span>
        </button>
      ) : showBackToTop ? (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 left-8 z-50 w-12 h-12 bg-[#034289] text-white rounded-2xl shadow-2xl hover:bg-[#023070] transition-all duration-200 hover:scale-105 flex items-center justify-center"
          aria-label="العودة للأعلى"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      ) : null}
    </div>
  );
};

export default CoursesPage;

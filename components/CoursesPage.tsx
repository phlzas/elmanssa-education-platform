
import React, { useState } from 'react';
import { MOCK_COURSES, FILTER_LEVELS, FILTER_PRICES } from '../constants';
import CourseCard from './CourseCard';

import { Page } from '../App';

interface CoursesPageProps {
  onNavigate?: (page: Page, payload?: any) => void;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);

  const categories = [...new Set(MOCK_COURSES.map(c => c.category))];

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
              أكثر من 1,200 دورة تعليمية في مختلف المجالات
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#034289]/40">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ابحث عن دورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-14 pl-4 py-4 bg-white border-2 border-[#D2E1D9] rounded-2xl text-[#034289] placeholder:text-[#034289]/40 focus:border-[#4F8751] focus:ring-4 focus:ring-[#4F8751]/10 shadow-lg transition-all duration-300 text-lg"
              />
              <button className="absolute left-2 top-1/4 -translate-y-1/6 btn-primary px-6 py-2 text-white font-bold rounded-xl">
                <span className="relative z-10">ب حث</span>
              </button>
            </div>
          </div>

          {/* Quick Category Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button className="px-4 py-2 bg-[#4F8751] text-white font-medium rounded-full text-sm transition-all hover:shadow-lg">
              الكل
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 bg-white border border-[#D2E1D9] text-[#034289] font-medium rounded-full text-sm hover:border-[#4F8751] hover:text-[#4F8751] transition-all shadow-sm"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
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

          {/* Filters Sidebar */}
          <aside className={`w-full lg:w-72 xl:w-80 transition-all duration-300 ${showFiltersOnMobile ? 'block' : 'hidden lg:block'}`}>
            <div className="card-premium glass bg-white/90 p-6 rounded-2xl border border-[#D2E1D9]/50 sticky top-24 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#034289]">الفلاتر</h3>
                <button className="text-sm text-[#4F8751] font-medium hover:underline">
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
                        className="w-5 h-5 text-[#4F8751] focus:ring-[#4F8751] border-2 border-[#D2E1D9] rounded-full"
                      />
                      <span className="text-[#034289]/80 group-hover:text-[#034289] transition-colors">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h4 className="text-md font-bold text-[#034289] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#D2E1D9]/50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  السعر
                </h4>
                <div className="space-y-3">
                  {FILTER_PRICES.map((price) => (
                    <label key={price} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-[#4F8751] rounded focus:ring-[#4F8751] border-2 border-[#D2E1D9]"
                      />
                      <span className="text-[#034289]/80 group-hover:text-[#034289] transition-colors">{price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <h4 className="text-md font-bold text-[#034289] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#D2E1D9]/50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  المدة
                </h4>
                <div className="space-y-3">
                  {['أقل من 5 ساعات', '5-10 ساعات', '10-20 ساعة', 'أكثر من 20 ساعة'].map((duration) => (
                    <label key={duration} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-[#4F8751] rounded focus:ring-[#4F8751] border-2 border-[#D2E1D9]"
                      />
                      <span className="text-[#034289]/80 group-hover:text-[#034289] transition-colors">{duration}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Courses Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <p className="text-[#034289]/70">
                عرض <span className="font-bold text-[#034289]">{MOCK_COURSES.length}</span> دورة
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[#034289]/60 text-sm">ترتيب حسب:</span>
                <select className="px-4 py-2.5 bg-white border border-[#D2E1D9] rounded-xl text-[#034289] focus:border-[#4F8751] focus:ring-2 focus:ring-[#4F8751]/10 transition-all">
                  <option>الأكثر شعبية</option>
                  <option>الأحدث</option>
                  <option>السعر: من الأقل للأعلى</option>
                  <option>السعر: من الأعلى للأقل</option>
                  <option>التقييم</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {MOCK_COURSES.map((course, index) => (
                <div
                  key={course.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CourseCard
                    course={course}
                    onClick={() => onNavigate && onNavigate('course-detail', { courseId: course.id })}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-12">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#D2E1D9] text-[#034289] hover:bg-[#D2E1D9]/30 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#4F8751] text-white font-bold">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#D2E1D9] text-[#034289] hover:bg-[#D2E1D9]/30 transition-colors font-medium">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#D2E1D9] text-[#034289] hover:bg-[#D2E1D9]/30 transition-colors font-medium">3</button>
              <span className="text-[#034289]/50">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#D2E1D9] text-[#034289] hover:bg-[#D2E1D9]/30 transition-colors font-medium">12</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#D2E1D9] text-[#034289] hover:bg-[#D2E1D9]/30 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;

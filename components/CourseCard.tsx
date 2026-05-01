import React, { useCallback, useState } from 'react';
import { Course } from '../types/types';
import StarIcon from './icons/StarIcon';
import ClockIcon from './icons/ClockIcon';
import UsersIcon from './icons/UsersIcon';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  onEnroll?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, onEnroll }) => {
  const isFree = course.isFree === true || course.price === 0;
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEnrolling || !onEnroll) return;
    setIsEnrolling(true);
    try {
      await onEnroll();
    } finally {
      setIsEnrolling(false);
    }
  }, [onEnroll, isEnrolling]);

  return (
    <div
      dir="rtl"
      className="group bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-shadow duration-200 shadow-[0_4px_12px_rgba(3,66,137,0.06)] hover:shadow-[0_12px_32px_rgba(3,66,137,0.14)]"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[#D2E1D9]/30">
        <img
          className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          src={course.imageUrl}
          alt={`صورة دورة: ${course.title}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/assets/courses/default.png';
          }}
        />

        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#4F8751] shadow-sm">
            {course.category}
          </span>
        </div>

        {/* Free badge */}
        {isFree && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 bg-[#4F8751] text-white rounded-full text-xs font-bold shadow-sm">
              مجاني
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#034289] to-[#4F8751] flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            aria-hidden="true"
          >
            {(course.instructorName ?? 'م').charAt(0)}
          </div>
          <div>
            <p className="text-xs text-[#034289]/55">المدرب</p>
            <p className="text-sm font-semibold text-[#034289]">{course.instructorName ?? 'معلم'}</p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#034289] mb-2 leading-snug group-hover:text-[#4F8751] transition-colors duration-200 line-clamp-2 text-right">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-[#034289]/55 text-sm leading-relaxed line-clamp-2 text-right flex-grow">
          {course.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-sm text-[#034289]/65 mt-4 pt-4 border-t border-[#D2E1D9]/40">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="font-semibold text-[#034289]">{course.rating}</span>
          </div>
          <div className="w-px h-3 bg-[#D2E1D9]" aria-hidden="true" />
          {/* Duration */}
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-[#4F8751] flex-shrink-0" />
            <span>{typeof course.duration === 'number' ? course.duration : 0} ساعة</span>
          </div>
          <div className="w-px h-3 bg-[#D2E1D9]" aria-hidden="true" />
          {/* Students */}
          <div className="flex items-center gap-1">
            <UsersIcon className="w-4 h-4 text-[#4F8751] flex-shrink-0" />
            <span>{course.students.toLocaleString('ar-SA')}</span>
          </div>
        </div>
      </div>

      {/* Footer — price + actions */}
      <div className="px-5 pb-5 pt-0">
        {/* Price */}
        <div className="mb-3">
          {isFree ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-[#4F8751]">مجاني</span>
              <span className="text-xs text-[#034289]/45 line-through">199 ج.م</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#034289]">
                {Number(course.price).toLocaleString('ar-SA')}
              </span>
              <span className="text-xs text-[#034289]/65">ج.م</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            className="flex-1 px-3 py-2 border-2 border-[#034289] text-[#034289] font-bold rounded-xl hover:bg-[#034289] hover:text-white transition-colors duration-200 text-sm cursor-pointer"
          >
            عرض التفاصيل
          </button>
          <button
            type="button"
            onClick={handleEnroll}
            disabled={isEnrolling || !onEnroll}
            className="flex-1 px-3 py-2 bg-[#034289] text-white font-bold rounded-xl hover:bg-[#023070] transition-colors duration-200 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnrolling ? 'جاري التحميل...' : isFree ? 'ابدأ مجاناً' : 'اشتر الآن'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

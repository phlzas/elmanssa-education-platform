
import React from 'react';
import { Course } from '../types';
import StarIcon from './icons/StarIcon';
import ClockIcon from './icons/ClockIcon';
import UsersIcon from './icons/UsersIcon';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const isFree = course.price === 'free';

  return (
    <div className="group card-premium bg-white border border-[#D2E1D9]/50 rounded-2xl overflow-hidden flex flex-col hover:border-[#4F8751]/30 transition-all duration-500">
      {/* Image Container */}
      <div className="course-image-wrapper relative h-52 overflow-hidden">
        <img
          className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          src={course.imageUrl}
          alt={course.title}
        />

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-[#4F8751] shadow-sm">
            {course.category}
          </span>
        </div>

        {/* Price Badge - only for free courses */}
        {isFree && (
          <div className="absolute top-4 left-4">
            <span className="badge-free px-3 py-1.5 text-sm font-bold shadow-lg">
              مجاني
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#034289]/80 via-[#034289]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-6">
          <button className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 px-6 py-3 bg-white text-[#034289] font-bold rounded-xl hover:bg-[#D2E1D9] flex items-center gap-2">
            <span>معاينة الدورة</span>
            <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-grow flex flex-col">
        {/* Instructor */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#034289] to-[#4F8751] flex items-center justify-center text-white font-bold text-sm shadow-md">
            {course.instructor.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-[#034289]/60">المدرب</p>
            <p className="text-[#034289] font-semibold">{course.instructor}</p>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-[#034289] mb-3 leading-snug group-hover:text-[#4F8751] transition-colors duration-300 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-[#034289]/60 text-sm leading-relaxed line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-[#034289]/70 mt-6 pt-4 border-t border-[#D2E1D9]/50">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-yellow-50 rounded">
              <StarIcon className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="font-semibold text-[#034289]">{course.rating}</span>
          </div>
          <div className="w-px h-4 bg-[#D2E1D9]" />
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-[#D2E1D9]/50 rounded">
              <ClockIcon className="w-4 h-4 text-[#4F8751]" />
            </div>
            <span>{course.duration} ساعة</span>
          </div>
          <div className="w-px h-4 bg-[#D2E1D9]" />
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-[#D2E1D9]/50 rounded">
              <UsersIcon className="w-4 h-4 text-[#4F8751]" />
            </div>
            <span>{course.students.toLocaleString('ar-SA')}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-gradient-to-br from-[#D2E1D9]/20 to-[#D2E1D9]/10 border-t border-[#D2E1D9]/50 flex items-center justify-between">
        <div>
          {isFree ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#4F8751]">مجاني</span>
              <span className="text-sm text-[#034289]/50 line-through">199 ريال</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#034289]">{course.price}</span>
              <span className="text-sm text-[#034289]/70">ريال</span>
            </div>
          )}
        </div>
        <button className="btn-primary px-6 py-3 text-sm font-bold text-white rounded-xl shadow-lg">
          <span className="relative z-10">سجل الآن</span>
        </button>
      </div>
    </div>
  );
};

export default CourseCard;

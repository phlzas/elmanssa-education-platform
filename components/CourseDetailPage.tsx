
import React, { useEffect, useState } from 'react';
import { MOCK_COURSES } from '../constants';
import { Course } from '../types';
import { Page, AccountType } from '../App';
import StarIcon from './icons/StarIcon';
import ClockIcon from './icons/ClockIcon';
import UsersIcon from './icons/UsersIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import PlayIcon from './icons/PlayIcon';

interface CourseDetailPageProps {
    courseId: number;
    onNavigate: (page: Page, payload?: { accountType?: AccountType; courseId?: number }) => void;
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId, onNavigate }) => {
    const [course, setCourse] = useState<Course | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');

    useEffect(() => {
        // In a real app, this would be an API call
        const foundCourse = MOCK_COURSES.find(c => c.id === courseId);
        setCourse(foundCourse || null);
        window.scrollTo(0, 0);
    }, [courseId]);

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F8751]"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#FEFEFE] min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative bg-[#034289] text-white overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#034289] to-[#022a5c] opacity-90" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#4F8751]/20 rounded-full blur-3xl animate-pulse-gentle" />
                    <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Content Left */}
                        <div className="lg:col-span-2 space-y-6 animate-fade-in-up">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 bg-[#4F8751]/20 border border-[#4F8751]/50 rounded-full text-[#4F8751] text-sm font-semibold text-white">
                                    {course.category}
                                </span>
                                {course.price === 'free' && (
                                    <span className="px-3 py-1 bg-white/20 border border-white/30 rounded-full text-white text-sm font-semibold">
                                        مجاني
                                    </span>
                                )}
                                <div className="flex items-center text-yellow-400 text-sm font-bold">
                                    <span className="ml-1">{course.rating}</span>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <StarIcon key={s} className={`w-4 h-4 ${s <= Math.round(course.rating) ? 'fill-current' : 'text-gray-400'}`} />
                                        ))}
                                    </div>
                                    <span className="mr-2 text-white/60 font-normal">({(course.students / 10).toFixed(0)} تقييم)</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                                {course.title}
                            </h1>

                            <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-white/90 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8751] to-[#6ba96d] flex items-center justify-center font-bold text-xs ring-2 ring-white/20">
                                        {course.instructor.charAt(0)}
                                    </div>
                                    <span>بواسطة <span className="font-bold underline decoration-[#4F8751] underline-offset-4">{course.instructor}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5 text-[#4F8751]" />
                                    <span>آخر تحديث: {course.lastUpdated || 'مارس 2026'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="w-5 h-5 text-[#4F8751]" />
                                    <span>{course.language || 'العربية'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* What you'll learn */}
                        <div className="bg-white rounded-2xl shadow-xl border border-[#D2E1D9]/50 p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <h3 className="text-xl font-bold text-[#034289] mb-6">ماذا ستتعلم في هذه الدورة؟</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(course.learningPoints || [
                                    'فهم المفاهيم الأساسية والمتقدمة في المجال',
                                    'تطبيق المعرفة النظرية في مشاريع عملية',
                                    'استخدام الأدوات والتقنيات الحديثة باحترافية',
                                    'بناء معرض أعمال قوي يعزز فرصك الوظيفية',
                                    'الحصول على شهادة إتمام معتمدة',
                                    'حل المشكلات البرمجية المعقدة بكفاءة'
                                ]).map((point, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="mt-1 min-w-[20px]">
                                            <svg className="w-5 h-5 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-[#034289]/80 text-sm leading-relaxed">{point}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Content Tabs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/50 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="flex border-b border-[#D2E1D9]">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex-1 py-4 text-center font-bold text-sm md:text-base border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#4F8751] text-[#4F8751] bg-[#4F8751]/5' : 'border-transparent text-[#034289]/60 hover:text-[#034289] hover:bg-gray-50'
                                        }`}
                                >
                                    نظرة عامة
                                </button>
                                <button
                                    onClick={() => setActiveTab('curriculum')}
                                    className={`flex-1 py-4 text-center font-bold text-sm md:text-base border-b-2 transition-colors ${activeTab === 'curriculum' ? 'border-[#4F8751] text-[#4F8751] bg-[#4F8751]/5' : 'border-transparent text-[#034289]/60 hover:text-[#034289] hover:bg-gray-50'
                                        }`}
                                >
                                    المنهج الدراسي
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`flex-1 py-4 text-center font-bold text-sm md:text-base border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-[#4F8751] text-[#4F8751] bg-[#4F8751]/5' : 'border-transparent text-[#034289]/60 hover:text-[#034289] hover:bg-gray-50'
                                        }`}
                                >
                                    التقييمات
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                {activeTab === 'overview' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h4 className="text-lg font-bold text-[#034289] mb-3">متطلبات الدورة</h4>
                                            <ul className="list-disc list-inside space-y-2 text-[#034289]/70 marker:text-[#4F8751]">
                                                {(course.requirements || [
                                                    'لا توجد متطلبات مسبقة، الدورة تبدأ من الصفر',
                                                    'جهاز كمبيوتر واتصال بالإنترنت',
                                                    'الرغبة في التعلم والتطور'
                                                ]).map((req, idx) => (
                                                    <li key={idx}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-[#034289] mb-3">الوصف التفصيلي</h4>
                                            <div className="text-[#034289]/70 space-y-4 leading-relaxed">
                                                <p>{course.description}</p>
                                                <p>
                                                    ستتعلم في هذا الكورس كيفية بناء مشاريع حقيقية من البداية للنهاية. سنغطي جميع الجوانب النظرية والعملية
                                                    التي تحتاجها لتصبح محترفاً في هذا المجال. تم تصميم المحتوى ليكون سهلاً وسلساً للمبتدئين، مع التعمق
                                                    التدريجي في المفاهيم المتقدمة.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'curriculum' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="flex items-center justify-between text-sm text-[#034289]/60 mb-4">
                                            <span>{course.lecturesCount || 42} محاضرة</span>
                                            <span>{course.duration} ساعة إجمالية</span>
                                        </div>
                                        {(course.curriculum || [
                                            { section: 'المقدمة والتهيئة', lectures: ['مرحباً بك في الدورة', 'تثبيت الأدوات اللازمة', 'أول خطوة في الطريق'] },
                                            { section: 'الأساسيات والمفاهيم', lectures: ['مفهوم الويب وكيف يعمل', 'HTML & CSS الأساسية', 'بناء هيكل الصفحة'] },
                                            { section: 'التعمق في التقنيات', lectures: ['JavaScript المتقدمة', 'التعامل مع DOM', 'المشروع الأول'] },
                                            { section: 'مشروع التخرج', lectures: ['التخطيط للمشروع', 'بناء الواجهات', 'ربط الخلفية', 'النشر النهائي'] }
                                        ]).map((section, idx) => (
                                            <div key={idx} className="border border-[#D2E1D9] rounded-xl overflow-hidden">
                                                <div className="bg-[#F8FAFA] px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#D2E1D9]/20 transition-colors">
                                                    <span className="font-bold text-[#034289]">{section.section}</span>
                                                    <span className="text-xs text-[#034289]/50">{section.lectures.length} دروس</span>
                                                </div>
                                                <div className="divide-y divide-[#D2E1D9]/30">
                                                    {section.lectures.map((lecture, lIdx) => (
                                                        <div key={lIdx} className="px-4 py-3 flex items-center gap-3 hover:bg-white transition-colors bg-white/50">
                                                            <PlayIcon className="w-4 h-4 text-[#4F8751]/70" />
                                                            <span className="text-sm text-[#034289]/80">{lecture}</span>
                                                            <span className="mr-auto text-xs text-[#034289]/40 border px-1.5 py-0.5 rounded">10:00</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center gap-4 bg-[#F8FAFA] p-6 rounded-xl">
                                            <div className="text-center">
                                                <div className="text-5xl font-black text-[#034289]">{course.rating}</div>
                                                <div className="flex justify-center my-2 text-yellow-400">
                                                    {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} className="w-4 h-4 fill-current" />)}
                                                </div>
                                                <div className="text-sm text-[#034289]/60">تقييم الدورة</div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                {[5, 4, 3, 2, 1].map((rating) => (
                                                    <div key={rating} className="flex items-center gap-3 text-sm">
                                                        <span className="w-3">{rating}</span>
                                                        <div className="flex-1 h-2 bg-[#D2E1D9]/30 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#4F8751]"
                                                                style={{ width: rating === 5 ? '70%' : rating === 4 ? '20%' : '5%' }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Preview Card */}
                            <div className="card-premium bg-white p-1 rounded-2xl shadow-2xl border border-[#D2E1D9]/50 animate-fade-in-down" style={{ animationDelay: '0.3s' }}>
                                <div className="relative rounded-xl overflow-hidden mb-4 group cursor-pointer aspect-video">
                                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <PlayIcon className="w-8 h-8 text-white ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 left-0 right-0 text-center">
                                        <span className="text-white text-sm font-semibold drop-shadow-md">معاينة هذه الدورة</span>
                                    </div>
                                </div>

                                <div className="px-5 pb-6">
                                    <div className="flex items-end gap-2 mb-6">
                                        <span className="text-4xl font-black text-[#034289]">
                                            {course.price === 'free' ? 'مجاني' : `${course.price}`}
                                        </span>
                                        {course.price !== 'free' && (
                                            <>
                                                <span className="text-lg text-[#034289]/60 font-medium line-through mb-1.5">
                                                    {typeof course.price === 'number' ? (course.price * 1.5).toFixed(0) : ''}
                                                </span>
                                                <span className="text-sm font-bold text-[#4F8751] mb-2 bg-[#4F8751]/10 px-2 py-0.5 rounded">
                                                    خصم 33%
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <button className="w-full btn-primary py-4 text-lg font-bold text-white rounded-xl shadow-lg mb-3 hover:shadow-glow transition-all">
                                        {course.price === 'free' ? 'سجل مجاناً الآن' : 'اشترِ الآن'}
                                    </button>

                                    <p className="text-center text-xs text-[#034289]/50 mb-6">30 يوم ضمان استرداد الأموال</p>

                                    <div className="space-y-4">
                                        <h5 className="font-bold text-[#034289]">تحتوي هذه الدورة على:</h5>
                                        <ul className="space-y-3 text-sm text-[#034289]/70">
                                            <li className="flex items-center gap-3">
                                                <ClockIcon className="w-5 h-5 text-[#4F8751]" />
                                                <span>{course.duration} ساعة فيديو حسب الطلب</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span>8 مقالات ومصادر</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                <span>15 مورد قابل للتحميل</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                <span>الوصول عن طريق الجوال والتلفاز</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckBadgeIcon className="w-5 h-5 text-[#4F8751]" />
                                                <span>شهادة إتمام</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;

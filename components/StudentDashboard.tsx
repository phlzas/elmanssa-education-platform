
import React, { useState, useEffect } from 'react';
import { Page } from '../App';

interface StudentDashboardProps {
    onNavigate: (page: Page, payload?: { courseId?: number }) => void;
}

interface EnrolledCourse {
    id: number;
    title: string;
    instructor: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    lastAccessed: string;
    image: string;
    nextLesson: string;
}

interface UpcomingSession {
    id: number;
    title: string;
    instructor: string;
    date: string;
    time: string;
    type: 'live' | 'exam' | 'deadline';
}

interface Achievement {
    id: number;
    title: string;
    icon: string;
    date: string;
    description: string;
}

const mockEnrolledCourses: EnrolledCourse[] = [
    {
        id: 1,
        title: 'المسار الشامل لتعلم تطوير الويب Full Stack',
        instructor: 'أحمد العلي',
        progress: 68,
        totalLessons: 120,
        completedLessons: 82,
        lastAccessed: 'قبل ساعتين',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        nextLesson: 'الدرس 83: بناء REST API مع Express.js',
    },
    {
        id: 2,
        title: 'احتراف تصميم واجهات المستخدم UI/UX',
        instructor: 'سارة محمد',
        progress: 42,
        totalLessons: 75,
        completedLessons: 32,
        lastAccessed: 'أمس',
        image: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        nextLesson: 'الدرس 33: مبادئ التصميم المتجاوب',
    },
    {
        id: 4,
        title: 'علم البيانات وتحليل البيج داتا Python',
        instructor: 'د. نور الدين',
        progress: 15,
        totalLessons: 150,
        completedLessons: 23,
        lastAccessed: 'قبل 3 أيام',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        nextLesson: 'الدرس 24: مكتبة Pandas للتحليل',
    },
];

const mockUpcomingSessions: UpcomingSession[] = [
    { id: 1, title: 'ورشة عمل: بناء تطبيق React كامل', instructor: 'أحمد العلي', date: '25 فبراير', time: '18:00', type: 'live' },
    { id: 2, title: 'اختبار منتصف الدورة - UI/UX', instructor: 'سارة محمد', date: '27 فبراير', time: '10:00', type: 'exam' },
    { id: 3, title: 'تسليم مشروع تحليل البيانات', instructor: 'د. نور الدين', date: '1 مارس', time: '23:59', type: 'deadline' },
    { id: 4, title: 'بث مباشر: أسرار التصميم الاحترافي', instructor: 'سارة محمد', date: '3 مارس', time: '20:00', type: 'live' },
];

const mockAchievements: Achievement[] = [
    { id: 1, title: 'أكملت 50 درساً', icon: '🏆', date: 'اليوم', description: 'مبروك! أنجزت 50 درساً بنجاح' },
    { id: 2, title: 'سلسلة 7 أيام', icon: '🔥', date: 'أمس', description: 'حافظت على التعلم لمدة أسبوع متواصل' },
    { id: 3, title: 'أول شهادة', icon: '📜', date: 'قبل أسبوع', description: 'حصلت على شهادتك الأولى في HTML & CSS' },
];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
    const [greeting, setGreeting] = useState('');
    const [activeTab, setActiveTab] = useState<'courses' | 'schedule' | 'achievements'>('courses');
    const [animatedStats, setAnimatedStats] = useState({ hours: 0, courses: 0, streak: 0, certificates: 0 });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('صباح الخير');
        else if (hour < 18) setGreeting('مساء الخير');
        else setGreeting('مساء النور');
    }, []);

    // Animate stats counting
    useEffect(() => {
        const targets = { hours: 127, courses: 3, streak: 7, certificates: 1 };
        const duration = 1500;
        const steps = 30;
        const interval = duration / steps;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const progress = Math.min(step / steps, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedStats({
                hours: Math.round(targets.hours * eased),
                courses: Math.round(targets.courses * eased),
                streak: Math.round(targets.streak * eased),
                certificates: Math.round(targets.certificates * eased),
            });
            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'live': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: '🔴 بث مباشر', dot: 'bg-red-500' };
            case 'exam': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: '📝 اختبار', dot: 'bg-amber-500' };
            case 'deadline': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', label: '⏰ موعد تسليم', dot: 'bg-purple-500' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: '', dot: 'bg-gray-500' };
        }
    };

    return (
        <div className="bg-gradient-to-b from-[#F0F4F8] to-[#FEFEFE] min-h-screen">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-l from-[#034289] to-[#022a5c] text-white py-10 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F8751] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                </div>
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <p className="text-white/70 text-lg mb-1">{greeting} 👋</p>
                            <h1 className="text-3xl md:text-4xl font-black mb-2">عبدالرحمن أحمد</h1>
                            <p className="text-white/60">
                                آخر تسجيل دخول: اليوم الساعة 14:30 • المستوى: <span className="text-[#6ba96d] font-bold">متوسط</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => onNavigate('courses')}
                                className="bg-[#4F8751] hover:bg-[#3d6a3f] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#4F8751]/30 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                استكشف دورات جديدة
                            </button>
                            <button className="bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {[
                            { label: 'ساعات تعلم', value: animatedStats.hours, suffix: 'ساعة', icon: '⏱️', color: 'from-blue-500/20 to-blue-600/20' },
                            { label: 'دورات مسجلة', value: animatedStats.courses, suffix: 'دورات', icon: '📚', color: 'from-green-500/20 to-green-600/20' },
                            { label: 'سلسلة التعلم', value: animatedStats.streak, suffix: 'أيام', icon: '🔥', color: 'from-orange-500/20 to-orange-600/20' },
                            { label: 'شهادات', value: animatedStats.certificates, suffix: 'شهادة', icon: '🏅', color: 'from-purple-500/20 to-purple-600/20' },
                        ].map((stat, idx) => (
                            <div key={idx} className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-2xl p-5 border border-white/10`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl">{stat.icon}</span>
                                    <span className="text-xs text-white/50">{stat.label}</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-black">{stat.value}</div>
                                <span className="text-white/50 text-sm">{stat.suffix}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 -mt-6 relative z-20">
                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#D2E1D9]/30 p-2 mb-8 inline-flex gap-2">
                    {[
                        { key: 'courses' as const, label: 'دوراتي', icon: '📚' },
                        { key: 'schedule' as const, label: 'الجدول', icon: '📅' },
                        { key: 'achievements' as const, label: 'الإنجازات', icon: '🏆' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab.key
                                    ? 'bg-[#034289] text-white shadow-lg shadow-[#034289]/30'
                                    : 'text-[#034289]/60 hover:bg-[#F0F6F2] hover:text-[#034289]'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Courses Tab */}
                {activeTab === 'courses' && (
                    <div className="space-y-6 animate-fade-in-up pb-12">
                        {/* Continue Learning Banner */}
                        <div className="bg-gradient-to-l from-[#4F8751] to-[#3d6a3f] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <span className="text-white/70 text-sm font-medium">أكمل من حيث توقفت 🎯</span>
                                    <h3 className="text-xl md:text-2xl font-bold mt-1">{mockEnrolledCourses[0].nextLesson}</h3>
                                    <p className="text-white/60 mt-1">{mockEnrolledCourses[0].title}</p>
                                </div>
                                <button
                                    onClick={() => onNavigate('course-detail', { courseId: mockEnrolledCourses[0].id })}
                                    className="bg-white text-[#4F8751] px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    تابع المشاهدة
                                </button>
                            </div>
                        </div>

                        {/* Course Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {mockEnrolledCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                                    onClick={() => onNavigate('course-detail', { courseId: course.id })}
                                >
                                    {/* Course Image */}
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#034289]">
                                            {course.lastAccessed}
                                        </div>
                                        <div className="absolute bottom-3 left-3 bg-[#4F8751] text-white px-3 py-1 rounded-full text-xs font-bold">
                                            {course.progress}%
                                        </div>
                                    </div>

                                    {/* Course Info */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-[#034289] mb-1 text-sm leading-relaxed line-clamp-2 group-hover:text-[#4F8751] transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs text-[#034289]/50 mb-4">المدرس: {course.instructor}</p>

                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-[#034289]/60">{course.completedLessons}/{course.totalLessons} درساً</span>
                                                <span className="font-bold text-[#4F8751]">{course.progress}%</span>
                                            </div>
                                            <div className="w-full bg-[#D2E1D9]/30 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-l from-[#4F8751] to-[#6ba96d] transition-all duration-1000 ease-out relative"
                                                    style={{ width: `${course.progress}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Next Lesson */}
                                        <div className="bg-[#F0F6F2] rounded-xl p-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#4F8751] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-xs text-[#034289]/70 truncate">{course.nextLesson}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Course Card */}
                            <div
                                onClick={() => onNavigate('courses')}
                                className="bg-[#F0F6F2] rounded-2xl border-2 border-dashed border-[#4F8751]/30 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-[#4F8751] hover:bg-[#E8F0EA] transition-all duration-300 group min-h-[320px]"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[#4F8751]/10 flex items-center justify-center mb-4 group-hover:bg-[#4F8751]/20 transition-colors">
                                    <svg className="w-8 h-8 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-[#034289] mb-1">أضف دورة جديدة</h3>
                                <p className="text-[#034289]/50 text-sm text-center">استكشف مكتبتنا الغنية بالدورات</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                    <div className="space-y-4 animate-fade-in-up pb-12">
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 overflow-hidden">
                            <div className="p-6 border-b border-[#D2E1D9]/30">
                                <h3 className="text-xl font-bold text-[#034289]">📅 الأحداث القادمة</h3>
                                <p className="text-[#034289]/50 text-sm mt-1">جميع مواعيدك المهمة في مكان واحد</p>
                            </div>
                            <div className="divide-y divide-[#D2E1D9]/30">
                                {mockUpcomingSessions.map((session) => {
                                    const typeStyle = getTypeColor(session.type);
                                    return (
                                        <div key={session.id} className="p-6 flex items-center gap-6 hover:bg-[#F8FAFA] transition-colors group">
                                            {/* Date Badge */}
                                            <div className="flex-shrink-0 text-center">
                                                <div className="bg-[#034289]/5 rounded-2xl p-3 w-20 group-hover:bg-[#034289]/10 transition-colors">
                                                    <div className="text-xs text-[#034289]/50 font-medium">{session.date.split(' ')[1]}</div>
                                                    <div className="text-2xl font-black text-[#034289]">{session.date.split(' ')[0]}</div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border} border`}>
                                                        {typeStyle.label}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-[#034289] mb-0.5 truncate">{session.title}</h4>
                                                <p className="text-sm text-[#034289]/50">{session.instructor} • {session.time}</p>
                                            </div>

                                            {/* Action */}
                                            <button className="flex-shrink-0 bg-[#034289]/5 hover:bg-[#034289] hover:text-white text-[#034289] p-3 rounded-xl transition-all duration-300">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                    <div className="space-y-6 animate-fade-in-up pb-12">
                        {/* Level Progress */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-[#034289]">مستواك الحالي</h3>
                                    <p className="text-[#034289]/50 text-sm">استمر في التعلم للوصول للمستوى التالي</p>
                                </div>
                                <div className="bg-gradient-to-br from-[#034289] to-[#0459b7] text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-2xl font-black">5</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-[#034289]">المستوى 5</span>
                                <div className="flex-1 bg-[#D2E1D9]/30 rounded-full h-4 overflow-hidden">
                                    <div className="h-full bg-gradient-to-l from-[#034289] to-[#0459b7] rounded-full transition-all duration-1000" style={{ width: '65%' }}>
                                        <div className="h-full bg-white/20 animate-pulse rounded-full" />
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-[#034289]/50">المستوى 6</span>
                            </div>
                            <p className="text-xs text-[#034289]/40 mt-2 text-center">أكمل 15 درساً إضافياً للوصول للمستوى التالي</p>
                        </div>

                        {/* Recent Achievements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mockAchievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-6 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="text-4xl bg-[#F0F6F2] w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {achievement.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#034289]">{achievement.title}</h4>
                                            <p className="text-xs text-[#034289]/40">{achievement.date}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#034289]/60">{achievement.description}</p>
                                </div>
                            ))}

                            {/* Locked Achievement */}
                            <div className="bg-[#F8FAFA] rounded-2xl border-2 border-dashed border-[#D2E1D9] p-6 flex flex-col items-center justify-center text-center opacity-60">
                                <div className="text-4xl mb-3">🔒</div>
                                <h4 className="font-bold text-[#034289]/50">إنجاز قادم</h4>
                                <p className="text-xs text-[#034289]/30 mt-1">أكمل 100 درس لفتح هذا الإنجاز</p>
                            </div>
                        </div>

                        {/* Certificates Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-8">
                            <h3 className="text-xl font-bold text-[#034289] mb-6">📜 شهاداتي</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-l from-[#F0F6F2] to-white rounded-xl p-6 border border-[#4F8751]/20 group hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="bg-[#4F8751]/10 text-[#4F8751] text-xs font-bold px-3 py-1 rounded-full">مكتملة ✓</span>
                                        <span className="text-xs text-[#034289]/40">15 يناير 2026</span>
                                    </div>
                                    <h4 className="font-bold text-[#034289] mb-1">أساسيات HTML & CSS</h4>
                                    <p className="text-xs text-[#034289]/50 mb-4">مبادئ بناء صفحات الويب</p>
                                    <button className="text-[#4F8751] font-bold text-sm hover:underline flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        تحميل الشهادة
                                    </button>
                                </div>

                                <div className="bg-[#F8FAFA] rounded-xl p-6 border-2 border-dashed border-[#D2E1D9] flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl mb-2">🎯</span>
                                    <p className="text-[#034289]/50 text-sm">أكمل دوراتك للحصول على المزيد من الشهادات</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;

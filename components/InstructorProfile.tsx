
import React, { useState } from 'react';
import { Page, AccountType } from '../App';
import { MOCK_COURSES } from '../constants';
import StarIcon from './icons/StarIcon';

interface InstructorProfileProps {
    onNavigate: (page: Page, payload?: { accountType?: AccountType; courseId?: number }) => void;
    instructorName?: string;
}

interface InstructorData {
    name: string;
    title: string;
    bio: string;
    avatar: string;
    coverImage: string;
    rating: number;
    totalStudents: number;
    totalCourses: number;
    totalReviews: number;
    specialties: string[];
    social: { platform: string; url: string }[];
    experience: string;
    education: string;
}

const mockInstructor: InstructorData = {
    name: 'أحمد العلي',
    title: 'مطور Full Stack وخبير تعليمي',
    bio: 'مطور ويب بخبرة تزيد عن 10 سنوات في بناء تطبيقات حديثة باستخدام React، Node.js، وتقنيات الويب المتقدمة. شغوف بتعليم البرمجة وتبسيط المفاهيم المعقدة للمبتدئين. قمت بتدريب أكثر من 5000 طالب في مختلف الدول العربية.',
    avatar: 'https://i.pravatar.cc/300?u=instructor_ahmed',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    totalStudents: 5200,
    totalCourses: 8,
    totalReviews: 1847,
    specialties: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'GraphQL', 'Docker'],
    social: [
        { platform: 'تويتر', url: '#' },
        { platform: 'لينكدإن', url: '#' },
        { platform: 'يوتيوب', url: '#' },
        { platform: 'GitHub', url: '#' },
    ],
    experience: '10+ سنوات في تطوير الويب',
    education: 'ماجستير علوم الحاسب - جامعة الملك سعود',
};

const mockReviews = [
    { id: 1, name: 'سعد الحربي', avatar: 'https://i.pravatar.cc/40?u=review1', rating: 5, text: 'أفضل مدرس في المنصة! أسلوب الشرح واضح ومبسط جداً. استفدت كثيراً من الدورة.', date: 'قبل أسبوع', course: 'تطوير الويب Full Stack' },
    { id: 2, name: 'ريم الشهري', avatar: 'https://i.pravatar.cc/40?u=review2', rating: 5, text: 'المحتوى عملي ومحدث، والمشاريع التطبيقية ممتازة. أنصح الجميع بهذه الدورة.', date: 'قبل أسبوعين', course: 'تطوير الويب Full Stack' },
    { id: 3, name: 'خالد المطيري', avatar: 'https://i.pravatar.cc/40?u=review3', rating: 4, text: 'شرح رائع ومنهج منظم، أتمنى المزيد من المشاريع العملية المتقدمة.', date: 'قبل شهر', course: 'أساسيات JavaScript' },
];

const InstructorProfile: React.FC<InstructorProfileProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'courses' | 'reviews' | 'about'>('courses');
    const instructorCourses = MOCK_COURSES.filter(c => c.instructor === mockInstructor.name);

    return (
        <div className="bg-[#F8FAFA] min-h-screen">
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                    src={mockInstructor.coverImage}
                    alt="cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#034289]/90 via-[#034289]/40 to-transparent" />
            </div>

            {/* Profile Header */}
            <div className="container mx-auto max-w-6xl px-4 -mt-24 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl border border-[#D2E1D9]/30 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Avatar */}
                        <div className="relative -mt-20 md:-mt-24">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-white shadow-2xl">
                                <img
                                    src={mockInstructor.avatar}
                                    alt={mockInstructor.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -left-2 bg-[#4F8751] text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                                ⭐ {mockInstructor.rating}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-right">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h1 className="text-2xl md:text-3xl font-black text-[#034289]">{mockInstructor.name}</h1>
                                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-[#4F8751] font-semibold mb-2">{mockInstructor.title}</p>
                            <p className="text-[#034289]/50 text-sm max-w-2xl">{mockInstructor.bio}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 md:gap-8 text-center">
                            {[
                                { label: 'طالب', value: mockInstructor.totalStudents.toLocaleString() },
                                { label: 'دورة', value: mockInstructor.totalCourses },
                                { label: 'تقييم', value: mockInstructor.totalReviews.toLocaleString() },
                            ].map((stat, idx) => (
                                <div key={idx}>
                                    <div className="text-2xl font-black text-[#034289]">{stat.value}</div>
                                    <div className="text-xs text-[#034289]/40">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Specialties */}
                    <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
                        {mockInstructor.specialties.map((spec, idx) => (
                            <span
                                key={idx}
                                className="bg-[#F0F6F2] text-[#4F8751] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#4F8751]/20"
                            >
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-8 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-2 inline-flex gap-2">
                        {[
                            { key: 'courses' as const, label: 'الدورات', icon: '📚' },
                            { key: 'reviews' as const, label: 'التقييمات', icon: '⭐' },
                            { key: 'about' as const, label: 'نبذة', icon: '👤' },
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
                </div>

                {/* Tab Content */}
                <div className="pb-16">
                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                            {instructorCourses.length > 0 ? instructorCourses.map((course) => (
                                <div
                                    key={course.id}
                                    onClick={() => onNavigate('course-detail', { courseId: course.id })}
                                    className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#034289]">
                                            {course.category}
                                        </div>
                                        {course.price === 'free' && (
                                            <div className="absolute top-3 right-3 bg-[#4F8751] text-white px-3 py-1 rounded-full text-xs font-bold">
                                                مجاناً
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-[#034289] mb-2 group-hover:text-[#4F8751] transition-colors line-clamp-2">{course.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-[#034289]/50 mb-3">
                                            <span className="flex items-center gap-1">
                                                <StarIcon className="w-4 h-4 text-yellow-400" />
                                                {course.rating}
                                            </span>
                                            <span>{course.students.toLocaleString()} طالب</span>
                                            <span>{course.duration} ساعة</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-black text-[#4F8751]">
                                                {course.price === 'free' ? 'مجاناً' : `${course.price} ر.س`}
                                            </span>
                                            <button className="text-[#034289] font-bold text-sm hover:text-[#4F8751] transition-colors">
                                                عرض التفاصيل ←
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-3 text-center py-16">
                                    <div className="text-6xl mb-4">📚</div>
                                    <h3 className="text-xl font-bold text-[#034289] mb-2">جاري إضافة الدورات</h3>
                                    <p className="text-[#034289]/50">سيتم إضافة دورات جديدة قريباً</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-4 animate-fade-in-up">
                            {/* Rating Summary */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-8 mb-6">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-6xl font-black text-[#034289]">{mockInstructor.rating}</div>
                                        <div className="flex items-center gap-1 justify-center my-2">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(mockInstructor.rating) ? 'text-yellow-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-[#034289]/50">{mockInstructor.totalReviews} تقييم</p>
                                    </div>
                                    <div className="flex-1 w-full space-y-2">
                                        {[
                                            { stars: 5, percent: 78 },
                                            { stars: 4, percent: 15 },
                                            { stars: 3, percent: 5 },
                                            { stars: 2, percent: 1 },
                                            { stars: 1, percent: 1 },
                                        ].map((bar) => (
                                            <div key={bar.stars} className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-[#034289]/60 w-8 text-center">{bar.stars}</span>
                                                <StarIcon className="w-4 h-4 text-yellow-400" />
                                                <div className="flex-1 bg-[#D2E1D9]/30 rounded-full h-2.5 overflow-hidden">
                                                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${bar.percent}%` }} />
                                                </div>
                                                <span className="text-xs text-[#034289]/40 w-10 text-left">{bar.percent}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Reviews List */}
                            {mockReviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-6 hover:shadow-md transition-all">
                                    <div className="flex items-start gap-4">
                                        <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-[#034289]">{review.name}</h4>
                                                <span className="text-xs text-[#034289]/40">{review.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className="text-[#034289]/70 text-sm leading-relaxed">{review.text}</p>
                                            <span className="text-xs text-[#4F8751] mt-2 inline-block">📚 {review.course}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                            <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-8">
                                <h3 className="text-xl font-bold text-[#034289] mb-6">👨‍💻 معلومات شخصية</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'الاسم الكامل', value: mockInstructor.name },
                                        { label: 'المسمى الوظيفي', value: mockInstructor.title },
                                        { label: 'الخبرة', value: mockInstructor.experience },
                                        { label: 'التعليم', value: mockInstructor.education },
                                    ].map((info, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-3 border-b border-[#D2E1D9]/30 last:border-0">
                                            <span className="text-[#034289]/50 text-sm">{info.label}</span>
                                            <span className="font-semibold text-[#034289] text-sm text-left">{info.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-8">
                                <h3 className="text-xl font-bold text-[#034289] mb-6">🌐 التواصل الاجتماعي</h3>
                                <div className="space-y-3">
                                    {mockInstructor.social.map((s, idx) => (
                                        <a
                                            key={idx}
                                            href={s.url}
                                            className="flex items-center justify-between p-4 rounded-xl bg-[#F0F6F2] hover:bg-[#D2E1D9]/50 transition-colors group"
                                        >
                                            <span className="font-semibold text-[#034289] group-hover:text-[#4F8751]">{s.platform}</span>
                                            <svg className="w-4 h-4 text-[#034289]/30 group-hover:text-[#4F8751] group-hover:-translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-gradient-to-l from-[#034289] to-[#022a5c] rounded-2xl p-8 text-white shadow-xl">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">هل ترغب بالتعلم مع {mockInstructor.name}؟</h3>
                                        <p className="text-white/60">انضم لآلاف الطلاب وابدأ رحلتك التعليمية اليوم</p>
                                    </div>
                                    <button
                                        onClick={() => onNavigate('courses')}
                                        className="bg-[#4F8751] hover:bg-[#3d6a3f] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#4F8751]/30 hover:shadow-xl hover:-translate-y-0.5"
                                    >
                                        استكشف دوراته
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorProfile;

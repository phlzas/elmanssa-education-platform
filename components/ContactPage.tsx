
import React, { useState } from 'react';
import { Page } from '../App';
import { sendContactMessage } from '../api/content.api';

interface ContactPageProps {
    onNavigate: (page: Page) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendContactMessage(formData);
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error('Submission failed', error);
            // optionally handle visual error
        }
    };

    const contactMethods = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: 'البريد الإلكتروني',
            detail: 'support@elmanssa.com',
            desc: 'نرد خلال 24 ساعة',
            color: 'from-blue-500/10 to-blue-600/10',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-600',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: 'الهاتف',
            detail: '+966 50 123 4567',
            desc: 'من الأحد إلى الخميس، 9ص - 6م',
            color: 'from-green-500/10 to-green-600/10',
            borderColor: 'border-green-200',
            textColor: 'text-green-600',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: 'الموقع',
            detail: 'الرياض، المملكة العربية السعودية',
            desc: 'مقرنا الرئيسي',
            color: 'from-purple-500/10 to-purple-600/10',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-600',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            title: 'الدردشة المباشرة',
            detail: 'ابدأ محادثة الآن',
            desc: 'متاح على مدار الساعة',
            color: 'from-amber-500/10 to-amber-600/10',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-600',
        },
    ];

    return (
        <div className="bg-gradient-to-b from-[#F0F4F8] to-[#FEFEFE] min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-l from-[#034289] to-[#022a5c] text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F8751] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                </div>
                <div className="container mx-auto max-w-5xl relative z-10 text-center">
                    <span className="inline-block bg-white/10 backdrop-blur-sm text-white font-bold text-sm px-5 py-2 rounded-full mb-6 border border-white/20">
                        تواصل معنا
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">نحن هنا <span className="text-[#6ba96d]">لمساعدتك</span></h1>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        لديك سؤال أو استفسار؟ فريقنا جاهز لمساعدتك في أي وقت. تواصل معنا عبر أي من القنوات التالية.
                    </p>
                </div>
            </div>

            {/* Contact Methods */}
            <div className="container mx-auto max-w-6xl px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {contactMethods.map((method, idx) => (
                        <div
                            key={idx}
                            className={`bg-white rounded-2xl p-6 shadow-lg border ${method.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 ${method.textColor} group-hover:scale-110 transition-transform`}>
                                {method.icon}
                            </div>
                            <h3 className="font-bold text-[#034289] mb-1">{method.title}</h3>
                            <p className={`font-semibold text-sm ${method.textColor} mb-1`}>{method.detail}</p>
                            <p className="text-xs text-[#034289]/40">{method.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-3xl shadow-lg border border-[#D2E1D9]/30 p-8 md:p-10">
                            <h2 className="text-2xl font-black text-[#034289] mb-2">أرسل رسالتك</h2>
                            <p className="text-[#034289]/50 mb-8">سنتواصل معك في أقرب وقت ممكن</p>

                            {submitted ? (
                                <div className="text-center py-12 animate-fade-in-up">
                                    <div className="w-20 h-20 bg-[#4F8751]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#034289] mb-2">تم إرسال رسالتك بنجاح! ✉️</h3>
                                    <p className="text-[#034289]/50">سيتم الرد عليك خلال 24 ساعة عمل</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Message Type */}
                                    <div>
                                        <label className="block text-sm font-bold text-[#034289] mb-3">نوع الرسالة</label>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { value: 'general', label: 'استفسار عام' },
                                                { value: 'technical', label: 'دعم فني' },
                                                { value: 'billing', label: 'الفواتير' },
                                                { value: 'partnership', label: 'شراكة' },
                                            ].map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: type.value })}
                                                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${formData.type === type.value
                                                        ? 'bg-[#034289] text-white shadow-lg shadow-[#034289]/30'
                                                        : 'bg-[#F0F6F2] text-[#034289]/60 hover:bg-[#D2E1D9] hover:text-[#034289]'
                                                        }`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Name & Email */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-[#034289] mb-2">الاسم الكامل</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="أدخل اسمك"
                                                className="w-full px-5 py-3 rounded-xl border border-[#D2E1D9] bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 focus:outline-none focus:border-[#4F8751] focus:ring-2 focus:ring-[#4F8751]/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#034289] mb-2">البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="example@email.com"
                                                className="w-full px-5 py-3 rounded-xl border border-[#D2E1D9] bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 focus:outline-none focus:border-[#4F8751] focus:ring-2 focus:ring-[#4F8751]/20 transition-all"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-bold text-[#034289] mb-2">الموضوع</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="عنوان الرسالة"
                                            className="w-full px-5 py-3 rounded-xl border border-[#D2E1D9] bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 focus:outline-none focus:border-[#4F8751] focus:ring-2 focus:ring-[#4F8751]/20 transition-all"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-bold text-[#034289] mb-2">الرسالة</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="اكتب رسالتك هنا..."
                                            className="w-full px-5 py-3 rounded-xl border border-[#D2E1D9] bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 focus:outline-none focus:border-[#4F8751] focus:ring-2 focus:ring-[#4F8751]/20 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="btn-primary w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            إرسال الرسالة
                                            <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Help */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-6">
                            <h3 className="text-lg font-bold text-[#034289] mb-4">🔗 روابط مفيدة</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'مركز المساعدة', page: 'support' as Page, icon: '📖' },
                                    { label: 'الأسئلة الشائعة', page: 'support' as Page, icon: '❓' },
                                    { label: 'سياسة الخصوصية', page: 'privacy' as Page, icon: '🔒' },
                                    { label: 'خطط الأسعار', page: 'pricing' as Page, icon: '💰' },
                                ].map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onNavigate(link.page)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0F6F2] transition-colors text-right group"
                                    >
                                        <span className="text-xl">{link.icon}</span>
                                        <span className="text-[#034289] font-medium group-hover:text-[#4F8751] transition-colors">{link.label}</span>
                                        <svg className="w-4 h-4 text-[#D2E1D9] mr-auto group-hover:text-[#4F8751] group-hover:-translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/30 p-6">
                            <h3 className="text-lg font-bold text-[#034289] mb-4">📱 تابعنا</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { name: 'تويتر', icon: '𝕏', color: 'bg-gray-900' },
                                    { name: 'يوتيوب', icon: '▶', color: 'bg-red-600' },
                                    { name: 'انستغرام', icon: '📸', color: 'bg-gradient-to-br from-purple-600 to-pink-500' },
                                    { name: 'لينكدإن', icon: 'in', color: 'bg-blue-700' },
                                ].map((social, idx) => (
                                    <button
                                        key={idx}
                                        className={`${social.color} text-white rounded-xl p-3 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:scale-105 transition-all shadow-sm`}
                                    >
                                        <span className="text-base">{social.icon}</span>
                                        {social.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Working Hours */}
                        <div className="bg-gradient-to-br from-[#034289] to-[#022a5c] rounded-2xl p-6 text-white shadow-xl">
                            <h3 className="text-lg font-bold mb-4">🕐 ساعات العمل</h3>
                            <div className="space-y-3">
                                {[
                                    { day: 'الأحد - الخميس', hours: '9:00 ص - 6:00 م' },
                                    { day: 'الجمعة', hours: 'مغلق' },
                                    { day: 'السبت', hours: '10:00 ص - 2:00 م' },
                                ].map((schedule, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                                        <span className="text-white/70 text-sm">{schedule.day}</span>
                                        <span className="font-bold text-sm">{schedule.hours}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl p-3">
                                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-sm text-white/80">الدعم الفني متاح حالياً</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;


import React, { useState } from 'react';
import { Page } from '../App';

interface SupportPageProps {
    onNavigate: (page: Page) => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
    const categories = [
        { title: 'أسئلة الحساب', icon: '👤', desc: 'إدارة ملفك الشخصي وكلمة المرور' },
        { title: 'الدورات والشهادات', icon: '🎓', desc: 'كل ما يخص التحديثات والشهادات' },
        { title: 'الدفع والاشتراكات', icon: '💳', desc: 'إدارة الاشتراكات والفواتير' },
        { title: 'مشاكل تقنية', icon: '🔧', desc: 'حلول للمشاكل الشائعة' },
    ];

    const faqs = [
        { q: 'كيف أحصل على الشهادة؟', a: 'بعد الانتهاء من جميع دروس الدورة واجتياز الاختبار النهائي بنسبة نجاح 80%، ستتمكن من تحميل الشهادة مباشرة من صفحة الدورة.' },
        { q: 'هل يمكنني استرداد أموالي؟', a: 'نعم، نقدم ضمان استرداد الأموال لمدة 30 يوماً إذا لم تكن راضياً عن الدورة، بشرط ألا تكون قد أنهيت أكثر من 30% من محتواها.' },
        { q: 'هل يمكنني مشاهدة الدروس بدون إنترنت؟', a: 'حالياً، هذه الميزة متاحة فقط عبر تطبيق الهاتف الجوال الخاص بنا.' },
    ];

    return (
        <div className="bg-[#F8FAFA] min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-4xl font-black text-[#034289] mb-6 text-center">مركز المساعدة</h1>
                <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9] p-8 mb-12">
                    <div className="relative">
                        <input type="text" placeholder="كيف يمكننا مساعدتك اليوم؟" className="w-full pl-4 pr-12 py-3 border rounded-xl text-lg focus:outline-none focus:border-[#4F8751] bg-[#F8FAFA] shadow-inner" />
                        <svg className="w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-[#D2E1D9] hover:border-[#4F8751] hover:shadow-md transition-all cursor-pointer group flex items-start gap-4">
                            <span className="text-3xl bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#4F8751]/10 group-hover:text-[#4F8751] transition-colors">{cat.icon}</span>
                            <div>
                                <h3 className="text-lg font-bold text-[#034289] mb-1">{cat.title}</h3>
                                <p className="text-gray-500 text-sm">{cat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-[#034289] mb-6">الأسئلة الشائعة</h2>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-[#D2E1D9] overflow-hidden">
                            <div className="p-6">
                                <h3 className="font-bold text-[#034289] mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SupportPage;

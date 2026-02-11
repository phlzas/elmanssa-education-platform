
import React from 'react';
import { Page } from '../App';
import CheckBadgeIcon from './icons/CheckBadgeIcon';

interface PricingPageProps {
    onNavigate: (page: Page) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-[#F8FAFA] min-h-screen py-20 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-[#034289] mb-4">خطط تناسب طموحك</h1>
                    <p className="text-[#034289]/60 text-lg max-w-2xl mx-auto">
                        اختر الخطة المثالية لتبدأ رحلة التعلم. سواء كنت مبتدئاً أو محترفاً، لدينا ما يناسبك.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#D2E1D9] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 group-hover:bg-[#034289] transition-colors" />
                        <h3 className="text-2xl font-bold text-[#034289] mb-2">الأساسية</h3>
                        <div className="text-4xl font-black text-[#034289] mb-6">مجاناً<span className="text-base font-normal text-gray-400">/للأبد</span></div>
                        <p className="text-gray-500 mb-8">بداية مثالية لاستكشاف عالم البرمجة.</p>
                        <button onClick={() => onNavigate('signup')} className="w-full py-3 border-2 border-[#034289] text-[#034289] font-bold rounded-xl hover:bg-[#034289] hover:text-white transition-colors mb-8">
                            سجل مجاناً
                        </button>
                        <ul className="space-y-4">
                            {['الوصول للكورسات المجانية', 'مشاهدة البث المباشر (محدود)', 'دعم المجتمع'].map((feat, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-gray-600">
                                    <CheckBadgeIcon className="w-5 h-5 text-gray-300" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-[#034289] rounded-2xl p-8 shadow-2xl border border-[#034289] transform md:-translate-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-[#4F8751] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">الأكثر طلباً</div>
                        <h3 className="text-2xl font-bold text-white mb-2">الاحترافية</h3>
                        <div className="text-4xl font-black text-white mb-6">299<span className="text-base font-normal text-white/60">/شهرياً</span></div>
                        <p className="text-white/70 mb-8">كل ما تحتاجه لتصبح محترفاً في مجالك.</p>
                        <button onClick={() => onNavigate('signup')} className="w-full py-3 bg-[#4F8751] text-white font-bold rounded-xl hover:bg-[#3d6a3f] transition-colors mb-8 shadow-lg shadow-[#4F8751]/30">
                            اشترك الآن
                        </button>
                        <ul className="space-y-4">
                            {['كل مميزات الخطة المجانية', 'الوصول لجميع الكورسات', 'مشاهدة البث المباشر بلا حدود', 'شهادات إتمام معتمدة', 'مساعد AI ذكي', 'دعم فني مباشر'].map((feat, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-white">
                                    <CheckBadgeIcon className="w-5 h-5 text-[#4F8751]" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Business Plan */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#D2E1D9] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 group-hover:bg-[#4F8751] transition-colors" />
                        <h3 className="text-2xl font-bold text-[#034289] mb-2">للشركات</h3>
                        <div className="text-4xl font-black text-[#034289] mb-6">تواصل<span className="text-base font-normal text-gray-400">/معنا</span></div>
                        <p className="text-gray-500 mb-8">حلول مخصصة لتدريب فرق العمل.</p>
                        <button onClick={() => onNavigate('about')} className="w-full py-3 border-2 border-[#4F8751] text-[#4F8751] font-bold rounded-xl hover:bg-[#4F8751] hover:text-white transition-colors mb-8">
                            تواصل معنا
                        </button>
                        <ul className="space-y-4">
                            {['لوحة تحكم للمدراء', 'تتبع تقدم الموظفين', 'مسارات تعليمية مخصصة', 'دعم فني مخصص', 'فواتير ضريبية'].map((feat, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-gray-600">
                                    <CheckBadgeIcon className="w-5 h-5 text-[#4F8751]" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;


import React from 'react';
import { Page } from '../App';
import Logo from './Logo';

interface AboutPageProps {
    onNavigate: (page: Page) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
    return (
        <div dir="rtl" className="bg-white min-h-screen font-cairo">
            {/* Hero Section */}
            <div className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#034289] to-[#022a5c] text-white">
                <div className="absolute inset-0 dots-pattern opacity-10" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F8751]/20 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 animate-fade-in-up">
                        نحن نبني <span className="text-[#4F8751]">مستقبل التعليم</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        منصة المنصة هي وجهتك الأولى للتعلم الاحترافي وتطوير المهارات في الوطن العربي.
                    </p>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="py-20 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-[#4F8751]/10 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-[#034289]">مهمتنا</h2>
                        <p className="text-lg text-[#034289]/70 leading-relaxed">
                            تمكين الشباب العربي من خلال توفير تعليم عالي الجودة ومحتوى احترافي يساعدهم على المنافسة في سوق العمل العالمي. نحن نؤمن بأن التعليم حق للجميع، ونسعى لجعله متاحاً وممتعاً.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#034289] to-[#4F8751] rounded-3xl transform rotate-3 opacity-20" />
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="فريق العمل يتعاون معاً في بيئة تعليمية"
                            className="relative rounded-3xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="bg-[#F8FAFA] py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#034289] mb-4">قيمنا الجوهرية</h2>
                        <p className="text-[#034289]/60">ما يحركنا ويوجه عملنا كل يوم</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'الجودة أولاً',
                                desc: 'نهتم بأدق التفاصيل لتقديم تجربة تعليمية لا تضاهى.',
                                icon: (
                                    <svg className="w-8 h-8 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'الابتكار المستمر',
                                desc: 'نسعى دائماً لتطوير أدواتنا وطرق التدريس.',
                                icon: (
                                    <svg className="w-8 h-8 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'المجتمع',
                                desc: 'نحن أكثر من منصة، نحن مجتمع يدعم بعضه البعض.',
                                icon: (
                                    <svg className="w-8 h-8 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                    </svg>
                                ),
                            },
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-[#D2E1D9]/50 hover:shadow-lg transition-all duration-300 text-center">
                                <div className="w-16 h-16 bg-[#4F8751]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#034289] mb-3">{value.title}</h3>
                                <p className="text-[#034289]/70">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team CTA */}
            <div className="py-20 container mx-auto px-4 text-center">
                <div className="bg-gradient-to-r from-[#034289] to-[#0459b7] rounded-3xl p-12 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">تواصل معنا</h2>
                        <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                            هل لديك استفسار أو اقتراح؟ نحن هنا للاستماع إليك ومساعدتك في رحلتك التعليمية.
                        </p>
                        <button
                            onClick={() => onNavigate('contact')}
                            className="px-8 py-3 bg-white text-[#034289] font-bold rounded-xl hover:bg-[#D2E1D9] transition-colors duration-200 flex items-center gap-2 mx-auto cursor-pointer">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            تواصل معنا الآن
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F8751]/20 rounded-full blur-3xl md:-mr-32 md:-mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4F8751]/20 rounded-full blur-3xl md:-ml-32 md:-mb-32" />
                </div>
            </div>
        </div>
    );
};

export default AboutPage;

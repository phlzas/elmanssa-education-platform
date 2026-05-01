import React from 'react';
import { Page } from '../App';

interface LiveStreamPageProps {
    onNavigate: (page: Page) => void;
}

const LiveStreamPage: React.FC<LiveStreamPageProps> = ({ onNavigate }) => {
    return (
        <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#F0F4F8] to-[#FEFEFE] flex flex-col items-center justify-center px-4 text-center">
            {/* Animated icon */}
            <div className="relative mb-8">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#034289]/10 to-[#4F8751]/10 flex items-center justify-center">
                    <svg className="w-14 h-14 text-[#034289]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full border-2 border-[#034289]/20 animate-ping" />
            </div>

            {/* Badge */}
            <span className="inline-block bg-amber-100 text-amber-700 font-bold text-sm px-4 py-1.5 rounded-full mb-5 border border-amber-200">
                قريباً
            </span>

            <h1 className="text-3xl md:text-4xl font-black text-[#034289] mb-4">
                البث المباشر
            </h1>
            <p className="text-[#034289]/60 text-lg max-w-md mb-2">
                هذه الميزة قيد الإنشاء حالياً
            </p>
            <p className="text-[#034289]/40 text-sm max-w-sm mb-10">
                نعمل بجد لإتاحة البث المباشر قريباً. ترقّب التحديثات!
            </p>

            {/* Progress bar decoration */}
            <div className="w-64 h-2 bg-[#034289]/10 rounded-full overflow-hidden mb-10">
                <div className="h-full w-2/3 bg-gradient-to-r from-[#034289] to-[#4F8751] rounded-full animate-pulse" />
            </div>

            <button
                onClick={() => onNavigate('home')}
                className="btn-primary px-8 py-3 text-white font-bold rounded-xl shadow-lg cursor-pointer transition-colors duration-200"
            >
                العودة للرئيسية
            </button>
        </div>
    );
};

export default LiveStreamPage;

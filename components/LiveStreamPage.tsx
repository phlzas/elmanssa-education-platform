
import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../App';

interface LiveStreamPageProps {
    onNavigate: (page: Page) => void;
}

interface ChatMessage {
    id: number;
    user: string;
    avatar: string;
    message: string;
    timestamp: string;
    isMe?: boolean;
}

interface UpcomingStream {
    id: number;
    title: string;
    instructor: string;
    date: string;
    time: string;
    duration: string;
}

const MOCK_CHAT: ChatMessage[] = [
    { id: 1, user: 'أحمد محمد', avatar: 'https://i.pravatar.cc/150?u=1', message: 'شرح ممتاز، شكراً لك أستاذ!', timestamp: '10:25' },
    { id: 2, user: 'سارة علي', avatar: 'https://i.pravatar.cc/150?u=2', message: 'هل يمكن إعادة شرح النقطة الأخيرة؟', timestamp: '10:24' },
    { id: 3, user: 'محمد خالد', avatar: 'https://i.pravatar.cc/150?u=3', message: 'ممكن رابط المصادر المذكورة؟', timestamp: '10:23' },
    { id: 4, user: 'فاطمة حسن', avatar: 'https://i.pravatar.cc/150?u=4', message: 'رائع! استفدت كثيراً', timestamp: '10:22' },
    { id: 5, user: 'عمر يوسف', avatar: 'https://i.pravatar.cc/150?u=5', message: 'مرحباً بالجميع', timestamp: '10:20' },
];

const UPCOMING_STREAMS: UpcomingStream[] = [
    { id: 1, title: 'ورشة عمل: بناء تطبيق React متكامل', instructor: 'أحمد محمد', date: 'اليوم', time: '18:00', duration: '150 دقيقة' },
    { id: 2, title: 'جلسة أسئلة وأجوبة - JavaScript', instructor: 'محمد علي', date: 'غداً', time: '20:00', duration: '95 دقيقة' },
    { id: 3, title: 'تصميم واجهات المستخدم الحديثة', instructor: 'سارة أحمد', date: '2026-02-08', time: '15:00', duration: '120 دقيقة' },
];

const LiveStreamPage: React.FC<LiveStreamPageProps> = ({ onNavigate }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            const { scrollHeight, clientHeight } = chatContainerRef.current;
            chatContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg: ChatMessage = {
            id: Date.now(),
            user: 'أنت',
            avatar: 'https://i.pravatar.cc/150?u=me',
            message: newMessage,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            isMe: true,
        };

        setMessages([...messages, msg]);
        setNewMessage('');
    };

    return (
        <div className="bg-[#F8FAFA] min-h-screen py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Right Column: Main Video Content (Taking 2/3 width on LG) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player Container */}
                        <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video group">
                            {/* Video Placeholder */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#022a5c] to-[#034289] flex items-center justify-center">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <div className="w-16 h-16 bg-[#4F8751] rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-white/60 font-medium tracking-wider">جاري التحميل...</p>
                                </div>
                            </div>

                            {/* LIVE Badge */}
                            <div className="absolute top-6 left-6 z-10">
                                <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    LIVE
                                </div>
                            </div>

                            {/* Viewers Count Overlay */}
                            <div className="absolute top-6 right-6 z-10 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 text-sm font-medium flex items-center gap-2 border border-white/10">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                247 مشاهد
                            </div>

                            {/* Controls Overlay (Mock) */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-white">
                                        <button className="hover:text-[#4F8751] transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg></button>
                                        <button className="hover:text-[#4F8751] transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg></button>
                                        <span className="text-sm font-medium">25:00 / 1:30:00</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-white">
                                        <button className="hover:text-[#4F8751] transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                                        <button className="hover:text-[#4F8751] transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full h-1 bg-white/30 rounded-full mt-4 cursor-pointer overflow-hidden">
                                    <div className="h-full w-[25%] bg-[#4F8751] relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stream Details & Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-[#034289] to-[#4F8751]">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Instructor" className="w-full h-full rounded-full border-2 border-white object-cover" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-[#034289] mb-1">ورشة عمل: بناء تطبيق React متكامل</h1>
                                    <p className="text-[#034289]/60 font-medium">بدأ البث منذ 25 دقيقة</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-sm font-bold text-[#4F8751]">أحمد محمد</span>
                                        <span className="px-2 py-0.5 bg-[#D2E1D9]/30 rounded text-xs text-[#034289]/70">مطور ويب محترف</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#034289] text-white rounded-xl font-bold hover:bg-[#022a5c] transition-colors shadow-lg shadow-[#034289]/20">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    مشاركة
                                </button>
                                <button className="flex items-center justify-center p-3 border-2 border-[#D2E1D9] rounded-xl text-[#034289] hover:border-[#4F8751] hover:text-[#4F8751] transition-all">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/50 p-6">
                            <h3 className="text-xl font-bold text-[#034289] mb-3">عن هذا البث</h3>
                            <p className="text-[#034289]/70 leading-relaxed">
                                في هذه الورشة سنتعلم كيفية بناء تطبيق React متكامل من الصفر، مع التركيز على أفضل الممارسات والأدوات الحديثة. سنغطي مواضيع مثل React Hooks, Routing, State Management, والتعامل مع APIs.
                            </p>
                        </div>
                    </div>

                    {/* Left Column: Sidebar (Chat & Upcoming) */}
                    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] lg:sticky lg:top-24">
                        {/* Live Chat Component */}
                        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-[#D2E1D9]/50 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-[#D2E1D9]/50 bg-[#F8FAFA] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#4F8751] rounded-full animate-pulse"></div>
                                    <h3 className="font-bold text-[#034289]">الدردشة المباشرة</h3>
                                </div>
                                <span className="text-xs text-[#034289]/50 bg-white px-2 py-1 rounded border border-[#D2E1D9]">5 رسالة</span>
                            </div>

                            {/* Messages Area */}
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                        <img src={msg.avatar} alt={msg.user} className="w-8 h-8 rounded-full border border-[#D2E1D9]" />
                                        <div className={`max-w-[85%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className={`p-3 rounded-2xl ${msg.isMe
                                                ? 'bg-gradient-to-r from-[#034289] to-[#0459b7] text-white rounded-tl-none'
                                                : 'bg-[#F8FAFA] border border-[#D2E1D9] text-[#034289] rounded-tr-none'
                                                }`}>
                                                {!msg.isMe && <p className="text-xs font-bold text-[#4F8751] mb-1">{msg.user}</p>}
                                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                            </div>
                                            <span className="text-[10px] text-[#034289]/40 mt-1 px-1">{msg.timestamp}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-[#D2E1D9]/50 bg-white">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="اكتب رسالتك..."
                                        className="flex-1 bg-[#F8FAFA] border border-[#D2E1D9] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4F8751] text-[#034289] placeholder:text-[#034289]/40"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-[#4F8751] hover:bg-[#3d6a3f] text-white p-3 rounded-xl transition-colors shadow-lg shadow-[#4F8751]/20"
                                    >
                                        <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>


                        {/* Upcoming Streams */}
                        <div className="bg-white rounded-2xl shadow-lg border border-[#D2E1D9]/50 p-5 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F8751]/5 rounded-full blur-3xl"></div>

                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10 text-[#034289]">
                                <svg className="w-5 h-5 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                البث القادم
                            </h3>

                            <div className="space-y-3 relative z-10">
                                {UPCOMING_STREAMS.map((stream) => (
                                    <div key={stream.id} className="group flex items-center justify-between p-3 rounded-xl bg-[#F8FAFA] hover:bg-[#f0f4f4] border border-[#D2E1D9]/50 hover:border-[#4F8751]/30 transition-all cursor-pointer">
                                        <div className="flex-1">
                                            <p className="font-bold text-sm mb-1 text-[#034289] group-hover:text-[#4F8751] transition-colors line-clamp-1">{stream.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-[#034289]/60">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-4 h-4 rounded-full bg-[#034289] text-white flex items-center justify-center text-[10px] font-bold">
                                                        {stream.instructor.charAt(0)}
                                                    </div>
                                                    <span>{stream.instructor}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left shrink-0 ml-2">
                                            <div className="flex items-center gap-1 text-xs text-[#4F8751] font-bold mb-1 justify-end">
                                                <span>{stream.date}</span>
                                                <span className="w-1 h-1 bg-[#D2E1D9] rounded-full"></span>
                                                <span>{stream.time}</span>
                                            </div>
                                            <p className="text-[10px] text-[#034289]/40">{stream.duration}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveStreamPage;


import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../App';
import { startAIConversation, sendAIMessage } from '../services/api';

interface AIPageProps {
    onNavigate: (page: Page) => void;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
}

const AIPage: React.FC<AIPageProps> = ({ onNavigate }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'مرحباً! أنا مساعدك الذكي في منصة التعليم. كيف يمكنني مساعدتك اليوم؟ يمكنني اقتراح دورات مناسبة، الإجابة على أسئلتك، أو مساعدتك في التخطيط لمسارك التعليمي.',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initConv = async () => {
            try {
                const data = await startAIConversation();
                if (data && data.id) {
                    setConversationId(data.id);
                }
            } catch (err) {
                console.error('Failed to init AI conversation', err);
            }
        };
        initConv();
    }, []);

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
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const userMsg: Message = {
            id: Date.now(),
            text: userText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        if (conversationId) {
            // Indicate loading typing...
            const loadingId = Date.now() + 1;
            setMessages(prev => [...prev, {
                id: loadingId,
                text: 'جاري التفكير...',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            }]);

            sendAIMessage(conversationId, userText)
                .then((res) => {
                    const aiText = res?.message || res?.text || res?.content || 'عذراً، حدث خطأ أثناء معالجة الرد.';
                    setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, text: aiText } : m));
                })
                .catch((err) => {
                    console.error(err);
                    setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, text: 'تعذر الاتصال بالخادم للإجابة على سؤالك.' } : m));
                });
        }
    };

    return (
        <div className="bg-[#FEFEFE] min-h-screen text-[#034289]">
            {/* Hero Header */}
            <div className="bg-[#034289] text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 dots-pattern opacity-10" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F8751]/20 rounded-full blur-3xl opacity-50" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm animate-bounce-slow">
                        <svg className="w-8 h-8 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2">مساعد الذكاء الاصطناعي</h1>
                    <p className="text-white/70 text-lg">مساعدك الشخصي الذكي في رحلتك التعليمية</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar (Recommendations) - Right Side in RTL */}
                    <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">

                        {/* Recommended Courses Widget */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/50 overflow-hidden">
                            <div className="bg-[#F8FAFA] p-4 border-b border-[#D2E1D9]/50 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    توصيات مخصصة لك
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {[
                                    { title: 'تطوير تطبيقات الويب الحديثة', match: 95, level: 'مناسب لمستواك' },
                                    { title: 'أساسيات البرمجة بلغة Python', match: 88, level: 'شائع في مجالك' },
                                    { title: 'تصميم واجهات المستخدم UI/UX', match: 82, level: 'يكمل مهاراتك' }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-[#F8FAFA] p-3 rounded-xl border border-[#D2E1D9]/30 hover:border-[#4F8751]/50 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="badge-primary text-[10px] px-2 py-0.5 rounded-full">{item.match}% تطابق</div>
                                        </div>
                                        <h4 className="font-bold text-sm mb-1 group-hover:text-[#4F8751] transition-colors">{item.title}</h4>
                                        <p className="text-xs text-[#034289]/50 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-[#4F8751] rounded-full"></span>
                                            {item.level}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Learning Path Widget */}
                        <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/50 overflow-hidden">
                            <div className="bg-[#F8FAFA] p-4 border-b border-[#D2E1D9]/50">
                                <h3 className="font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                                    مسارك التعليمي المقترح
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="space-y-0 relative">
                                    {/* Line */}
                                    <div className="absolute top-2 bottom-2 right-[11px] w-0.5 bg-[#D2E1D9]"></div>

                                    {[
                                        { title: 'أساسيات البرمجة', status: 'completed', label: 'مكتمل' },
                                        { title: 'تطوير الويب', status: 'current', label: 'قيد التقدم - 45%' },
                                        { title: 'React متقدم', status: 'locked', label: 'قريباً' }
                                    ].map((step, idx) => (
                                        <div key={idx} className="relative flex items-start gap-4 pb-6 last:pb-0">
                                            <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${step.status === 'completed' ? 'theme-bg-emerald border-emerald-500 text-white' :
                                                step.status === 'current' ? 'bg-white border-[#034289] text-[#034289]' :
                                                    'bg-[#F8FAFA] border-gray-300 text-gray-300'
                                                }`}>
                                                {step.status === 'completed' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                {step.status === 'current' && <div className="w-2 h-2 bg-[#034289] rounded-full animate-pulse"></div>}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${step.status === 'locked' ? 'text-gray-400' : 'text-[#034289]'}`}>{step.title}</h4>
                                                <span className="text-[10px] text-gray-500">{step.label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Smart Tips Widget */}
                        <div className="bg-[#4F8751]/10 rounded-2xl p-4 border border-[#4F8751]/20">
                            <h3 className="font-bold text-[#034289] mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                نصائح ذكية
                            </h3>
                            <ul className="space-y-3 text-sm text-[#034289]/80">
                                <li className="flex gap-2">
                                    <span className="text-[#4F8751] font-bold">•</span>
                                    خصص 30 دقيقة يومياً لمراجعة ما تعلمته
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#4F8751] font-bold">•</span>
                                    أنت على بعد درسين من إكمال المستوى الحالي
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Main Content - Left Side in RTL */}
                    <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: 'مساعد تعليمي ذكي', desc: 'اطرح أسئلتك واحصل على إجابات فورية ودقيقة', icon: '💡' },
                                { title: 'اقتراح دورات مخصصة', desc: 'احصل على توصيات دورات بناء على مستواك وأهدافك', icon: '📚' },
                                { title: 'خطط دراسية ذكية', desc: 'خطط دراسية مخصصة تناسب وقتك وسرعة تعلمك', icon: '📅' },
                                { title: 'تحليل التقدم', desc: 'تتبع تقدمك واحصل على نصائح لتحسين الأداء', icon: '📈' },
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-[#D2E1D9]/50 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                                    <div className="w-10 h-10 bg-[#F8FAFA] rounded-full flex items-center justify-center text-xl mb-4 shadow-inner">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-[#034289]">{feature.title}</h3>
                                    <p className="text-sm text-[#034289]/60 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Chat Interface */}
                        <div className="bg-white rounded-2xl shadow-lg border border-[#D2E1D9]/50 flex flex-col h-[600px] overflow-hidden relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

                            {/* Chat Header */}
                            <div className="p-4 bg-[#F8FAFA] border-b border-[#D2E1D9] flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#034289] to-[#4F8751] flex items-center justify-center text-white">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#034289]">المساعد الذكي</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-xs text-emerald-600 font-medium">متصل الآن</span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-[#F8FAFA] scroll-smooth">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-[#034289] text-white' : 'bg-gradient-to-br from-[#034289] to-[#4F8751] text-white'
                                            }`}>
                                            {msg.sender === 'user' ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            )}
                                        </div>

                                        <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${msg.sender === 'user'
                                            ? 'bg-[#034289] text-white rounded-tl-none'
                                            : 'bg-white border border-[#D2E1D9] text-[#034289] rounded-tr-none'
                                            }`}>
                                            {msg.sender === 'ai' && (
                                                <div className="flex items-center gap-1 text-[#4F8751] text-xs font-bold mb-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    AI Assistant
                                                </div>
                                            )}
                                            <p className="leading-relaxed">{msg.text}</p>
                                            <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Suggested Inputs */}
                            <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                                {['كيف أحسن مهاراتي في التصميم؟', 'اقترح لي خطة دراسية', 'ما هي الدورات الأكثر طلباً؟'].map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInputValue(q)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-[#F8FAFA] hover:bg-[#D2E1D9]/30 border border-[#D2E1D9] rounded-full text-xs text-[#034289] transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-[#D2E1D9]/50 bg-white">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="اكتب سؤالك هنا..."
                                        className="flex-1 bg-[#F8FAFA] border border-[#D2E1D9] rounded-xl px-5 py-4 focus:outline-none focus:border-[#4F8751] focus:ring-4 focus:ring-[#4F8751]/5 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-[#034289] to-[#0459b7] text-white px-6 rounded-xl hover:shadow-lg hover:shadow-[#034289]/20 transition-all transform hover:-translate-y-0.5"
                                    >
                                        <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AIPage;

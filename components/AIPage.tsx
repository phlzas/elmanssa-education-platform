import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../App';
import { apiRequest } from '../api/client';

interface AIPageProps {
    onNavigate: (page: Page) => void;
}

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

async function chat(message: string, history: Message[]): Promise<string> {
    const res = await apiRequest('/ai/public-chat', {
        method: 'POST',
        body: JSON.stringify({
            message,
            history: history.map(h => ({ role: h.role, text: h.text })),
        }),
    });
    return (res?.reply ?? res?.data?.reply ?? '') as string;
}

// ── Markdown renderer ──────────────────────────────────────────
// Handles: **bold**, *italic*, `code`, numbered lists, bullet lists, blank-line paragraphs
function MarkdownText({ text }: { text: string }) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    const renderInline = (raw: string): React.ReactNode[] => {
        const parts: React.ReactNode[] = [];
        // Split on **bold**, *italic*, `code` — in that priority order
        const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
        let last = 0;
        let m: RegExpExecArray | null;
        let key = 0;
        while ((m = regex.exec(raw)) !== null) {
            if (m.index > last) parts.push(raw.slice(last, m.index));
            if (m[2] !== undefined) parts.push(<strong key={key++} className="font-bold text-slate-100">{m[2]}</strong>);
            else if (m[3] !== undefined) parts.push(<em key={key++} className="italic text-slate-300">{m[3]}</em>);
            else if (m[4] !== undefined) parts.push(<code key={key++} className="bg-white/[0.08] text-amber-300 px-1.5 py-0.5 rounded text-[12px] font-mono">{m[4]}</code>);
            last = m.index + m[0].length;
        }
        if (last < raw.length) parts.push(raw.slice(last));
        return parts;
    };

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Blank line — spacing
        if (trimmed === '') {
            i++;
            continue;
        }

        // Numbered list: "1. " or "١. "
        if (/^(\d+|[١-٩][٠-٩]*)\.\s/.test(trimmed)) {
            const listItems: React.ReactNode[] = [];
            while (i < lines.length && /^(\d+|[١-٩][٠-٩]*)\.\s/.test(lines[i].trim())) {
                const content = lines[i].trim().replace(/^(\d+|[١-٩][٠-٩]*)\.\s/, '');
                listItems.push(
                    <li key={i} className="flex gap-2 items-start">
                        <span className="text-[#4F8751] font-bold text-sm mt-0.5 flex-shrink-0">
                            {lines[i].trim().match(/^(\d+|[١-٩][٠-٩]*)/)?.[0]}.
                        </span>
                        <span>{renderInline(content)}</span>
                    </li>
                );
                i++;
            }
            elements.push(<ol key={`ol-${i}`} className="space-y-1.5 my-2">{listItems}</ol>);
            continue;
        }

        // Bullet list: "* " or "- " or "• "
        if (/^[\*\-•]\s/.test(trimmed)) {
            const listItems: React.ReactNode[] = [];
            while (i < lines.length && /^[\*\-•]\s/.test(lines[i].trim())) {
                const content = lines[i].trim().replace(/^[\*\-•]\s/, '');
                listItems.push(
                    <li key={i} className="flex gap-2 items-start">
                        <span className="text-[#4F8751] mt-1.5 flex-shrink-0">
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="3"/></svg>
                        </span>
                        <span>{renderInline(content)}</span>
                    </li>
                );
                i++;
            }
            elements.push(<ul key={`ul-${i}`} className="space-y-1.5 my-2">{listItems}</ul>);
            continue;
        }

        // Heading-like line (starts with **text:** pattern — Gemini uses this for section headers)
        if (/^\*\*[^*]+\*\*[:\.]?\s*$/.test(trimmed)) {
            elements.push(
                <p key={i} className="font-bold text-slate-100 text-[15px] mt-3 mb-1">
                    {renderInline(trimmed)}
                </p>
            );
            i++;
            continue;
        }

        // Regular paragraph line
        elements.push(
            <p key={i} className="leading-relaxed text-slate-200">
                {renderInline(trimmed)}
            </p>
        );
        i++;
    }

    return <div className="space-y-1">{elements}</div>;
}

// ── AI Loading Indicator ──────────────────────────────────────
// Stage 1: 3×3 dot grid with staggered pulse
// Stage 2: grid collapses → avatar pops in (triggered when loading ends)
function AILoadingIndicator({ done }: { done: boolean }) {
    const DOTS = 9;
    // stagger delays: row-major order, 133ms apart → full cycle ~1200ms
    const delays = [0, 133, 266, 400, 533, 666, 800, 933, 1066];

    return (
        <div className="flex gap-3" role="status" aria-label="جاري التفكير">
            {/* Avatar slot */}
            <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#4F8751]/30 to-[#034289]/30" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F8751" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
            </div>

            {/* Bubble */}
            <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-white/[0.05] border border-white/[0.07] flex items-center justify-center min-w-[72px] min-h-[48px] relative overflow-hidden">

                {/* Stage 1 — dot grid */}
                {!done && (
                    <div className="dot-grid grid gap-[6px]" style={{ gridTemplateColumns: 'repeat(3, 8px)' }}>
                        {Array.from({ length: DOTS }).map((_, idx) => (
                            <span
                                key={idx}
                                className="ai-dot block w-2 h-2 rounded-full bg-[#00AEEF]"
                                style={{ animationDelay: `${delays[idx]}ms` }}
                            />
                        ))}
                    </div>
                )}

                {/* Stage 2+3 — collapse then avatar pop */}
                {done && (
                    <span className="ai-avatar-pop flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                            {/* Head shape */}
                            <path
                                d="M50,18 C33,18 22,30 22,46 C22,68 50,86 50,86 C50,86 78,68 78,46 C78,30 67,18 50,18 Z"
                                fill="url(#ai-grad)"
                            />
                            {/* Eyes */}
                            <circle cx="38" cy="44" r="5" fill="white" opacity="0.95"/>
                            <circle cx="62" cy="44" r="5" fill="white" opacity="0.95"/>
                            <circle cx="39.5" cy="45.5" r="2.5" fill="#034289"/>
                            <circle cx="63.5" cy="45.5" r="2.5" fill="#034289"/>
                            {/* Smile */}
                            <path d="M38,58 Q50,68 62,58" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9"/>
                            <defs>
                                <linearGradient id="ai-grad" x1="22" y1="18" x2="78" y2="86" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#4F8751"/>
                                    <stop offset="100%" stopColor="#034289"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </span>
                )}
            </div>
        </div>
    );
}

const SUGGESTIONS = [
    'اشرح لي قانون نيوتن الثاني',
    'ما الفرق بين التفاضل والتكامل؟',
    'كيف أحل معادلة من الدرجة الثانية؟',
    'ما هي أهم قواعد اللغة العربية؟',
];

const AIPage: React.FC<AIPageProps> = ({ onNavigate }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingDone, setLoadingDone] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const send = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;
        setError('');
        setLoadingDone(false);
        const userMsg: Message = { role: 'user', text: trimmed };
        const snapshot = [...messages, userMsg];
        setMessages(snapshot);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        setLoading(true);
        try {
            const reply = await chat(trimmed, messages);
            if (!reply) throw new Error('empty');
            // Stage 2: trigger collapse → avatar pop (300ms), then show reply
            setLoadingDone(true);
            await new Promise(r => setTimeout(r, 600));
            setMessages([...snapshot, { role: 'assistant', text: reply }]);
        } catch {
            setError('حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.');
        }
        setLoading(false);
        setLoadingDone(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };

    const isEmpty = messages.length === 0;

    return (
        <div dir="rtl" className="flex flex-col h-screen bg-[#0a1628] font-cairo text-slate-200 overflow-hidden">

            {/* Header */}
            <header className="flex-shrink-0 bg-[#0f172a]/95 backdrop-blur border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('home')}
                        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-none p-1"
                        aria-label="رجوع للرئيسية"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F8751] to-[#034289] flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-100 leading-tight">مساعد المنصة الذكي</div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" aria-hidden="true"></span>
                                <span className="text-[11px] text-green-400">متاح الآن</span>
                            </div>
                        </div>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={() => { setMessages([]); setError(''); }}
                        className="text-slate-500 hover:text-slate-300 text-xs font-cairo cursor-pointer bg-transparent border-none transition-colors"
                    >
                        محادثة جديدة
                    </button>
                )}
            </header>

            {/* Chat area */}
            <main className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center min-h-[55vh] text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4F8751]/20 to-[#034289]/20 flex items-center justify-center mb-5 border border-white/[0.06]">
                                <svg className="w-10 h-10 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-100 mb-2">كيف يمكنني مساعدتك؟</h2>
                            <p className="text-slate-500 text-sm mb-8 max-w-xs">اسألني عن أي مادة دراسية وسأساعدك في الفهم والشرح</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
                                {SUGGESTIONS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => send(s)}
                                        className="text-right px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm hover:bg-white/[0.08] hover:border-[#4F8751]/40 transition-all duration-200 cursor-pointer font-cairo"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div
                                        className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                                            msg.role === 'user'
                                                ? 'bg-[#034289]/30 text-[#38bdf8]'
                                                : 'bg-gradient-to-br from-[#4F8751]/30 to-[#034289]/30 text-[#4F8751]'
                                        }`}
                                        aria-hidden="true"
                                    >
                                        {msg.role === 'user' ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                            </svg>
                                        )}
                                    </div>
                                    {/* Bubble */}
                                    <div
                                        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-[#034289]/40 text-slate-100 rounded-tr-sm whitespace-pre-wrap'
                                                : 'bg-white/[0.05] border border-white/[0.07] text-slate-200 rounded-tl-sm'
                                        }`}
                                    >
                                        {msg.role === 'user'
                                            ? msg.text
                                            : <MarkdownText text={msg.text} />
                                        }
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {loading && (
                                <AILoadingIndicator done={loadingDone} />
                            )}

                            {error && (
                                <div role="alert" className="text-center text-red-400 text-sm py-2 px-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                    {error}
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>
            </main>

            {/* Input bar */}
            <div className="flex-shrink-0 bg-[#0a1628]/95 backdrop-blur border-t border-white/[0.06] px-4 py-4">
                <div className="max-w-3xl mx-auto flex gap-3 items-end">
                    <div className="flex-1">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onInput={e => {
                                const t = e.currentTarget;
                                t.style.height = 'auto';
                                t.style.height = Math.min(t.scrollHeight, 140) + 'px';
                            }}
                            placeholder="اكتب سؤالك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)"
                            rows={1}
                            disabled={loading}
                            aria-label="رسالتك للمساعد الذكي"
                            className="font-cairo w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-slate-200 text-sm outline-none focus:border-[#4F8751]/50 transition-colors duration-150 resize-none disabled:opacity-50 placeholder-slate-600"
                            style={{ minHeight: '48px', maxHeight: '140px' }}
                        />
                    </div>
                    <button
                        onClick={() => send(input)}
                        disabled={!input.trim() || loading}
                        aria-label="إرسال الرسالة"
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F8751] to-[#034289] flex items-center justify-center flex-shrink-0 cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-green-900/30"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <p className="text-center text-[11px] text-slate-600 mt-2 font-cairo">
                    مدعوم بـ Gemini AI — للأغراض التعليمية فقط
                </p>
            </div>
        </div>
    );
};

export default AIPage;

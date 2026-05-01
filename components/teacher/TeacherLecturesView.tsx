import React, { useState } from 'react';
import { Subject, Level, Lecture, LectureDoc } from './types';
import { getViewUrl } from '../../api/media.api';

interface Props {
    subject: Subject | null;
    onClose: () => void;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconVideo = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
    </svg>
);

const IconDoc = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6M9 13h6M9 17h4" strokeLinecap="round" />
    </svg>
);

const IconClose = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
    <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        aria-hidden="true"
    >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconLink = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ── Lecture row ───────────────────────────────────────────────────────────────

const LectureRow: React.FC<{ lec: Lecture; index: number }> = ({ lec, index }) => {
    const hasVideo = lec.uploadStatus === 'success' || !!lec.mediaFileId;
    const hasUrl = !!lec.videoUrl;
    const docs: LectureDoc[] = lec.docs?.filter(d => d.uploadStatus === 'success') ?? [];

    return (
        <div className="flex flex-col gap-2 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors duration-150">
            {/* Title row */}
            <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0 font-cairo">
                    {index + 1}
                </span>
                <span className="flex-1 text-[14px] font-semibold text-slate-200 font-cairo leading-snug">
                    {lec.title || <span className="text-slate-500 italic">بدون عنوان</span>}
                </span>
                {lec.duration && lec.duration !== '00:00' && (
                    <span className="text-[11px] text-slate-500 font-cairo shrink-0">{lec.duration}</span>
                )}
            </div>

            {/* Media badges */}
            <div className="flex flex-wrap gap-2 pr-9">
                {/* Video */}
                {hasVideo && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-cairo">
                        <IconVideo />
                        {lec.hlsReady ? 'فيديو جاهز للبث' : 'فيديو (جاري المعالجة...)'}
                    </span>
                )}

                {/* External URL */}
                {hasUrl && !hasVideo && (
                    <a
                        href={lec.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-cairo hover:bg-purple-500/20 transition-colors duration-150 cursor-pointer"
                    >
                        <IconLink />
                        رابط خارجي
                    </a>
                )}

                {/* Documents */}
                {docs.map(doc => (
                    <a
                        key={doc.id}
                        href={doc.mediaFileId ? getViewUrl(doc.mediaFileId) : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-cairo hover:bg-amber-500/20 transition-colors duration-150 cursor-pointer max-w-[180px]"
                        title={doc.fileName}
                    >
                        <IconDoc />
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{doc.fileName}</span>
                    </a>
                ))}

                {/* Empty state */}
                {!hasVideo && !hasUrl && docs.length === 0 && (
                    <span className="text-[11px] text-slate-600 font-cairo italic">لا يوجد محتوى مرفوع</span>
                )}
            </div>
        </div>
    );
};

// ── Level accordion ───────────────────────────────────────────────────────────

const LevelSection: React.FC<{ level: Level; defaultOpen?: boolean }> = ({ level, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    const lecCount = level.lectures.length;

    return (
        <div className="border border-white/[0.07] rounded-xl overflow-hidden mb-3">
            {/* Header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer border-0 text-right"
                aria-expanded={open}
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-amber-400 font-cairo">{level.title}</span>
                    <span className="text-[11px] text-slate-500 font-cairo">
                        {lecCount} {lecCount === 1 ? 'محاضرة' : 'محاضرات'}
                    </span>
                </div>
                <span className="text-slate-500">
                    <IconChevron open={open} />
                </span>
            </button>

            {/* Lectures */}
            {open && (
                <div>
                    {lecCount === 0 ? (
                        <div className="px-4 py-5 text-center text-[13px] text-slate-600 font-cairo">
                            لا توجد محاضرات في هذا المستوى
                        </div>
                    ) : (
                        level.lectures.map((lec, i) => (
                            <LectureRow key={lec.id} lec={lec} index={i} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main panel ────────────────────────────────────────────────────────────────

const TeacherLecturesView: React.FC<Props> = ({ subject, onClose }) => {
    if (!subject) return null;

    const totalLectures = subject.levels.reduce((a, l) => a + l.lectures.length, 0);
    const totalWithVideo = subject.levels.reduce(
        (a, l) => a + l.lectures.filter(lec => lec.uploadStatus === 'success' || !!lec.mediaFileId).length,
        0
    );

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className="fixed inset-y-0 right-0 z-[260] w-full max-w-[560px] bg-[#0d1f3c] border-l border-white/[0.08] flex flex-col shadow-2xl"
                dir="rtl"
                role="dialog"
                aria-modal="true"
                aria-label={`محاضرات: ${subject.title}`}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" aria-hidden="true">
                                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[16px] font-extrabold text-slate-100 m-0 font-cairo overflow-hidden text-ellipsis whitespace-nowrap">
                                {subject.title}
                            </h2>
                            <p className="text-[12px] text-slate-500 m-0 font-cairo">
                                {subject.levels.length} مستوى · {totalLectures} محاضرة
                                {totalWithVideo > 0 && ` · ${totalWithVideo} بفيديو`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors duration-200 cursor-pointer shrink-0"
                        aria-label="إغلاق"
                    >
                        <IconClose />
                    </button>
                </div>

                {/* Summary bar */}
                <div className="px-5 py-3 border-b border-white/[0.05] flex gap-4 shrink-0">
                    {[
                        { label: 'المستويات', value: subject.levels.length, color: 'text-amber-400' },
                        { label: 'المحاضرات', value: totalLectures, color: 'text-sky-400' },
                        { label: 'بفيديو', value: totalWithVideo, color: 'text-green-400' },
                        { label: 'الطلاب', value: subject.students, color: 'text-purple-400' },
                    ].map(m => (
                        <div key={m.label} className="flex flex-col items-center flex-1">
                            <span className={`text-[18px] font-extrabold ${m.color}`}>{m.value}</span>
                            <span className="text-[11px] text-slate-500 font-cairo">{m.label}</span>
                        </div>
                    ))}
                </div>

                {/* Levels + lectures */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {subject.levels.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 font-cairo text-[14px]">
                            لا توجد مستويات في هذه المادة
                        </div>
                    ) : (
                        subject.levels.map((level, i) => (
                            <LevelSection key={level.id} level={level} defaultOpen={i === 0} />
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default TeacherLecturesView;

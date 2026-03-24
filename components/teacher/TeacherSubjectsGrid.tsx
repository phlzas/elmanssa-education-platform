import React from 'react';
import { Subject } from './types';

interface TeacherSubjectsGridProps {
    subjects: Subject[];
    onEdit: (subject: Subject) => void;
    onTogglePublish: (id: string) => void;
    onDelete: (id: string) => void;
    onCreateNew: () => void;
}

const SubjectCard: React.FC<{
    subject: Subject;
    onEdit: () => void;
    onTogglePublish: () => void;
    onDelete: () => void;
}> = ({ subject, onEdit, onTogglePublish, onDelete }) => {
    const lecCount = subject.levels.reduce((a, l) => a + l.lectures.length, 0);
    const isPublished = subject.status === 'published';

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', padding: '18px', transition: 'all 0.2s',
            animation: 'fadeIn 0.3s ease',
        }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.22)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        background: 'rgba(245,158,11,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', margin: 0, fontFamily: "'Cairo', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {subject.name}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0', fontFamily: "'Cairo', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {subject.description || '—'}
                        </p>
                    </div>
                </div>
                <span style={{
                    flexShrink: 0, marginRight: '8px',
                    padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    background: isPublished ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                    color: isPublished ? '#22c55e' : '#f59e0b',
                    fontFamily: "'Cairo', sans-serif",
                }}>
                    {isPublished ? 'منشورة' : 'مسودة'}
                </span>
            </div>

            {/* Metrics */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                    { label: 'مستوى', value: subject.levels.length, color: '#f59e0b' },
                    { label: 'محاضرة', value: lecCount, color: '#38bdf8' },
                    { label: 'طالب', value: subject.students, color: '#a855f7' },
                ].map((m, i, arr) => (
                    <div key={i} style={{
                        flex: 1, textAlign: 'center', padding: '10px 4px',
                        borderLeft: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                        <div style={{ fontSize: '17px', fontWeight: 800, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: "'Cairo', sans-serif" }}>{m.label}</div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '7px' }}>
                <button onClick={onEdit} style={{
                    flex: 1, padding: '9px', borderRadius: '9px', cursor: 'pointer',
                    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)',
                    color: '#f59e0b', fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    fontFamily: "'Cairo', sans-serif", transition: 'background 0.15s',
                }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    تعديل
                </button>
                <button onClick={onTogglePublish} style={{
                    flex: 1, padding: '9px', borderRadius: '9px', cursor: 'pointer',
                    background: isPublished ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.08)',
                    border: `1px solid ${isPublished ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)'}`,
                    color: isPublished ? '#f87171' : '#22c55e',
                    fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    fontFamily: "'Cairo', sans-serif", transition: 'background 0.15s',
                }}>
                    {isPublished
                        ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>إيقاف</>
                        : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" strokeLinecap="round" strokeLinejoin="round"/></svg>نشر</>
                    }
                </button>
                <button onClick={onDelete} style={{
                    padding: '9px 11px', borderRadius: '9px', cursor: 'pointer',
                    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
                    color: '#f87171', transition: 'background 0.15s', flexShrink: 0,
                }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

const TeacherSubjectsGrid: React.FC<TeacherSubjectsGridProps> = ({
    subjects, onEdit, onTogglePublish, onDelete, onCreateNew,
}) => (
    <div style={{
        background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '18px', overflow: 'hidden',
    }}>
        <div style={{
            padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#f1f5f9', margin: 0, fontFamily: "'Cairo', sans-serif" }}>
                    موادي التعليمية
                </h2>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b', fontFamily: "'Cairo', sans-serif" }}>{subjects.length} مادة</span>
        </div>

        <div style={{ padding: '16px' }}>
            {subjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px', fontFamily: "'Cairo', sans-serif" }}>لا توجد مواد بعد</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', fontFamily: "'Cairo', sans-serif" }}>ابدأ بإنشاء مادتك الأولى</p>
                    <button onClick={onCreateNew} style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none',
                        borderRadius: '10px', padding: '11px 22px', color: '#fff',
                        fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
                    }}>
                        إنشاء مادة جديدة
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                    {subjects.map(s => (
                        <SubjectCard
                            key={s.id} subject={s}
                            onEdit={() => onEdit(s)}
                            onTogglePublish={() => onTogglePublish(s.id)}
                            onDelete={() => onDelete(s.id)}
                        />
                    ))}
                    {/* Add new card */}
                    <button onClick={onCreateNew} style={{
                        background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(245,158,11,0.15)',
                        borderRadius: '14px', padding: '36px 20px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        color: '#64748b', fontFamily: "'Cairo', sans-serif', transition: 'all 0.2s",
                        transition: 'all 0.2s',
                    }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; e.currentTarget.style.background = 'rgba(245,158,11,0.03)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>إضافة مادة جديدة</span>
                    </button>
                </div>
            )}
        </div>
    </div>
);

export default TeacherSubjectsGrid;

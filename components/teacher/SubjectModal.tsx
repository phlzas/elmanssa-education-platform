
import React from 'react';
import { Subject, Level, Lecture } from './types';
import { subjectIcons } from './mockData';

interface SubjectModalProps {
    show: boolean;
    onClose: () => void;
    editingSubject: Subject | null;
    createStep: number;
    setCreateStep: (step: number) => void;
    newSubjectName: string;
    setNewSubjectName: (name: string) => void;
    newSubjectDesc: string;
    setNewSubjectDesc: (desc: string) => void;
    newSubjectIcon: string;
    setNewSubjectIcon: (icon: string) => void;
    newLevels: Level[];
    addLevel: () => void;
    removeLevel: (id: string) => void;
    updateLevelName: (id: string, name: string) => void;
    addLecture: (levelId: string) => void;
    removeLecture: (levelId: string, lecId: string) => void;
    updateLecture: (levelId: string, lecId: string, field: keyof Lecture, value: string) => void;
    onSave: () => void;
}

const SubjectModal: React.FC<SubjectModalProps> = ({
    show, onClose, editingSubject, createStep, setCreateStep,
    newSubjectName, setNewSubjectName, newSubjectDesc, setNewSubjectDesc,
    newSubjectIcon, setNewSubjectIcon, newLevels,
    addLevel, removeLevel, updateLevelName,
    addLecture, removeLecture, updateLecture, onSave,
}) => {
    if (!show) return null;

    const totalSteps = 3;
    const stepTitles = ['معلومات المادة', 'إضافة المستويات', 'إضافة المحاضرات'];

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                onClick={onClose}
            />
            <div style={{
                position: 'relative', zIndex: 1,
                width: '90%', maxWidth: '680px', maxHeight: '85vh',
                background: 'linear-gradient(135deg, #0d1f3c, #132742)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                borderRadius: '24px', overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}>
                {/* Modal header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        }}>{editingSubject ? '✏️' : '➕'}</div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
                                {editingSubject ? 'تعديل المادة' : 'إنشاء مادة جديدة'}
                            </h3>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                                الخطوة {createStep} من {totalSteps}: {stepTitles[createStep - 1]}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', padding: '8px', color: '#94a3b8', cursor: 'pointer',
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Progress bar */}
                <div style={{ padding: '0 24px', display: 'flex', gap: '6px', marginTop: '16px' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            flex: 1, height: '4px', borderRadius: '2px',
                            background: s <= createStep ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.08)',
                            transition: 'all 0.3s',
                        }} />
                    ))}
                </div>

                {/* Modal content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {/* Step 1: Subject Info */}
                    {createStep === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                                    أيقونة المادة
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {subjectIcons.map(icon => (
                                        <button key={icon} onClick={() => setNewSubjectIcon(icon)} style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: newSubjectIcon === icon ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: newSubjectIcon === icon ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                                            fontSize: '22px', cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                        }}>
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                                    اسم المادة *
                                </label>
                                <input
                                    value={newSubjectName}
                                    onChange={e => setNewSubjectName(e.target.value)}
                                    placeholder="مثال: رياضة عامة"
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', color: '#e2e8f0', fontSize: '15px',
                                        fontFamily: "'Cairo', sans-serif", outline: 'none',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                                    وصف المادة
                                </label>
                                <textarea
                                    value={newSubjectDesc}
                                    onChange={e => setNewSubjectDesc(e.target.value)}
                                    placeholder="وصف مختصر عن محتوى المادة..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', color: '#e2e8f0', fontSize: '14px',
                                        fontFamily: "'Cairo', sans-serif", outline: 'none', resize: 'vertical',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Levels */}
                    {createStep === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
                                    المستويات ({newLevels.length})
                                </span>
                                <button onClick={addLevel} style={{
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    border: 'none', borderRadius: '10px', padding: '8px 16px',
                                    color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontFamily: "'Cairo', sans-serif",
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    إضافة مستوى
                                </button>
                            </div>
                            {newLevels.map((level, idx) => (
                                <div key={level.id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '14px', padding: '16px',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '14px', fontWeight: 700, color: '#f59e0b', flexShrink: 0,
                                    }}>{idx + 1}</div>
                                    <input
                                        value={level.name}
                                        onChange={e => updateLevelName(level.id, e.target.value)}
                                        style={{
                                            flex: 1, padding: '8px 12px',
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '8px', color: '#e2e8f0', fontSize: '14px',
                                            fontFamily: "'Cairo', sans-serif", outline: 'none',
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'}
                                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                                    />
                                    <span style={{ fontSize: '12px', color: '#64748b', flexShrink: 0 }}>
                                        {level.lectures.length} محاضرة
                                    </span>
                                    {newLevels.length > 1 && (
                                        <button onClick={() => removeLevel(level.id)} style={{
                                            background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px',
                                            padding: '6px', color: '#f87171', cursor: 'pointer', flexShrink: 0,
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Lectures */}
                    {createStep === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {newLevels.map((level) => (
                                <div key={level.id} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '16px', overflow: 'hidden',
                                }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}>
                                        <span style={{
                                            fontSize: '13px', fontWeight: 700, color: '#f59e0b',
                                            background: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px',
                                            borderRadius: '8px',
                                        }}>⚡ {level.name}</span>
                                        <button onClick={() => addLecture(level.id)} style={{
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            border: '1px solid rgba(245, 158, 11, 0.2)',
                                            borderRadius: '8px', padding: '6px 12px', color: '#f59e0b',
                                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            fontFamily: "'Cairo', sans-serif",
                                        }}>
                                            + محاضرة
                                        </button>
                                    </div>
                                    <div style={{ padding: '8px 12px' }}>
                                        {level.lectures.length === 0 ? (
                                            <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
                                                لا توجد محاضرات بعد. اضغط "+ محاضرة" لإضافة واحدة.
                                            </div>
                                        ) : (
                                            level.lectures.map((lec, lecIdx) => (
                                                <div key={lec.id} style={{
                                                    padding: '12px',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '10px',
                                                    marginBottom: '6px',
                                                    display: 'flex', flexDirection: 'column', gap: '10px',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', width: '24px', textAlign: 'center', flexShrink: 0 }}>{lecIdx + 1}</span>
                                                        <input
                                                            value={lec.title}
                                                            onChange={e => updateLecture(level.id, lec.id, 'title', e.target.value)}
                                                            placeholder="عنوان المحاضرة"
                                                            style={{
                                                                flex: 1, padding: '8px 12px',
                                                                background: 'rgba(255,255,255,0.04)',
                                                                border: '1px solid rgba(255,255,255,0.06)',
                                                                borderRadius: '8px', color: '#e2e8f0', fontSize: '13px',
                                                                fontFamily: "'Cairo', sans-serif", outline: 'none',
                                                            }}
                                                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'}
                                                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                                                        />
                                                        <input
                                                            value={lec.duration}
                                                            onChange={e => updateLecture(level.id, lec.id, 'duration', e.target.value)}
                                                            placeholder="00:00"
                                                            style={{
                                                                width: '70px', padding: '8px',
                                                                background: 'rgba(255,255,255,0.04)',
                                                                border: '1px solid rgba(255,255,255,0.06)',
                                                                borderRadius: '8px', color: '#94a3b8', fontSize: '12px',
                                                                fontFamily: "'Cairo', sans-serif", outline: 'none',
                                                                textAlign: 'center',
                                                            }}
                                                        />
                                                        <button onClick={() => removeLecture(level.id, lec.id)} style={{
                                                            background: 'none', border: 'none', color: '#64748b',
                                                            cursor: 'pointer', padding: '4px', flexShrink: 0,
                                                        }}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div style={{ paddingRight: '34px' }}>
                                                        <input
                                                            value={lec.videoUrl}
                                                            onChange={e => updateLecture(level.id, lec.id, 'videoUrl', e.target.value)}
                                                            placeholder="🔗 رابط الفيديو (اختياري)"
                                                            style={{
                                                                width: '100%', padding: '8px 12px',
                                                                background: 'rgba(255,255,255,0.03)',
                                                                border: '1px solid rgba(255,255,255,0.05)',
                                                                borderRadius: '8px', color: '#64748b', fontSize: '12px',
                                                                fontFamily: "'Cairo', sans-serif", outline: 'none',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal footer */}
                <div style={{
                    padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <button
                        onClick={() => createStep > 1 ? setCreateStep(createStep - 1) : onClose()}
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px', padding: '10px 20px', color: '#94a3b8',
                            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'Cairo', sans-serif",
                        }}
                    >
                        {createStep > 1 ? 'السابق' : 'إلغاء'}
                    </button>

                    {createStep < 3 ? (
                        <button
                            onClick={() => setCreateStep(createStep + 1)}
                            disabled={createStep === 1 && !newSubjectName.trim()}
                            style={{
                                background: createStep === 1 && !newSubjectName.trim()
                                    ? 'rgba(245, 158, 11, 0.3)'
                                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                border: 'none', borderRadius: '12px', padding: '10px 24px',
                                color: '#fff', fontSize: '14px', fontWeight: 700,
                                cursor: createStep === 1 && !newSubjectName.trim() ? 'not-allowed' : 'pointer',
                                fontFamily: "'Cairo', sans-serif",
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            التالي
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    ) : (
                        <button onClick={onSave} style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none', borderRadius: '12px', padding: '10px 24px',
                            color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Cairo', sans-serif",
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {editingSubject ? 'حفظ التعديلات' : 'حفظ المادة'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectModal;

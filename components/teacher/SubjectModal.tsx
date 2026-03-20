
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
    newSubjectPrice: number;
    setNewSubjectPrice: (price: number) => void;
    newSubjectLevel: string;
    setNewSubjectLevel: (level: string) => void;
    newSubjectImageUrl: string;
    setNewSubjectImageUrl: (url: string) => void;
    newLevels: Level[];
    addLevel: () => void;
    removeLevel: (id: string) => void;
    updateLevelName: (id: string, name: string) => void;
    addLecture: (levelId: string) => void;
    removeLecture: (levelId: string, lecId: string) => void;
    updateLecture: (levelId: string, lecId: string, field: keyof Lecture, value: string) => void;
    onSave: () => void;
    isSaving?: boolean;
}

const SubjectModal: React.FC<SubjectModalProps> = ({
    show, onClose, editingSubject, createStep, setCreateStep,
    newSubjectName, setNewSubjectName, newSubjectDesc, setNewSubjectDesc,
    newSubjectIcon, setNewSubjectIcon, newSubjectPrice, setNewSubjectPrice,
    newSubjectLevel, setNewSubjectLevel, newSubjectImageUrl, setNewSubjectImageUrl, newLevels,
    addLevel, removeLevel, updateLevelName,
    addLecture, removeLecture, updateLecture, onSave, isSaving = false,
}) => {
    if (!show) return null;

    const totalSteps = 3;
    const stepTitles = ['معلومات المادة', 'إضافة المستويات', 'إضافة المحاضرات'];
    const FILTER_LEVELS = ['مبتدئ', 'متوسط', 'متقدم', 'خبير', 'جميع المستويات'];

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
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                {/* Modal content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {/* Step 1: Subject Info */}
                    {createStep === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label htmlFor="subject-icon" style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                                    أيقونة المادة
                                </label>
                                <div id="subject-icon" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {subjectIcons.map(icon => (
                                        <button key={icon} onClick={() => setNewSubjectIcon(icon)} aria-label={`اختر أيقونة ${icon}`} style={{
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
                                <label htmlFor="subject-name" style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                                    اسم المادة *
                                </label>
                                <input
                                    id="subject-name"
                                    name="subjectName"
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
                                <label htmlFor="subject-desc" style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                                    وصف المادة
                                </label>
                                <textarea
                                    id="subject-desc"
                                    name="subjectDesc"
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
                            <div>
                                <label htmlFor="subject-level" style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                                    مستوى الصعوبة *
                                </label>
                                <select
                                    id="subject-level"
                                    name="subjectLevel"
                                    value={newSubjectLevel}
                                    onChange={e => setNewSubjectLevel(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', color: '#e2e8f0', fontSize: '15px',
                                        fontFamily: "'Cairo', sans-serif", outline: 'none',
                                        cursor: 'pointer',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                >
                                    {FILTER_LEVELS.map(level => (
                                        <option key={level} value={level} style={{ background: '#0d1f3c', color: '#e2e8f0' }}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="subject-image" style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                                    رابط صورة المادة
                                </label>
                                <input
                                    id="subject-image"
                                    name="subjectImage"
                                    type="url"
                                    value={newSubjectImageUrl}
                                    onChange={e => setNewSubjectImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', color: '#e2e8f0', fontSize: '15px',
                                        fontFamily: "'Cairo', sans-serif", outline: 'none',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: '#64748b', 
                                    marginTop: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    🖼️ رابط صورة الغلاف للمادة (اختياري)
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subject-price" style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                                    السعر (ريال سعودي) *
                                </label>
                                <input
                                    id="subject-price"
                                    name="subjectPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newSubjectPrice}
                                    onChange={e => setNewSubjectPrice(parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px', color: '#e2e8f0', fontSize: '15px',
                                        fontFamily: "'Cairo', sans-serif", outline: 'none',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: '#64748b', 
                                    marginTop: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    💡 اترك السعر 0 لجعل المادة مجانية
                                </div>
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
                                        id={`level-name-${level.id}`}
                                        name={`levelName-${idx}`}
                                        aria-label={`اسم المستوى ${idx + 1}`}
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
                                                            id={`lec-title-${lec.id}`}
                                                            name={`lecTitle-${lec.id}`}
                                                            aria-label="عنوان المحاضرة"
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
                                                            id={`lec-video-${lec.id}`}
                                                            name={`lecVideo-${lec.id}`}
                                                            aria-label="رابط الفيديو"
                                                            value={lec.videoUrl}
                                                            onChange={e => updateLecture(level.id, lec.id, 'videoUrl', e.target.value)}
                                                            placeholder="🔗 رابط Google Drive (سيتم حساب المدة تلقائياً)"
                                                            style={{
                                                                width: '100%', padding: '8px 12px',
                                                                background: 'rgba(255,255,255,0.03)',
                                                                border: '1px solid rgba(255,255,255,0.05)',
                                                                borderRadius: '8px', color: '#64748b', fontSize: '12px',
                                                                fontFamily: "'Cairo', sans-serif", outline: 'none',
                                                            }}
                                                        />
                                                        <div style={{ 
                                                            fontSize: '10px', 
                                                            color: '#64748b', 
                                                            marginTop: '4px',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            💡 المدة الزمنية سيتم استخراجها تلقائياً من رابط الفيديو
                                                        </div>
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
                        <button onClick={onSave} disabled={isSaving} style={{
                            background: isSaving
                                ? 'rgba(16, 185, 129, 0.5)'
                                : 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none', borderRadius: '12px', padding: '10px 24px',
                            color: '#fff', fontSize: '14px', fontWeight: 700,
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontFamily: "'Cairo', sans-serif",
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: isSaving ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
                            opacity: isSaving ? 0.7 : 1,
                        }}>
                            {isSaving ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        style={{ animation: 'spin 0.8s linear infinite' }}>
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                                            strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {editingSubject ? 'حفظ التعديلات' : 'حفظ المادة'}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectModal;

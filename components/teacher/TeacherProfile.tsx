import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TeacherProfile: React.FC = () => {
    const { user } = useAuth();

    return (
        <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '680px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 18px', fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                الملف الشخصي
            </h2>

            {/* Avatar card */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px',
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '20px',
            }}>
                <div style={{
                    width: '72px', height: '72px', borderRadius: '18px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 18px rgba(245,158,11,0.28)',
                }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', fontFamily: "'Cairo', sans-serif" }}>
                        {user?.name || 'المدرس'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontFamily: "'Cairo', sans-serif" }}>
                        مدرس معتمد
                    </div>
                    <button style={{
                        marginTop: '8px', background: 'rgba(245,158,11,0.08)',
                        border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px',
                        padding: '5px 12px', color: '#f59e0b', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
                    }}>
                        تغيير الصورة
                    </button>
                </div>
            </div>

            {/* Form */}
            <div style={{
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
                {[
                    { label: 'الاسم الكامل', value: user?.name || '', type: 'text', id: 'profile-name' },
                    { label: 'البريد الإلكتروني', value: user?.email || '', type: 'email', id: 'profile-email' },
                ].map(f => (
                    <div key={f.id}>
                        <label htmlFor={f.id} style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block', fontFamily: "'Cairo', sans-serif" }}>
                            {f.label}
                        </label>
                        <input
                            id={f.id} name={f.id} defaultValue={f.value} type={f.type}
                            style={{
                                width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
                                fontFamily: "'Cairo', sans-serif", outline: 'none',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                    </div>
                ))}
                <div>
                    <label htmlFor="profile-bio" style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block', fontFamily: "'Cairo', sans-serif" }}>
                        نبذة عنك
                    </label>
                    <textarea
                        id="profile-bio" name="profile-bio" rows={3}
                        style={{
                            width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
                            fontFamily: "'Cairo', sans-serif", outline: 'none', resize: 'vertical',
                            transition: 'border-color 0.15s',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                </div>
                <button style={{
                    alignSelf: 'flex-start',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none',
                    borderRadius: '10px', padding: '11px 24px', color: '#fff',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif", boxShadow: '0 4px 14px rgba(245,158,11,0.28)',
                    display: 'flex', alignItems: 'center', gap: '7px', transition: 'opacity 0.15s',
                }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="17 21 17 13 7 13 7 21" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="7 3 7 8 15 8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    حفظ التغييرات
                </button>
            </div>
        </div>
    );
};

export default TeacherProfile;

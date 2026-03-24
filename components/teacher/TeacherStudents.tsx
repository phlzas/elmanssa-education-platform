import React from 'react';

interface Student { name: string; email: string; avatar: string; id?: string | number }

interface TeacherStudentsProps {
    students: Student[];
    loading: boolean;
}

const TeacherStudents: React.FC<TeacherStudentsProps> = ({ students, loading }) => (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#f1f5f9', margin: 0, fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                طلابي
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px', fontFamily: "'Cairo', sans-serif" }}>
                {students.length} طالب
            </span>
        </div>

        {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', fontFamily: "'Cairo', sans-serif" }}>
                جاري تحميل الطلاب...
            </div>
        ) : students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(56,189,248,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px', fontFamily: "'Cairo', sans-serif" }}>لا يوجد طلاب بعد</h3>
                <p style={{ fontSize: '13px', color: '#64748b', fontFamily: "'Cairo', sans-serif" }}>سيظهر الطلاب هنا بعد تسجيلهم في موادك</p>
            </div>
        ) : (
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '12px' }}>
                    {['الطالب', 'البريد الإلكتروني'].map(h => (
                        <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Cairo', sans-serif" }}>{h}</span>
                    ))}
                </div>
                {students.map((st, idx) => (
                    <div key={idx} style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        padding: '12px 18px', gap: '12px', alignItems: 'center',
                        borderBottom: idx < students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        transition: 'background 0.15s',
                    }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                                background: 'rgba(56,189,248,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', fontFamily: "'Cairo', sans-serif" }}>{st.name}</span>
                        </div>
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontFamily: "'Cairo', sans-serif" }}>{st.email}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default TeacherStudents;

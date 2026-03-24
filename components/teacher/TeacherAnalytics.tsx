import React from 'react';
import { Subject } from './types';
import TeacherStats from './TeacherStats';

interface Activity { text: string; time: string; icon?: string }

interface TeacherAnalyticsProps {
    subjects: Subject[];
    totalSubjects: number;
    totalStudents: number;
    totalLectures: number;
    publishedCount: number;
    activities: Activity[];
}

const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({
    subjects, totalSubjects, totalStudents, totalLectures, publishedCount, activities,
}) => (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
        <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 18px', fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round"/>
                <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round"/>
                <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round"/>
            </svg>
            الإحصائيات
        </h2>

        <TeacherStats
            totalSubjects={totalSubjects}
            totalStudents={totalStudents}
            totalLectures={totalLectures}
            publishedCount={publishedCount}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Subject performance */}
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px', fontFamily: "'Cairo', sans-serif" }}>أداء المواد</h3>
                {subjects.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', fontFamily: "'Cairo', sans-serif" }}>لا توجد مواد بعد</p>
                ) : subjects.map(sub => {
                    const lecs = sub.levels.reduce((a, l) => a + l.lectures.length, 0);
                    const pct = Math.min(100, Math.round((sub.students / (totalStudents || 1)) * 100));
                    return (
                        <div key={sub.id} style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', fontFamily: "'Cairo', sans-serif" }}>{sub.name}</span>
                                <span style={{ fontSize: '11px', color: '#64748b', fontFamily: "'Cairo', sans-serif" }}>{sub.students} طالب · {lecs} محاضرة</span>
                            </div>
                            <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: 'linear-gradient(90deg, #f59e0b, #d97706)', transition: 'width 0.6s ease' }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent activity */}
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px', fontFamily: "'Cairo', sans-serif" }}>آخر الأنشطة</h3>
                {activities.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', fontFamily: "'Cairo', sans-serif" }}>لا توجد أنشطة حديثة</p>
                ) : activities.map((a, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0',
                        borderBottom: i < activities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '13px', color: '#cbd5e1', fontFamily: "'Cairo', sans-serif", display: 'block' }}>{a.text}</span>
                            <span style={{ fontSize: '11px', color: '#475569', fontFamily: "'Cairo', sans-serif" }}>{a.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default TeacherAnalytics;

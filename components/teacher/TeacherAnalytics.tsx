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
    <div className="animate-fade-in">
        <h2 className="text-lg font-extrabold text-slate-100 mb-4 font-cairo flex items-center gap-2">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Subject performance */}
            <div className="bg-[#0f172a]/80 border border-white/[0.07] rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-100 mb-4 font-cairo">أداء المواد</h3>
                {subjects.length === 0 ? (
                    <p className="text-center text-slate-500 text-[13px] font-cairo">لا توجد مواد بعد</p>
                ) : subjects.map(sub => {
                    const lecs = sub.levels.reduce((a, l) => a + l.lectures.length, 0);
                    const pct = Math.min(100, Math.round((sub.students / (totalStudents || 1)) * 100));
                    return (
                        <div key={sub.id} className="mb-3.5">
                            <div className="flex justify-between mb-1.5">
                                <span className="text-[13px] font-semibold text-slate-300 font-cairo">{sub.Title}</span>
                                <span className="text-[11px] text-slate-500 font-cairo">{sub.students} طالب · {lecs} محاضرة</span>
                            </div>
                            <div className="h-[7px] rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent activity */}
            <div className="bg-[#0f172a]/80 border border-white/[0.07] rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-100 mb-4 font-cairo">آخر الأنشطة</h3>
                {activities.length === 0 ? (
                    <p className="text-center text-slate-500 text-[13px] font-cairo">لا توجد أنشطة حديثة</p>
                ) : activities.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.04] last:border-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/[0.08] flex items-center justify-center shrink-0">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[13px] text-slate-300 font-cairo block">{a.text}</span>
                            <span className="text-[11px] text-slate-500 font-cairo">{a.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default TeacherAnalytics;

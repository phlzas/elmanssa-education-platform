/**
 * Updated saveSubject function for TeacherDashboard.tsx
 * Uses the new /api/v1/courses/with-curriculum endpoint
 * 
 * INSTRUCTIONS:
 * 1. Import createCourseWithCurriculum from services/api
 * 2. Replace the existing saveSubject function with this implementation
 */

import { createCourseWithCurriculum, updateTeacherSubject } from '../../services/api';
import { Subject, Level } from './types';

export const createSaveSubjectFunction = (
    token: string | null,
    editingSubject: Subject | null,
    newSubjectName: string,
    newSubjectDesc: string,
    newSubjectIcon: string,
    newLevels: Level[],
    subjects: Subject[],
    setSubjects: (subjects: Subject[]) => void,
    showToast: (message: string, type: 'success' | 'error') => void,
    setShowCreateModal: (show: boolean) => void,
    resetForm: () => void
) => {
    return async () => {
        if (!token) return;

        try {
            if (editingSubject) {
                // Update existing course (keep existing logic)
                await updateTeacherSubject(token, parseInt(editingSubject.id), {
                    title: newSubjectName,
                    description: newSubjectDesc,
                });
                
                setSubjects(subjects.map(s =>
                    s.id === editingSubject.id
                        ? { ...s, name: newSubjectName, description: newSubjectDesc, icon: newSubjectIcon, levels: newLevels }
                        : s
                ));
                showToast('تم تحديث المادة بنجاح', 'success');
            } else {
                // NEW: Create course with complete curriculum in one API call
                
                // Calculate total duration from all lectures
                const totalDuration = newLevels.reduce((total, level) => {
                    return total + level.lectures.reduce((sum, lec) => {
                        // Parse duration formats: "45 min", "1:30:00", "90"
                        const durationStr = lec.duration.trim();
                        
                        // Format: "HH:MM:SS" or "MM:SS"
                        if (durationStr.includes(':')) {
                            const parts = durationStr.split(':').map(p => parseInt(p) || 0);
                            if (parts.length === 3) {
                                return sum + (parts[0] * 60 + parts[1]); // hours to minutes + minutes
                            } else if (parts.length === 2) {
                                return sum + parts[0]; // just minutes
                            }
                        }
                        
                        // Format: "45 min" or "45"
                        const match = durationStr.match(/(\d+)/);
                        return sum + (match ? parseInt(match[1]) : 0);
                    }, 0);
                }, 0);

                // Build the request payload
                const courseData = {
                    title: newSubjectName,
                    description: newSubjectDesc || undefined,
                    category: 'عام', // Default category - can be made configurable
                    duration: Math.max(1, totalDuration), // Ensure at least 1 hour
                    level: 'مبتدئ', // Default level - can be made configurable
                    language: 'العربية',
                    price: 0, // Free by default - can be made configurable
                    imageUrl: undefined, // Can be added later with image upload
                    sections: newLevels.map((level, index) => ({
                        title: level.name,
                        sortOrder: index,
                        lectures: level.lectures
                            .filter(lec => lec.title.trim()) // Only include lectures with titles
                            .map((lec, lecIndex) => ({
                                title: lec.title,
                                duration: lec.duration || undefined,
                                videoUrl: lec.videoUrl || undefined,
                                sortOrder: lecIndex,
                                isPreview: lecIndex === 0, // First lecture in each section as preview
                            })),
                    })).filter(section => section.lectures.length > 0), // Only include sections with lectures
                };

                // Call the new API endpoint
                const created = await createCourseWithCurriculum(token, courseData);
                
                // Map API response to local Subject format
                const newSubject: Subject = {
                    id: created.id?.toString() || `subj-${Date.now()}`,
                    name: created.title,
                    description: created.description || '',
                    icon: newSubjectIcon,
                    levels: (created.sections || []).map((s: any) => ({
                        id: s.id?.toString() || `lev-${Date.now()}`,
                        name: s.title,
                        lectures: (s.lectures || []).map((l: any) => ({
                            id: l.id?.toString() || `lec-${Date.now()}`,
                            title: l.title,
                            duration: l.duration || '00:00',
                            videoUrl: l.videoUrl || '',
                        })),
                    })),
                    students: created.studentsCount || 0,
                    status: created.status === 'published' ? 'published' : 'draft',
                    createdAt: created.createdAt 
                        ? new Date(created.createdAt).toISOString().split('T')[0] 
                        : new Date().toISOString().split('T')[0],
                };
                
                setSubjects([...subjects, newSubject]);
                showToast('تم إنشاء المادة بنجاح ✨', 'success');
            }
        } catch (err: any) {
            console.error('Error saving subject', err);
            const errorMessage = err.message || 'حدث خطأ أثناء حفظ المادة';
            showToast(errorMessage, 'error');
            
            // Optional: Fallback to local state update on error
            // This keeps the UI responsive even if API fails
            if (!editingSubject) {
                const fallbackSubject: Subject = {
                    id: `subj-${Date.now()}`,
                    name: newSubjectName,
                    description: newSubjectDesc,
                    icon: newSubjectIcon,
                    levels: newLevels,
                    students: 0,
                    status: 'draft',
                    createdAt: new Date().toISOString().split('T')[0],
                };
                setSubjects([...subjects, fallbackSubject]);
            }
        }
        
        setShowCreateModal(false);
        resetForm();
    };
};

/**
 * USAGE EXAMPLE in TeacherDashboard.tsx:
 * 
 * // 1. Import the function
 * import { createSaveSubjectFunction } from './teacher/saveSubjectUpdated';
 * import { createCourseWithCurriculum } from '../services/api';
 * 
 * // 2. Replace the saveSubject function definition with:
 * const saveSubject = createSaveSubjectFunction(
 *     localStorage.getItem(TOKEN_KEY),
 *     editingSubject,
 *     newSubjectName,
 *     newSubjectDesc,
 *     newSubjectIcon,
 *     newLevels,
 *     subjects,
 *     setSubjects,
 *     showToast,
 *     setShowCreateModal,
 *     resetForm
 * );
 * 
 * OR simply copy the async function body and replace the existing saveSubject
 */


export interface Lecture {
    id: string;
    title: string;
    duration: string;
    videoUrl: string;
}

export interface Level {
    id: string;
    name: string;
    lectures: Lecture[];
}

export interface Subject {
    id: string;
    name: string;
    description: string;
    icon: string;
    levels: Level[];
    students: number;
    status: 'published' | 'draft';
    createdAt: string;
}

export type TeacherNavItem = 'dashboard' | 'subjects' | 'students' | 'analytics' | 'profile';

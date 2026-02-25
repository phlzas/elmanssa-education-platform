
import { Subject } from './types';

export const initialSubjects: Subject[] = [
    {
        id: 'chem',
        name: 'كيمياء',
        description: 'اساسيات الكيمياء العضوية والتفاعلات الكيميائية',
        icon: '🧪',
        students: 128,
        status: 'published',
        createdAt: '2026-01-15',
        levels: [
            {
                id: 'chem-l1',
                name: 'المستوى 1',
                lectures: [
                    { id: 'c1', title: 'خطة المنهج', duration: '15:30', videoUrl: '' },
                    { id: 'c2', title: 'اساسيات الكيمياء العضوية', duration: '45:20', videoUrl: '' },
                    { id: 'c3', title: 'المحاضرة الثانية الكيمياء العضوية', duration: '52:10', videoUrl: '' },
                ],
            },
            {
                id: 'chem-l2',
                name: 'المستوى 2',
                lectures: [
                    { id: 'c4', title: 'تفاعلات النشادر', duration: '40:00', videoUrl: '' },
                    { id: 'c5', title: 'التفاعلات الذهنى', duration: '42:15', videoUrl: '' },
                ],
            },
        ],
    },
    {
        id: 'phys',
        name: 'فيزياء',
        description: 'أساسيات الفيزياء وقوانين الحركة والكهرباء',
        icon: '⚡',
        students: 95,
        status: 'published',
        createdAt: '2026-02-01',
        levels: [
            {
                id: 'phys-l1',
                name: 'المستوى 1',
                lectures: [
                    { id: 'p1', title: 'اساسيات الفيزياء', duration: '50:00', videoUrl: '' },
                    { id: 'p2', title: 'قانون اوم الجزء الاول', duration: '55:30', videoUrl: '' },
                ],
            },
        ],
    },
];

export const subjectIcons = ['🧪', '⚡', '📐', '🧮', '⚙️', '📝', '🌍', '🎨', '💻', '🔬', '📊', '🎵', '🏛️', '🧬', '📖', '🔧'];

export const mockStudents = [
    { name: 'سعد الحربي', avatar: '🧑', email: 's.harbi@email.com', subject: 'كيمياء', level: 'المستوى 2', progress: 85, status: 'نشط' },
    { name: 'ريم الشهري', avatar: '👩', email: 'reem@email.com', subject: 'كيمياء', level: 'المستوى 1', progress: 62, status: 'نشط' },
    { name: 'خالد المطيري', avatar: '🧑', email: 'khalid@email.com', subject: 'فيزياء', level: 'المستوى 1', progress: 45, status: 'نشط' },
    { name: 'نورة القحطاني', avatar: '👩', email: 'noura@email.com', subject: 'كيمياء', level: 'المستوى 1', progress: 100, status: 'مكتمل' },
    { name: 'فهد العتيبي', avatar: '🧑', email: 'fahad@email.com', subject: 'فيزياء', level: 'المستوى 1', progress: 30, status: 'نشط' },
    { name: 'سارة الدوسري', avatar: '👩', email: 'sara@email.com', subject: 'كيمياء', level: 'المستوى 2', progress: 10, status: 'جديد' },
    { name: 'عبدالله الغامدي', avatar: '🧑', email: 'abdullah@email.com', subject: 'كيمياء', level: 'المستوى 1', progress: 78, status: 'نشط' },
];

export const mockActivities = [
    { text: 'سعد الحربي أكمل "تفاعلات النشادر"', time: 'منذ ساعة', icon: '✅' },
    { text: 'ريم الشهري بدأت المستوى 2 في كيمياء', time: 'منذ 3 ساعات', icon: '🚀' },
    { text: 'خالد المطيري شاهد "قانون اوم الجزء الاول"', time: 'منذ 5 ساعات', icon: '▶️' },
    { text: 'طالب جديد: سارة الدوسري انضمت لمادة كيمياء', time: 'منذ يوم', icon: '👋' },
    { text: 'نورة القحطاني أكملت جميع محاضرات كيمياء', time: 'منذ يومين', icon: '🏆' },
];

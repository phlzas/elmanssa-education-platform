
import { Course } from './types';

export const NAV_LINKS = [
  { name: 'الرئيسية', page: 'home' },
  { name: 'الدورات', page: 'courses' },
  { name: 'البث المباشر', page: 'live-stream' },
  { name: 'مساعد AI', page: 'ai' },
  { name: 'من نحن', page: 'about' },
];

export const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: 'المسار الشامل لتعلم تطوير الويب Full Stack',
    category: 'تطوير البرمجيات',
    description: 'كورس شامل يأخذك من الصفر للاحتراف في تطوير الويب باستخدام أحدث التقنيات MERN Stack.',
    instructor: 'أحمد العلي',
    rating: 4.8,
    duration: 45,
    students: 3500,
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'احتراف تصميم واجهات المستخدم UI/UX',
    category: 'التصميم',
    description: 'تعلم قواعد التصميم الأكاديمية وكيفية تطبيقها عملياً باستخدام Figma و Adobe XD.',
    instructor: 'سارة محمد',
    rating: 4.9,
    duration: 28,
    students: 2100,
    price: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'أساسيات التسويق الرقمي والسوشيال ميديا',
    category: 'التسويق',
    description: 'دليلك الشامل لدخول عالم التسويق الرقمي وإدارة الحملات الإعلانية الناجحة.',
    instructor: 'خالد عمر',
    rating: 4.7,
    duration: 15,
    students: 1800,
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    title: 'علم البيانات وتحليل البيج داتا Python',
    category: 'البيانات',
    description: 'تعلم كيفية استخراج البيانات وتحليلها وبناء نماذج التنبؤ باستخدام بايثون.',
    instructor: 'د. نور الدين',
    rating: 4.9,
    duration: 60,
    students: 4200,
    price: 550,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    title: 'إدارة المشاريع الاحترافية PMP',
    category: 'الإدارة',
    description: 'تأهيل كامل لاجتياز اختبار إدارة المشاريع الاحترافية مع تطبيقات عملية.',
    instructor: 'م. ياسر',
    rating: 4.6,
    duration: 35,
    students: 950,
    price: 600,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    title: 'التصوير الفوتوغرافي وتعديل الصور',
    category: 'الفنون',
    description: 'تعلم فنون التصوير وقواعد التكوين واحتراف تعديل الصور على لايت روم.',
    instructor: 'عمر فؤاد',
    rating: 4.8,
    duration: 12,
    students: 1500,
    price: 250,
    imageUrl: 'https://images.unsplash.com/photo-1554048612-387768052bf7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

export const FILTER_LEVELS = ['مبتدئ', 'متوسط', 'متقدم', 'خبير', 'جميع المستويات'];
export const FILTER_PRICES = ['مجاني', 'مدفوع', 'خصم خاص'];

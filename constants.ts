
import { Course } from './types';

export const NAV_LINKS = [
  { name: 'الرئيسية', page: 'home' },
  { name: 'الدورات', page: 'courses' },
  { name: 'البث المباشر', page: 'courses' },
  { name: 'من نحن', page: 'home' },
];

export const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: 'تطوير تطبيقات الويب الحديثة',
    category: 'تطوير الويب',
    description: 'تعلم بناء تطبيقات ويب فعالة باستخدام Node.js و React.',
    instructor: 'محمد علي',
    rating: 4.7,
    duration: 15,
    students: 2100,
    price: 349,
    imageUrl: 'https://picsum.photos/seed/webdev/400/225',
  },
  {
    id: 2,
    title: 'تصميم واجهات المستخدم UI/UX',
    category: 'التصميم',
    description: 'تعلم تصميم واجهات مستخدم جذابة وسهلة الاستخدام.',
    instructor: 'فاطمة حسن',
    rating: 4.9,
    duration: 10,
    students: 1820,
    price: 'free',
    imageUrl: 'https://picsum.photos/seed/uiux/400/225',
  },
  {
    id: 3,
    title: 'إدارة وسائل التواصل الاجتماعي',
    category: 'التسويق الرقمي',
    description: 'استراتيجيات فعالة لإدارة حسابات التواصل الاجتماعي.',
    instructor: 'أحمد محمد',
    rating: 4.9,
    duration: 16,
    students: 1450,
    price: 329,
    imageUrl: 'https://picsum.photos/seed/social/400/225',
  },
  {
    id: 4,
    title: 'أساسيات الأمن السيبراني',
    category: 'الأمن',
    description: 'حماية الشبكات والبيانات من الهجمات الإلكترونية.',
    instructor: 'علياء سالم',
    rating: 4.8,
    duration: 20,
    students: 3200,
    price: 450,
    imageUrl: 'https://picsum.photos/seed/security/400/225',
  },
  {
    id: 5,
    title: 'تحليل البيانات باستخدام Python',
    category: 'علم البيانات',
    description: 'استخراج رؤى قيمة من البيانات باستخدام مكتبات Python.',
    instructor: 'خالد يوسف',
    rating: 4.9,
    duration: 25,
    students: 4100,
    price: 500,
    imageUrl: 'https://picsum.photos/seed/data/400/225',
  },
  {
    id: 6,
    title: 'مقدمة في الذكاء الاصطناعي',
    category: 'الذكاء الاصطناعي',
    description: 'فهم المبادئ الأساسية للذكاء الاصطناعي وتعلم الآلة.',
    instructor: 'نورة عبدالله',
    rating: 4.6,
    duration: 18,
    students: 2800,
    price: 399,
    imageUrl: 'https://picsum.photos/seed/ai/400/225',
  },
];

export const FILTER_LEVELS = ['مبتدئ', 'متوسط', 'متقدم', 'جميع المستويات'];
export const FILTER_PRICES = ['مجاني', 'مدفوع'];

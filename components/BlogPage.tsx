
import React from 'react';
import { Page } from '../App';

interface BlogPageProps {
    onNavigate: (page: Page) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-[#F8FAFA] min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-4xl font-black text-[#034289] mb-12 text-center">المدونة التقنية</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { title: 'أفضل 5 لغات برمجة في 2026', date: '5 مارس 2026', author: 'محمد علي', img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', desc: 'تعرف على اللغات التي تسيطر على سوق العمل هذا العام ولماذا يجب عليك تعلمها.' },
                        { title: 'كيف تبدأ في مجال الذكاء الاصطناعي؟', date: '20 فبراير 2026', author: 'سارة أحمد', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', desc: 'دليل شامل للمبتدئين لدخول عالم الـ AI والـ Machine Learning.' },
                        { title: 'تصميم الواجهات: قواعد لا يمكن كسرها', date: '15 فبراير 2026', author: 'عماد خليل', img: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', desc: 'أخطاء شائعة يقع فيها المصممون وكيف تتجنبها لإنتاج واجهات احترافية.' },
                        { title: 'تأمين تطبيقات الويب: أفضل الممارسات', date: '10 فبراير 2026', author: 'أحمد سعيد', img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', desc: 'حماية بيانات المستخدمين وتشفير المعلومات الحساسة في تطبيقات React.' }
                    ].map((post, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9] hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden group">
                            <div className="relative h-56 overflow-hidden">
                                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#034289] border border-[#D2E1D9]">{post.date}</div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#034289] mb-3 group-hover:text-[#4F8751] transition-colors">{post.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.desc}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-[#4F8751]">بقلم: {post.author}</span>
                                    <button className="text-[#034289] font-bold text-sm hover:underline hover:text-[#4F8751]">اقرأ المزيد &larr;</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;


import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, user, isLoggedIn } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user && isLoggedIn) {
      showToast(`مرحباً بك ${user.name}!`, 'success');
      const target: Page = user.role === 'admin' ? 'admin-dashboard' : (user.role === 'teacher' ? 'teacher-dashboard' : 'dashboard');
      onNavigate(target);
    }
  }, [user, isLoggedIn, onNavigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تسجيل الدخول');
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 md:py-20 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4F8751]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#034289]/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 dots-pattern opacity-20" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Card */}
        <div className="card-premium glass bg-white/90 p-8 md:p-10 rounded-3xl border border-[#D2E1D9]/50 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4F8751] to-[#6ba96d] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-[#034289] mb-2">تسجيل الدخول</h2>
            <p className="text-[#034289]/60">مرحباً بعودتك! قم بتسجيل الدخول للمتابعة</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-fade-in flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#034289] mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#034289]/40">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full pr-12 pl-4 py-3.5 bg-white border-2 border-[#D2E1D9] rounded-xl text-[#034289] placeholder:text-[#034289]/40 focus:border-[#4F8751] focus:ring-4 focus:ring-[#4F8751]/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-bold text-[#034289]">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('support')}
                  className="text-sm text-[#4F8751] hover:underline font-medium"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#034289]/40">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12 pl-4 py-3.5 bg-white border-2 border-[#D2E1D9] rounded-xl text-[#034289] placeholder:text-[#034289]/40 focus:border-[#4F8751] focus:ring-4 focus:ring-[#4F8751]/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                className="w-5 h-5 rounded border-2 border-[#D2E1D9] text-[#4F8751] focus:ring-[#4F8751] focus:ring-offset-0"
              />
              <label htmlFor="remember" className="text-[#034289]/70 text-sm">
                تذكرني في هذا الجهاز
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 text-lg font-bold text-white rounded-xl shadow-lg mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D2E1D9]" />
            <span className="text-[#034289]/50 text-sm">أو</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D2E1D9]" />
          </div>

          

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-[#034289]/70">
              ليس لديك حساب؟{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="font-bold text-[#4F8751] hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

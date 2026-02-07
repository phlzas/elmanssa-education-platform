
import React, { useState } from 'react';
import { Page } from '../App';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
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
                <button type="button" className="text-sm text-[#4F8751] hover:underline font-medium">
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

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#D2E1D9] rounded-xl bg-white hover:bg-[#D2E1D9]/20 transition-all duration-300">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-[#034289] font-medium text-sm">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#D2E1D9] rounded-xl bg-white hover:bg-[#D2E1D9]/20 transition-all duration-300">
              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-[#034289] font-medium text-sm">Facebook</span>
            </button>
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

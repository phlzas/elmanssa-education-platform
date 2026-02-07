
import React, { useState, useEffect } from 'react';
import { Page, AccountType } from '../App';

interface SignUpFormProps {
  initialAccountType?: AccountType;
  onNavigate: (page: Page) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ initialAccountType = 'student', onNavigate }) => {
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setAccountType(initialAccountType);
  }, [initialAccountType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 md:py-20 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#034289]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#4F8751]/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 dots-pattern opacity-20" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in-up">
        {/* Card */}
        <div className="card-premium glass bg-white/90 p-8 md:p-10 rounded-3xl border border-[#D2E1D9]/50 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#034289] to-[#0459b7] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-[#034289] mb-2">إنشاء حساب جديد</h2>
            <p className="text-[#034289]/60">انضم إلى مجتمعنا التعليمي اليوم</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s
                    ? 'bg-[#4F8751] text-white'
                    : 'bg-[#D2E1D9] text-[#034289]/50'
                  }`}>
                  {step > s ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${step > s ? 'bg-[#4F8751]' : 'bg-[#D2E1D9]'
                    }`} />
                )}
              </div>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Account Type Selector */}
            <div>
              <label className="block text-sm font-bold text-[#034289] mb-3">نوع الحساب</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('student')}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${accountType === 'student'
                      ? 'border-[#4F8751] bg-[#4F8751]/5'
                      : 'border-[#D2E1D9] bg-white hover:border-[#4F8751]/50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors ${accountType === 'student' ? 'bg-[#4F8751]' : 'bg-[#D2E1D9]'
                    }`}>
                    <svg className={`w-6 h-6 ${accountType === 'student' ? 'text-white' : 'text-[#034289]/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                  <span className={`font-bold block ${accountType === 'student' ? 'text-[#4F8751]' : 'text-[#034289]'}`}>
                    طالب
                  </span>
                  <span className="text-xs text-[#034289]/50">تعلم مهارات جديدة</span>
                  {accountType === 'student' && (
                    <div className="absolute top-2 left-2 w-5 h-5 bg-[#4F8751] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('teacher')}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${accountType === 'teacher'
                      ? 'border-[#4F8751] bg-[#4F8751]/5'
                      : 'border-[#D2E1D9] bg-white hover:border-[#4F8751]/50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors ${accountType === 'teacher' ? 'bg-[#4F8751]' : 'bg-[#D2E1D9]'
                    }`}>
                    <svg className={`w-6 h-6 ${accountType === 'teacher' ? 'text-white' : 'text-[#034289]/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className={`font-bold block ${accountType === 'teacher' ? 'text-[#4F8751]' : 'text-[#034289]'}`}>
                    مدرس
                  </span>
                  <span className="text-xs text-[#034289]/50">شارك معرفتك</span>
                  {accountType === 'teacher' && (
                    <div className="absolute top-2 left-2 w-5 h-5 bg-[#4F8751] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-bold text-[#034289] mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#034289]/40">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="fullName"
                  placeholder="أدخل اسمك الكامل"
                  className="w-full pr-12 pl-4 py-3.5 bg-white border-2 border-[#D2E1D9] rounded-xl text-[#034289] placeholder:text-[#034289]/40 focus:border-[#4F8751] focus:ring-4 focus:ring-[#4F8751]/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#034289] mb-2">
                كلمة المرور
              </label>
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
              {/* Password strength indicator */}
              <div className="flex gap-1 mt-2">
                <div className="h-1 flex-1 bg-[#4F8751] rounded" />
                <div className="h-1 flex-1 bg-[#4F8751]/60 rounded" />
                <div className="h-1 flex-1 bg-[#D2E1D9] rounded" />
                <div className="h-1 flex-1 bg-[#D2E1D9] rounded" />
              </div>
              <p className="text-xs text-[#034289]/50 mt-1">كلمة مرور متوسطة القوة</p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                className="w-5 h-5 rounded border-2 border-[#D2E1D9] text-[#4F8751] focus:ring-[#4F8751] focus:ring-offset-0 mt-0.5"
              />
              <label htmlFor="terms" className="text-[#034289]/70 text-sm leading-relaxed">
                بإنشاء حساب، أوافق على{' '}
                <a href="#" className="text-[#4F8751] hover:underline">شروط الخدمة</a>
                {' '}و{' '}
                <a href="#" className="text-[#4F8751] hover:underline">سياسة الخصوصية</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 text-lg font-bold text-white rounded-xl shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  'إنشاء الحساب'
                )}
              </span>
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-[#034289]/70">
              لديك حساب بالفعل؟{' '}
              <button
                onClick={() => onNavigate('login')}
                className="font-bold text-[#4F8751] hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;

import React, { useState, useEffect } from 'react';
import { Page, AccountType } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { validateEmail, validatePhoneNumber, validateNationalId, sanitizePlainText, ERROR_MESSAGES } from '../utils/validation';

interface SignUpFormProps {
  initialAccountType?: AccountType;
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ initialAccountType = 'student', onNavigate }) => {
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [nationalId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [cvUrl] = useState('');
  const [avatarUrl] = useState('');

  const { signup, signupTeacher, user, isLoggedIn } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    setAccountType(initialAccountType);
  }, [initialAccountType]);

  useEffect(() => {
    if (user && isLoggedIn) {
      showToast(`مرحبا بك ${user.name}! تم إنشاء حسابك بنجاح`, 'success');
    }
  }, [user, isLoggedIn, showToast]);

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    return score;
  };

  const strengthLabels = ['', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];
  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-[#4F8751]/60', 'bg-[#4F8751]'];
  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!fullName.trim() || !email.trim() || !password || !phoneNumber.trim()) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    // Sanitize and validate full name
    const sanitizedName = sanitizePlainText(fullName, 100);
    if (sanitizedName.length < 2) {
      setError('الاسم يجب أن يكون حرفين على الأقل');
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setError(ERROR_MESSAGES.invalidEmail);
      return;
    }

    // Validate password
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setError('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتشمل حرفا كبيرا وحرفا صغيرا ورقما');
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setError(ERROR_MESSAGES.invalidPhone);
      return;
    }

    // Sanitize phone number (remove non-digits)
    const sanitizedPhone = phoneNumber.replace(/\D/g, '');

    // Validate nationalId if provided
    let sanitizedNationalId = nationalId;
    if (nationalId && nationalId.trim()) {
      if (!validateNationalId(nationalId)) {
        setError(ERROR_MESSAGES.invalidNationalId);
        return;
      }
      sanitizedNationalId = nationalId.replace(/\D/g, '');
    }

    // Sanitize optional fields for teachers
    let sanitizedSpecialization = specialization;
    let sanitizedBio = bio;
    if (accountType === 'teacher') {
      sanitizedSpecialization = specialization ? sanitizePlainText(specialization, 100) : '';
      sanitizedBio = bio ? sanitizePlainText(bio, 2000) : '';

      const years = Number(yearsOfExperience || '0');
      if (yearsOfExperience && (isNaN(years) || years < 0 || years > 100)) {
        setError('عدد سنوات الخبرة يجب أن يكون بين 0 و 100');
        return;
      }
    }

    setError('');
    setIsLoading(true);
    try {
      if (accountType === 'teacher') {
        const years = Number(yearsOfExperience || '0');
        await signupTeacher({
          name: sanitizedName,
          email: email.trim().toLowerCase(),
          password,
          nationalId: sanitizedNationalId,
          phoneNumber: sanitizedPhone,
          yearsOfExperience: years,
          specialization: sanitizedSpecialization,
          bio: sanitizedBio,
          cvUrl,
          avatarUrl
        });
      } else {
        await signup(sanitizedName, email.trim().toLowerCase(), password, accountType, sanitizedPhone, sanitizedNationalId);
      }
      showToast('تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني', 'success');
      onNavigate('verify-email', { email: email.trim().toLowerCase() });
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3.5 bg-[#e7e8e9] rounded-lg text-[#191c1d] placeholder:text-[#737782] ' +
    'focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#034289]/30 ' +
    'transition-all duration-200 text-right';

  const labelClass = 'block text-xs font-semibold text-[#434751] mb-1.5 text-right';

  return (
    <div dir="rtl" className="min-h-[80vh] flex items-center justify-center py-12 md:py-20 px-4 bg-[#f3f4f5] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#034289]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#4F8751]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(3,66,137,0.08)] p-8 md:p-10">

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#034289] to-[#002c61] rounded-xl flex items-center justify-center mx-auto mb-5 shadow-md">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-[#002c61] mb-1">إنشاء حساب جديد</h1>
            <p className="text-sm text-[#434751]">انضم إلى مجتمعنا التعليمي اليوم</p>
          </div>

          {error && (
            <div role="alert" className="mb-5 p-4 bg-[#ffdad6] rounded-lg text-[#93000a] text-sm font-medium">
              {error.split('\n').map((line, i) => (
                <div key={i} className="flex items-start gap-2 mb-1 last:mb-0">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>

            <div>
              <span className="block text-xs font-semibold text-[#434751] mb-2 text-right">نوع الحساب</span>
              <div className="flex rounded-lg bg-[#e7e8e9] p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setAccountType('student')}
                  aria-pressed={accountType === 'student'}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-bold transition-colors duration-200 cursor-pointer ${accountType === 'student' ? 'bg-[#034289] text-white shadow-sm' : 'text-[#434751] hover:bg-[#d9dadb]'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  طالب
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('teacher')}
                  aria-pressed={accountType === 'teacher'}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-bold transition-colors duration-200 cursor-pointer ${accountType === 'teacher' ? 'bg-[#034289] text-white shadow-sm' : 'text-[#434751] hover:bg-[#d9dadb]'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  مدرس
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className={labelClass}>الاسم الكامل</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737782] pointer-events-none" aria-hidden="true">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input type="text" id="fullName" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="أدخل اسمك الكامل" autoComplete="name" className={`${inputClass} pl-10`} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737782] pointer-events-none" aria-hidden="true">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" autoComplete="email" dir="ltr" className={`${inputClass} pl-10 text-left`} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>كلمة المرور</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737782] pointer-events-none" aria-hidden="true">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="" autoComplete="new-password" className={`${inputClass} pl-10`} />
              </div>
              <div className="flex gap-1 mt-2" aria-hidden="true">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className={`h-1 flex-1 rounded transition-all duration-300 ${strength >= level ? strengthColors[strength] : 'bg-[#e1e3e4]'}`} />
                ))}
              </div>
              {password.length > 0 && (
                <p className="text-xs text-[#737782] mt-1 text-right">
                  كلمة مرور {strengthLabels[strength]}  يجب أن تحتوي على حرف كبير وحرف صغير ورقم
                </p>
              )}
            </div>

            <div>
                <label htmlFor="phoneNumber" className={labelClass}>رقم الهاتف</label>
                <input type="tel" id="phoneNumber" name="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="أدخل رقم هاتفك" autoComplete="tel" dir="ltr" className={`${inputClass} text-left`} />
            </div>

            {accountType === 'teacher' && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="yearsOfExperience" className={labelClass}>سنوات الخبرة <span className="text-[#737782] font-normal">(اختياري)</span></label>
                  <input type="number" id="yearsOfExperience" name="yearsOfExperience" min={0} max={100} value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} placeholder="عدد السنوات (0-100)" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="specialization" className={labelClass}>التخصص <span className="text-[#737782] font-normal">(اختياري)</span></label>
                  <input type="text" id="specialization" name="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="مثال: برمجة رياضيات" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="bio" className={labelClass}>نبذة <span className="text-[#737782] font-normal">(اختياري)</span></label>
                  <textarea id="bio" name="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="نبذة مختصرة عنك" className={`${inputClass} resize-none`} />
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" className="w-4 h-4 mt-0.5 rounded border-[#c3c6d2] text-[#4F8751] focus:ring-[#4F8751] focus:ring-offset-0 cursor-pointer shrink-0" />
              <label htmlFor="terms" className="text-[#434751] text-sm leading-relaxed cursor-pointer">
                بإنشاء حساب أوافق على{' '}
                <a href="#" className="text-[#4F8751] hover:underline transition-colors duration-200 cursor-pointer">شروط الخدمة</a>
                {' '}و{' '}
                <a href="#" className="text-[#4F8751] hover:underline transition-colors duration-200 cursor-pointer">سياسة الخصوصية</a>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 text-base font-bold text-white rounded-lg bg-gradient-to-l from-[#034289] to-[#002c61] hover:shadow-[0_8px_24px_rgba(3,66,137,0.25)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all duration-200">
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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

          <div className="text-center mt-7">
            <p className="text-[#434751] text-sm">
              لديك حساب بالفعل{' '}
              <button type="button" onClick={() => onNavigate('login')} className="font-bold text-[#4F8751] hover:underline transition-colors duration-200 cursor-pointer">
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
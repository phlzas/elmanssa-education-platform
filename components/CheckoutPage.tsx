
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_COURSES } from '../constants';
import { Course } from '../types';
import { Page, AccountType } from '../App';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import ClockIcon from './icons/ClockIcon';
import StarIcon from './icons/StarIcon';

interface CheckoutPageProps {
    courseId: number;
    onNavigate: (page: Page, payload?: { accountType?: AccountType; courseId?: number }) => void;
}

type PaymentMethod = 'card' | 'wallet' | 'bank';
type CheckoutStep = 1 | 2 | 3;

const CheckoutPage: React.FC<CheckoutPageProps> = ({ courseId, onNavigate }) => {
    const [course, setCourse] = useState<Course | null>(null);
    const [step, setStep] = useState<CheckoutStep>(1);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [animating, setAnimating] = useState(false);

    // Form fields
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        cardNumber: '',
        cardExpiry: '',
        cardCVC: '',
        cardHolder: '',
        walletType: 'vodafone',
        walletPhone: '',
        bankName: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const foundCourse = MOCK_COURSES.find(c => c.id === courseId);
        setCourse(foundCourse || null);
        window.scrollTo(0, 0);
    }, [courseId]);

    const discount = couponApplied ? 0.15 : 0;
    const originalPrice = typeof course?.price === 'number' ? course.price : 0;
    const discountAmount = originalPrice * discount;
    const finalPrice = originalPrice - discountAmount;

    const handleInputChange = (field: string, value: string) => {
        let formatted = value;

        if (field === 'cardNumber') {
            formatted = value.replace(/\D/g, '').slice(0, 16);
            formatted = formatted.replace(/(.{4})/g, '$1 ').trim();
        }

        if (field === 'cardExpiry') {
            formatted = value.replace(/\D/g, '').slice(0, 4);
            if (formatted.length >= 2) {
                formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
            }
        }

        if (field === 'cardCVC') {
            formatted = value.replace(/\D/g, '').slice(0, 3);
        }

        if (field === 'phone' || field === 'walletPhone') {
            formatted = value.replace(/\D/g, '').slice(0, 11);
        }

        setFormData(prev => ({ ...prev, [field]: formatted }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const applyCoupon = () => {
        if (couponCode.toLowerCase() === 'elmanssa15' || couponCode.toLowerCase() === 'welcome') {
            setCouponApplied(true);
            setCouponError('');
        } else {
            setCouponError('كود الخصم غير صالح');
            setCouponApplied(false);
        }
    };

    const validateStep = (currentStep: CheckoutStep): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = 'الاسم الكامل مطلوب';
            if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'بريد إلكتروني غير صالح';
            if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
            else if (formData.phone.length < 10) newErrors.phone = 'رقم الهاتف غير صالح';
        }

        if (currentStep === 2) {
            if (paymentMethod === 'card') {
                if (!formData.cardHolder.trim()) newErrors.cardHolder = 'اسم حامل البطاقة مطلوب';
                if (formData.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'رقم البطاقة غير مكتمل';
                if (formData.cardExpiry.length < 5) newErrors.cardExpiry = 'تاريخ انتهاء غير صالح';
                if (formData.cardCVC.length < 3) newErrors.cardCVC = 'رمز CVC غير صالح';
            }
            if (paymentMethod === 'wallet') {
                if (!formData.walletPhone.trim()) newErrors.walletPhone = 'رقم المحفظة مطلوب';
                else if (formData.walletPhone.length < 11) newErrors.walletPhone = 'رقم المحفظة غير صالح';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goToStep = (newStep: CheckoutStep) => {
        if (newStep > step && !validateStep(step)) return;
        setAnimating(true);
        setTimeout(() => {
            setStep(newStep);
            setAnimating(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 200);
    };

    const handleSubmit = async () => {
        if (!validateStep(2)) return;
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsProcessing(false);
        onNavigate('payment-success' as Page, { courseId });
    };

    // Detect card type
    const cardType = useMemo(() => {
        const num = formData.cardNumber.replace(/\s/g, '');
        if (num.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
        if (num.startsWith('62') || num.startsWith('81')) return 'meeza';
        return 'unknown';
    }, [formData.cardNumber]);

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F8751]"></div>
            </div>
        );
    }

    if (course.price === 'free') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFA] py-20 px-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md animate-scale-in">
                    <div className="w-20 h-20 bg-[#4F8751]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckBadgeIcon className="w-10 h-10 text-[#4F8751]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#034289] mb-3">هذه الدورة مجانية!</h2>
                    <p className="text-[#034289]/60 mb-8">يمكنك البدء في التعلم الآن بدون أي تكاليف.</p>
                    <button onClick={() => onNavigate('dashboard')} className="btn-primary w-full py-4 text-white font-bold rounded-xl text-lg">
                        ابدأ التعلم الآن
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFA] min-h-screen pb-20">
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-white rounded-3xl p-10 text-center max-w-sm mx-4 animate-scale-in shadow-2xl">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-[#D2E1D9]"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-[#4F8751] animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-t-[#034289] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <h3 className="text-xl font-bold text-[#034289] mb-2">جارٍ معالجة الدفع...</h3>
                        <p className="text-[#034289]/60 text-sm">يرجى الانتظار وعدم إغلاق الصفحة</p>
                        <div className="mt-6 h-1.5 bg-[#D2E1D9]/30 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-l from-[#4F8751] to-[#034289] rounded-full animate-shimmer" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-[#034289] text-white py-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#4F8751]/15 rounded-full blur-3xl" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => onNavigate('course-detail', { courseId })} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold">إتمام الشراء</h1>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mt-6 max-w-md mx-auto">
                        {[
                            { num: 1, label: 'البيانات الشخصية' },
                            { num: 2, label: 'طريقة الدفع' },
                            { num: 3, label: 'التأكيد' },
                        ].map(({ num, label }, idx) => (
                            <React.Fragment key={num}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= num
                                            ? 'bg-[#4F8751] text-white shadow-lg shadow-[#4F8751]/30'
                                            : 'bg-white/10 text-white/50'
                                        }`}>
                                        {step > num ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : num}
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${step >= num ? 'text-white' : 'text-white/40'}`}>
                                        {label}
                                    </span>
                                </div>
                                {idx < 2 && (
                                    <div className={`flex-1 h-0.5 rounded-full mb-5 transition-all duration-500 ${step > num ? 'bg-[#4F8751]' : 'bg-white/10'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className={`lg:col-span-2 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>

                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <div className="bg-white rounded-2xl shadow-xl border border-[#D2E1D9]/50 p-6 md:p-8 animate-fade-in-up">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 bg-[#034289]/10 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-[#034289]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-[#034289]">البيانات الشخصية</h2>
                                        <p className="text-sm text-[#034289]/50">أدخل بياناتك لإتمام عملية الشراء</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-[#034289] mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            placeholder="أدخل الاسم الكامل"
                                            className={`w-full px-4 py-3.5 border-2 rounded-xl bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 transition-all focus:bg-white focus:border-[#4F8751] ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-[#D2E1D9]'}`}
                                            dir="rtl"
                                        />
                                        {errors.fullName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>{errors.fullName}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-bold text-[#034289] mb-2">البريد الإلكتروني <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="example@email.com"
                                            className={`w-full px-4 py-3.5 border-2 rounded-xl bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 transition-all focus:bg-white focus:border-[#4F8751] ${errors.email ? 'border-red-400 bg-red-50' : 'border-[#D2E1D9]'}`}
                                            dir="ltr"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>{errors.email}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-bold text-[#034289] mb-2">رقم الهاتف <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="01XXXXXXXXX"
                                            className={`w-full px-4 py-3.5 border-2 rounded-xl bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 transition-all focus:bg-white focus:border-[#4F8751] ${errors.phone ? 'border-red-400 bg-red-50' : 'border-[#D2E1D9]'}`}
                                            dir="ltr"
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>{errors.phone}</p>}
                                    </div>
                                </div>

                                <button onClick={() => goToStep(2)} className="btn-primary w-full py-4 text-white font-bold rounded-xl text-lg mt-8">
                                    التالي - طريقة الدفع
                                    <svg className="w-5 h-5 inline-block mr-2 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Payment Method Selector */}
                                <div className="bg-white rounded-2xl shadow-xl border border-[#D2E1D9]/50 p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-[#4F8751]/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-[#034289]">اختر طريقة الدفع</h2>
                                            <p className="text-sm text-[#034289]/50">جميع عمليات الدفع مشفرة وآمنة</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                        {/* Credit Card */}
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`relative p-4 rounded-xl border-2 transition-all text-center group ${paymentMethod === 'card'
                                                    ? 'border-[#4F8751] bg-[#4F8751]/5 shadow-md'
                                                    : 'border-[#D2E1D9] hover:border-[#4F8751]/50 hover:bg-[#F8FAFA]'
                                                }`}
                                        >
                                            {paymentMethod === 'card' && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#4F8751] rounded-full flex items-center justify-center shadow-md">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                            <svg className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-[#4F8751]' : 'text-[#034289]/40 group-hover:text-[#034289]/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            <span className={`text-xs font-bold ${paymentMethod === 'card' ? 'text-[#4F8751]' : 'text-[#034289]/60'}`}>بطاقة ائتمان</span>
                                        </button>

                                        {/* E-Wallet */}
                                        <button
                                            onClick={() => setPaymentMethod('wallet')}
                                            className={`relative p-4 rounded-xl border-2 transition-all text-center group ${paymentMethod === 'wallet'
                                                    ? 'border-[#4F8751] bg-[#4F8751]/5 shadow-md'
                                                    : 'border-[#D2E1D9] hover:border-[#4F8751]/50 hover:bg-[#F8FAFA]'
                                                }`}
                                        >
                                            {paymentMethod === 'wallet' && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#4F8751] rounded-full flex items-center justify-center shadow-md">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                            <svg className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'wallet' ? 'text-[#4F8751]' : 'text-[#034289]/40 group-hover:text-[#034289]/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            <span className={`text-xs font-bold ${paymentMethod === 'wallet' ? 'text-[#4F8751]' : 'text-[#034289]/60'}`}>محفظة إلكترونية</span>
                                        </button>

                                        {/* Bank Transfer */}
                                        <button
                                            onClick={() => setPaymentMethod('bank')}
                                            className={`relative p-4 rounded-xl border-2 transition-all text-center group ${paymentMethod === 'bank'
                                                    ? 'border-[#4F8751] bg-[#4F8751]/5 shadow-md'
                                                    : 'border-[#D2E1D9] hover:border-[#4F8751]/50 hover:bg-[#F8FAFA]'
                                                }`}
                                        >
                                            {paymentMethod === 'bank' && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#4F8751] rounded-full flex items-center justify-center shadow-md">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                            <svg className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'bank' ? 'text-[#4F8751]' : 'text-[#034289]/40 group-hover:text-[#034289]/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <span className={`text-xs font-bold ${paymentMethod === 'bank' ? 'text-[#4F8751]' : 'text-[#034289]/60'}`}>تحويل بنكي</span>
                                        </button>
                                    </div>

                                    {/* Card Form */}
                                    {paymentMethod === 'card' && (
                                        <div className="space-y-5 animate-fade-in">
                                            {/* Card Preview */}
                                            <div className="relative w-full aspect-[1.6/1] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl mb-6">
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#034289] via-[#0459b7] to-[#4F8751]" />
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                                                <div className="relative p-6 flex flex-col justify-between h-full text-white">
                                                    <div className="flex items-center justify-between">
                                                        <div className="w-12 h-8 bg-yellow-400/80 rounded-md" />
                                                        <span className="text-sm font-bold uppercase tracking-wider opacity-80">
                                                            {cardType === 'visa' ? 'VISA' : cardType === 'mastercard' ? 'MASTERCARD' : cardType === 'meeza' ? 'MEEZA' : ''}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-lg md:text-xl tracking-[0.15em] font-mono mb-2 dir-ltr" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                                                            {formData.cardNumber || '•••• •••• •••• ••••'}
                                                        </div>
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <div className="text-[10px] uppercase opacity-50 tracking-wider">CARD HOLDER</div>
                                                                <div className="text-sm font-medium tracking-wider" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                                                                    {formData.cardHolder || 'YOUR NAME'}
                                                                </div>
                                                            </div>
                                                            <div className="text-left" dir="ltr">
                                                                <div className="text-[10px] uppercase opacity-50 tracking-wider">EXPIRES</div>
                                                                <div className="text-sm font-medium font-mono">
                                                                    {formData.cardExpiry || 'MM/YY'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#034289] mb-2">اسم حامل البطاقة <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={formData.cardHolder}
                                                    onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                                                    placeholder="الاسم كما هو مكتوب على البطاقة"
                                                    className={`w-full px-4 py-3.5 border-2 rounded-xl bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 transition-all focus:bg-white focus:border-[#4F8751] ${errors.cardHolder ? 'border-red-400 bg-red-50' : 'border-[#D2E1D9]'}`}
                                                    dir="ltr"
                                                />
                                                {errors.cardHolder && <p className="text-red-500 text-xs mt-1.5">{errors.cardHolder}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#034289] mb-2">رقم البطاقة <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={formData.cardNumber}
                                                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                                                        placeholder="0000 0000 0000 0000"
                                                        className={`w-full px-4 py-3.5 border-2 rounded-xl bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 transition-all focus:bg-white focus:border-[#4F8751] font-mono ${errors.cardNumber ? 'border-red-400 bg-red-50' : 'border-[#D2E1D9]'}`}
                                                        dir="ltr"
                                                    />
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                                        <div className={`w-8 h-5 rounded border flex items-center justify-center text-[7px] font-bold transition-opacity ${cardType === 'visa' ? 'border-blue-400 text-blue-600 opacity-100' : 'border-gray-200 text-gray-300 opacity-40'}`}>VISA</div>
                                                        <div className={`w-8 h-5 rounded border flex items-center justify-center transition-opacity ${cardType === 'mastercard' ? 'opacity-100' : 'opacity-40'}`}>
                                                            <div className="flex -space-x-1">
                                                                <div className={`w-3 h-3 rounded-full ${cardType === 'mastercard' ? 'bg-red-500' : 'bg-gray-200'}`} />
                                                                <div className={`w-3 h-3 rounded-full ${cardType === 'mastercard' ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {errors.cardNumber && <p className="text-red-500 text-xs mt-1.5">{errors.cardNumber}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-[#034289] mb-2">تاريخ الانتهاء <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        value={formData.cardExpiry}
                                                        onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                                                        placeholder="MM/YY"
                                                        className={`w-full px-4 py-3.5 border-2 rounded-xl bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 transition-all focus:bg-white focus:border-[#4F8751] font-mono ${errors.cardExpiry ? 'border-red-400 bg-red-50' : 'border-[#D2E1D9]'}`}
                                                        dir="ltr"
                                                    />
                                                    {errors.cardExpiry && <p className="text-red-500 text-xs mt-1.5">{errors.cardExpiry}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-[#034289] mb-2">رمز CVC <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        value={formData.cardCVC}
                                                        onChange={(e) => handleInputChange('cardCVC', e.target.value)}
                                                        placeholder="•••"
                                                        className={`w-full px-4 py-3.5 border-2 rounded-xl bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 transition-all focus:bg-white focus:border-[#4F8751] font-mono ${errors.cardCVC ? 'border-red-400 bg-red-50' : 'border-[#D2E1D9]'}`}
                                                        dir="ltr"
                                                    />
                                                    {errors.cardCVC && <p className="text-red-500 text-xs mt-1.5">{errors.cardCVC}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Wallet Form */}
                                    {paymentMethod === 'wallet' && (
                                        <div className="space-y-5 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-bold text-[#034289] mb-3">اختر مزود المحفظة</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { id: 'vodafone', name: 'فودافون كاش', color: '#E60000' },
                                                        { id: 'etisalat', name: 'اتصالات كاش', color: '#009639' },
                                                        { id: 'orange', name: 'أورنج كاش', color: '#FF6600' },
                                                    ].map((wallet) => (
                                                        <button
                                                            key={wallet.id}
                                                            onClick={() => handleInputChange('walletType', wallet.id)}
                                                            className={`p-3 rounded-xl border-2 text-center transition-all ${formData.walletType === wallet.id
                                                                    ? 'border-[#4F8751] bg-[#4F8751]/5'
                                                                    : 'border-[#D2E1D9] hover:border-[#4F8751]/30'
                                                                }`}
                                                        >
                                                            <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: wallet.color + '15' }}>
                                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: wallet.color }} />
                                                            </div>
                                                            <span className="text-xs font-bold text-[#034289]">{wallet.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-[#034289] mb-2">رقم المحفظة <span className="text-red-500">*</span></label>
                                                <input
                                                    type="tel"
                                                    value={formData.walletPhone}
                                                    onChange={(e) => handleInputChange('walletPhone', e.target.value)}
                                                    placeholder="01XXXXXXXXX"
                                                    className={`w-full px-4 py-3.5 border-2 rounded-xl bg-[#F8FAFA] text-[#034289] placeholder-[#034289]/30 transition-all focus:bg-white focus:border-[#4F8751] ${errors.walletPhone ? 'border-red-400 bg-red-50' : 'border-[#D2E1D9]'}`}
                                                    dir="ltr"
                                                />
                                                {errors.walletPhone && <p className="text-red-500 text-xs mt-1.5">{errors.walletPhone}</p>}
                                            </div>
                                            <div className="bg-[#F8FAFA] rounded-xl p-4 border border-[#D2E1D9]">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-[#034289]/50 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-xs text-[#034289]/60 leading-relaxed">
                                                        سيتم إرسال رسالة تأكيد على رقم المحفظة المسجل. يرجى تأكيد الدفع عبر تطبيق المحفظة خلال 15 دقيقة.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bank Transfer Form */}
                                    {paymentMethod === 'bank' && (
                                        <div className="space-y-5 animate-fade-in">
                                            <div className="bg-[#034289]/5 rounded-xl p-5 border border-[#034289]/10">
                                                <h4 className="font-bold text-[#034289] mb-4 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    بيانات الحساب البنكي
                                                </h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { label: 'اسم البنك', value: 'البنك الأهلي المصري' },
                                                        { label: 'اسم الحساب', value: 'مؤسسة المنصة التعليمية' },
                                                        { label: 'رقم الحساب', value: '0123456789012345' },
                                                        { label: 'رقم الـ IBAN', value: 'EG38 0019 0005 0001 2345 6789 012' },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5">
                                                            <span className="text-sm text-[#034289]/60">{item.label}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-[#034289] font-mono" dir="ltr">{item.value}</span>
                                                                <button onClick={() => navigator.clipboard.writeText(item.value)} className="p-1 hover:bg-[#4F8751]/10 rounded transition-colors" title="نسخ">
                                                                    <svg className="w-4 h-4 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-bold text-yellow-700 mb-1">ملاحظات مهمة</p>
                                                        <ul className="text-xs text-yellow-600 space-y-1 list-disc list-inside">
                                                            <li>يرجى كتابة بريدك الإلكتروني في خانة الملاحظات عند التحويل</li>
                                                            <li>سيتم تفعيل الدورة خلال 24 ساعة من استلام التحويل</li>
                                                            <li>أرسل إيصال التحويل عبر البريد الإلكتروني: pay@elmanssa.com</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex gap-4">
                                    <button onClick={() => goToStep(1)} className="flex-1 py-4 border-2 border-[#D2E1D9] text-[#034289] font-bold rounded-xl hover:bg-[#F8FAFA] transition-colors">
                                        <svg className="w-5 h-5 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                        السابق
                                    </button>
                                    {paymentMethod === 'bank' ? (
                                        <button onClick={() => goToStep(3)} className="flex-1 btn-primary py-4 text-white font-bold rounded-xl text-lg">
                                            تأكيد التحويل
                                        </button>
                                    ) : (
                                        <button onClick={handleSubmit} className="flex-1 btn-primary py-4 text-white font-bold rounded-xl text-lg">
                                            ادفع {finalPrice} ج.م
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bank Transfer Confirmation */}
                        {step === 3 && (
                            <div className="bg-white rounded-2xl shadow-xl border border-[#D2E1D9]/50 p-6 md:p-8 animate-fade-in-up text-center">
                                <div className="w-20 h-20 bg-[#4F8751]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-[#4F8751]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-[#034289] mb-3">تم استلام طلبك بنجاح!</h2>
                                <p className="text-[#034289]/60 mb-2">رقم الطلب: <span className="font-bold font-mono text-[#034289]" dir="ltr">#ELM-{Date.now().toString().slice(-8)}</span></p>
                                <p className="text-[#034289]/60 mb-8 max-w-md mx-auto leading-relaxed">
                                    يرجى إتمام التحويل البنكي بمبلغ <span className="font-bold text-[#4F8751]">{finalPrice} ج.م</span> وإرسال إيصال التحويل. سيتم تفعيل الدورة خلال 24 ساعة.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                                    <button onClick={() => onNavigate('home')} className="flex-1 py-3 border-2 border-[#D2E1D9] text-[#034289] font-bold rounded-xl hover:bg-[#F8FAFA] transition-colors">
                                        الرئيسية
                                    </button>
                                    <button onClick={() => onNavigate('dashboard')} className="flex-1 btn-primary py-3 text-white font-bold rounded-xl">
                                        لوحة التحكم
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Course Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-[#D2E1D9]/50 overflow-hidden animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                                <div className="relative h-40 overflow-hidden">
                                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-3 right-3 left-3">
                                        <span className="inline-block px-2 py-0.5 bg-[#4F8751] text-white text-xs font-bold rounded-lg mb-1">{course.category}</span>
                                        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">{course.title}</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-4 text-xs text-[#034289]/60 mb-4">
                                        <div className="flex items-center gap-1">
                                            <ClockIcon className="w-3.5 h-3.5" />
                                            <span>{course.duration} ساعة</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <StarIcon className="w-3.5 h-3.5 fill-current" />
                                            <span>{course.rating}</span>
                                        </div>
                                        <span>{course.instructor}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Code */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/50 p-5">
                                <label className="block text-sm font-bold text-[#034289] mb-2">كود الخصم</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); setCouponApplied(false); }}
                                        placeholder="أدخل كود الخصم"
                                        className="flex-1 px-3 py-2.5 border-2 border-[#D2E1D9] rounded-xl bg-[#F8FAFA] text-[#034289] text-sm placeholder-[#034289]/30 focus:border-[#4F8751] focus:bg-white transition-all"
                                        dir="ltr"
                                    />
                                    <button onClick={applyCoupon} className="px-4 py-2.5 bg-[#034289] text-white text-sm font-bold rounded-xl hover:bg-[#022a5c] transition-colors shrink-0">
                                        تطبيق
                                    </button>
                                </div>
                                {couponApplied && (
                                    <p className="text-[#4F8751] text-xs mt-2 flex items-center gap-1">
                                        <CheckBadgeIcon className="w-4 h-4" />
                                        تم تطبيق خصم 15% بنجاح!
                                    </p>
                                )}
                                {couponError && (
                                    <p className="text-red-500 text-xs mt-2">{couponError}</p>
                                )}
                            </div>

                            {/* Price Summary */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/50 p-5">
                                <h4 className="font-bold text-[#034289] mb-4">ملخص الطلب</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between text-[#034289]/70">
                                        <span>سعر الدورة</span>
                                        <span className="font-bold">{originalPrice} ج.م</span>
                                    </div>
                                    {couponApplied && (
                                        <div className="flex items-center justify-between text-[#4F8751]">
                                            <span>خصم (15%)</span>
                                            <span className="font-bold">- {discountAmount.toFixed(0)} ج.م</span>
                                        </div>
                                    )}
                                    <div className="border-t border-[#D2E1D9] pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-[#034289] text-base">الإجمالي</span>
                                            <span className="font-black text-xl text-[#034289]">{finalPrice.toFixed(0)} <span className="text-sm font-medium">ج.م</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Badges */}
                            <div className="bg-white rounded-2xl shadow-sm border border-[#D2E1D9]/50 p-5">
                                <div className="space-y-3">
                                    {[
                                        { icon: '🔒', text: 'دفع آمن ومشفر 100%' },
                                        { icon: '🔄', text: '30 يوم ضمان استرداد الأموال' },
                                        { icon: '♾️', text: 'وصول مدى الحياة للمحتوى' },
                                        { icon: '📱', text: 'التعلم من أي جهاز' },
                                    ].map((badge, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm text-[#034289]/70">
                                            <span className="text-lg">{badge.icon}</span>
                                            <span>{badge.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

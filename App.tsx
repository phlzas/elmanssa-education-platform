
import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';

// ── URL ↔ Page mapping ────────────────────────────────────────
const PATH_TO_PAGE: Record<string, Page> = {
  '/': 'home',
  '/courses': 'courses',
  '/signup': 'signup',
  '/login': 'login',
  '/subject': 'course-detail',
  '/about': 'about',
  '/live-stream': 'live-stream',
  '/ai': 'ai',
  '/pricing': 'pricing',
  '/blog': 'blog',
  '/support': 'support',
  '/privacy': 'privacy',
  '/dashboard': 'dashboard',
  '/contact': 'contact',
  '/instructor': 'instructor',
  '/checkout': 'checkout',
  '/payment-success': 'payment-success',
  '/watch': 'video-viewer',
  '/teacher': 'teacher-dashboard',
  '/admin': 'admin-dashboard',
};

const PAGE_TO_PATH: Record<Page, string> = Object.fromEntries(
  Object.entries(PATH_TO_PAGE).map(([path, page]) => [page, path])
) as Record<Page, string>;

function parsePath(): { page: Page; courseId: string | null } {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  // match /course/123 or /watch/123 or /checkout/123 etc.
  const match = path.match(/^(\/[^/]+)(?:\/(.+))?$/);
  const base = match?.[1] ?? '/';
  const id = match?.[2] ?? new URLSearchParams(window.location.search).get('id');
  const page = PATH_TO_PAGE[base] ?? 'home';
  return { page, courseId: id };
}
// Eagerly loaded — needed on every page or on initial render
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Features from './components/Features';
import PopularCourses from './components/PopularCourses';
import TeacherCTA from './components/TeacherCTA';
import Testimonials from './components/Testimonials';
import { useAuth } from './contexts/AuthContext';
import ToastContainer from './contexts/ToastContext';

// Lazily loaded — split into separate chunks, loaded on demand
const CoursesPage = React.lazy(() => import('./components/CoursesPage'));
const SignUpForm = React.lazy(() => import('./components/SignUpForm'));
const LoginPage = React.lazy(() => import('./components/LoginPage'));
const CourseDetailPage = React.lazy(() => import('./components/CourseDetailPage'));
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const LiveStreamPage = React.lazy(() => import('./components/LiveStreamPage'));
const AIPage = React.lazy(() => import('./components/AIPage'));
const PricingPage = React.lazy(() => import('./components/PricingPage'));
const BlogPage = React.lazy(() => import('./components/BlogPage'));
const SupportPage = React.lazy(() => import('./components/SupportPage'));
const PrivacyPage = React.lazy(() => import('./components/PrivacyPage'));
const StudentDashboard = React.lazy(() => import('./components/StudentDashboard'));
const ContactPage = React.lazy(() => import('./components/ContactPage'));
const InstructorProfile = React.lazy(() => import('./components/InstructorProfile'));
const CheckoutPage = React.lazy(() => import('./components/CheckoutPage'));
const PaymentSuccessPage = React.lazy(() => import('./components/PaymentSuccessPage'));
const VideoViewer = React.lazy(() => import('./components/VideoViewer'));
const TeacherDashboard = React.lazy(() => import('./components/TeacherDashboard'));

export type Page = 'home' | 'courses' | 'signup' | 'login' | 'course-detail' | 'about' | 'live-stream' | 'ai' | 'pricing' | 'blog' | 'support' | 'privacy' | 'dashboard' | 'contact' | 'instructor' | 'checkout' | 'payment-success' | 'video-viewer' | 'teacher-dashboard' | 'admin-dashboard';
export type AccountType = 'student' | 'teacher' | 'admin';

const App: React.FC = () => {
  const initial = parsePath();
  const [currentPage, setCurrentPage] = useState<Page>(initial.page);
  const [initialAccountType, setInitialAccountType] = useState<AccountType>('student');
  const [selectedCourseId, setSelectedCourseId] = useState<number | string | null>(initial.courseId);
  const [initialDashboardTab, setInitialDashboardTab] = useState<string | undefined>(undefined);
  const { user, isLoggedIn } = useAuth();
  const prevLoggedIn = useRef(isLoggedIn);

  // Handle browser back/forward
  useEffect(() => {
    const onPop = () => {
      const { page, courseId } = parsePath();
      setCurrentPage(page);
      if (courseId) setSelectedCourseId(courseId);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Auto-redirect on login/logout
  useEffect(() => {
    if (isLoggedIn && !prevLoggedIn.current && user) {
      const target: Page = user.role === 'admin' ? 'admin-dashboard' : (user.role === 'teacher' ? 'teacher-dashboard' : 'dashboard');
      const path = PAGE_TO_PATH[target] ?? '/';
      window.history.pushState({ page: target }, '', path);
      setCurrentPage(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!isLoggedIn && prevLoggedIn.current) {
      window.history.pushState({ page: 'home' }, '', '/');
      setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, user]);

  const navigateTo = useCallback((page: Page, payload?: { accountType?: AccountType; courseId?: number | string; tab?: string }) => {
    if (page === 'signup' && payload?.accountType) {
      setInitialAccountType(payload.accountType);
    }
    const courseId = payload?.courseId ?? null;
    if (courseId) setSelectedCourseId(courseId);
    setInitialDashboardTab(payload?.tab);
    setCurrentPage(page);

    // Build URL
    const basePath = PAGE_TO_PATH[page] ?? '/';
    const url = courseId ? `${basePath}/${courseId}` : basePath;
    window.history.pushState({ page, courseId }, '', url);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero onNavigate={navigateTo} />
            <Stats />
            <Features />
            <PopularCourses onNavigate={navigateTo} />
            <Testimonials />
            <TeacherCTA onNavigate={navigateTo} />
          </>
        );
      case 'courses':
        return <CoursesPage onNavigate={navigateTo} isTeacher={user?.role === 'teacher'} />;
      case 'signup':
        return <SignUpForm initialAccountType={initialAccountType} onNavigate={navigateTo} />;
      case 'login':
        return <LoginPage onNavigate={navigateTo} />;
      case 'course-detail':
        return selectedCourseId ? (
          <CourseDetailPage courseId={selectedCourseId} onNavigate={navigateTo} />
        ) : (
          <Hero onNavigate={navigateTo} />
        );
      case 'live-stream':
        return <LiveStreamPage onNavigate={navigateTo} />;
      case 'ai':
        return <AIPage onNavigate={navigateTo} />;
      case 'pricing':
        return <PricingPage onNavigate={navigateTo} />;
      case 'blog':
        return <BlogPage onNavigate={navigateTo} />;
      case 'support':
        return <SupportPage onNavigate={navigateTo} />;
      case 'privacy':
        return <PrivacyPage onNavigate={navigateTo} />;
      case 'dashboard':
        return <StudentDashboard onNavigate={navigateTo} initialTab={initialDashboardTab} />;
      case 'video-viewer':
        return <VideoViewer onNavigate={navigateTo} courseId={selectedCourseId} />;
      case 'contact':
        return <ContactPage onNavigate={navigateTo} />;
      case 'instructor':
        return <InstructorProfile onNavigate={navigateTo} />;
      case 'teacher-dashboard':
        return <TeacherDashboard onNavigate={navigateTo} initialTab={initialDashboardTab} />;
      case 'admin-dashboard':
        return <div className="p-20 text-center text-xl font-bold">لوحة تحكم المشرف قيد التطوير</div>;
      case 'checkout':
        return selectedCourseId ? (
          <CheckoutPage courseId={selectedCourseId} onNavigate={navigateTo} />
        ) : (
          <Hero onNavigate={navigateTo} />
        );
      case 'payment-success':
        return selectedCourseId ? (
          <PaymentSuccessPage courseId={selectedCourseId} onNavigate={navigateTo} />
        ) : (
          <Hero onNavigate={navigateTo} />
        );
      case 'about':
        return <AboutPage onNavigate={navigateTo} />;
      default:
        return <Hero onNavigate={navigateTo} />;
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bg-[#FEFEFE] min-h-screen flex flex-col text-[#034289] overflow-x-hidden">
        {currentPage !== 'dashboard' && currentPage !== 'video-viewer' && currentPage !== 'teacher-dashboard' && (
          <Header onNavigate={navigateTo} currentPage={currentPage} />
        )}
        <main className={`flex-grow ${currentPage !== 'dashboard' && currentPage !== 'video-viewer' && currentPage !== 'teacher-dashboard' ? 'pt-[82px]' : ''}`}>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-10 h-10 border-4 border-[#034289]/20 border-t-[#034289] rounded-full animate-spin" />
            </div>
          }>
            {renderPage()}
          </Suspense>
        </main>
        {currentPage !== 'dashboard' && currentPage !== 'video-viewer' && currentPage !== 'teacher-dashboard' && (
          <Footer onNavigate={navigateTo} />
        )}
      </div>
    </>
  );
};

export default App;

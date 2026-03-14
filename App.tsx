
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CoursesPage from './components/CoursesPage';
import SignUpForm from './components/SignUpForm';
import Footer from './components/Footer';
import Stats from './components/Stats';
import Features from './components/Features';
import PopularCourses from './components/PopularCourses';
import TeacherCTA from './components/TeacherCTA';
import Testimonials from './components/Testimonials';
import LoginPage from './components/LoginPage';
import CourseDetailPage from './components/CourseDetailPage';
import AboutPage from './components/AboutPage';
import LiveStreamPage from './components/LiveStreamPage';
import AIPage from './components/AIPage';
import PricingPage from './components/PricingPage';
import BlogPage from './components/BlogPage';
import SupportPage from './components/SupportPage';
import PrivacyPage from './components/PrivacyPage';
import StudentDashboard from './components/StudentDashboard';
import ContactPage from './components/ContactPage';
import InstructorProfile from './components/InstructorProfile';
import CheckoutPage from './components/CheckoutPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import VideoViewer from './components/VideoViewer';
import TeacherDashboard from './components/TeacherDashboard';
import { useAuth } from './contexts/AuthContext';
import ToastContainer from './contexts/ToastContext';

export type Page = 'home' | 'courses' | 'signup' | 'login' | 'course-detail' | 'about' | 'live-stream' | 'ai' | 'pricing' | 'blog' | 'support' | 'privacy' | 'dashboard' | 'contact' | 'instructor' | 'checkout' | 'payment-success' | 'video-viewer' | 'teacher-dashboard' | 'admin-dashboard';
export type AccountType = 'student' | 'teacher' | 'admin';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [initialAccountType, setInitialAccountType] = useState<AccountType>('student');
  const [selectedCourseId, setSelectedCourseId] = useState<number | string | null>(null);
  const [initialDashboardTab, setInitialDashboardTab] = useState<string | undefined>(undefined);
  const { user, isLoggedIn } = useAuth();
  const prevLoggedIn = useRef(isLoggedIn);

  // Auto-redirect on login/logout
  useEffect(() => {
    if (isLoggedIn && !prevLoggedIn.current && user) {
      // Just logged in — navigate to dashboard based on role
      const target: Page = user.role === 'admin' ? 'admin-dashboard' : (user.role === 'teacher' ? 'teacher-dashboard' : 'dashboard');
      setCurrentPage(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!isLoggedIn && prevLoggedIn.current) {
      // Just logged out — go home
      setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, user]);

  const navigateTo = useCallback((page: Page, payload?: { accountType?: AccountType; courseId?: number | string; tab?: string }) => {
    if (page === 'signup' && payload?.accountType) {
      setInitialAccountType(payload.accountType);
    }
    if (payload?.courseId) {
      setSelectedCourseId(payload.courseId);
    }
    setInitialDashboardTab(payload?.tab);
    setCurrentPage(page);
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
        return <CoursesPage onNavigate={navigateTo} />;
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
          {renderPage()}
        </main>
        {currentPage !== 'dashboard' && currentPage !== 'video-viewer' && currentPage !== 'teacher-dashboard' && (
          <Footer onNavigate={navigateTo} />
        )}
      </div>
    </>
  );
};

export default App;

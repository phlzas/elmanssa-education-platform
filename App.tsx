
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CoursesPage from './components/CoursesPage';
import SignUpForm from './components/SignUpForm';
import Footer from './components/Footer';
import Stats from './components/Stats';
import Features from './components/Features';
import PopularCourses from './components/PopularCourses';
import TeacherCTA from './components/TeacherCTA';
import LoginPage from './components/LoginPage';
import CourseDetailPage from './components/CourseDetailPage';
import AboutPage from './components/AboutPage';
import LiveStreamPage from './components/LiveStreamPage';
import AIPage from './components/AIPage';
import PricingPage from './components/PricingPage';
import BlogPage from './components/BlogPage';
import SupportPage from './components/SupportPage';
import PrivacyPage from './components/PrivacyPage';

export type Page = 'home' | 'courses' | 'signup' | 'login' | 'course-detail' | 'about' | 'live-stream' | 'ai' | 'pricing' | 'blog' | 'support' | 'privacy';
export type AccountType = 'student' | 'teacher';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [initialAccountType, setInitialAccountType] = useState<AccountType>('student');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const navigateTo = useCallback((page: Page, payload?: { accountType?: AccountType; courseId?: number }) => {
    if (page === 'signup' && payload?.accountType) {
      setInitialAccountType(payload.accountType);
    }
    if (page === 'course-detail' && payload?.courseId) {
      setSelectedCourseId(payload.courseId);
    }
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
      case 'about':
        return <AboutPage onNavigate={navigateTo} />;
      default:
        return <Hero onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="bg-[#FEFEFE] min-h-screen flex flex-col text-[#034289] overflow-x-hidden">
      <Header onNavigate={navigateTo} currentPage={currentPage} />
      <main className="flex-grow pt-[82px]">
        {renderPage()}
      </main>
      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default App;


import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../App';
import { NAV_LINKS } from '../constants';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    logout();
    onNavigate('home');
  };

  const getDashboardPage = (): Page => {
    return user?.role === 'teacher' ? 'teacher-dashboard' : 'dashboard';
  };

  const handleDashboardClick = () => {
    const page = getDashboardPage();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    onNavigate(page);
  };

  const handleSettingsClick = () => {
    const page = getDashboardPage();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    onNavigate(page);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const MobileMenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  );

  const CloseMenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  /* ──────── User Avatar Button ──────── */
  const UserAvatarButton = () => (
    <button
      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border-2 border-[#D2E1D9]/60 hover:border-[#4F8751]/50 bg-white/80 hover:bg-[#D2E1D9]/20 transition-all duration-300 group"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F8751] to-[#6ba96d] flex items-center justify-center text-white font-bold text-sm shadow-md">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          getInitials(user?.name || '')
        )}
      </div>
      {/* Name */}
      <span className="hidden lg:block text-sm font-semibold text-[#034289] max-w-[100px] truncate">
        {user?.name}
      </span>
      {/* Chevron */}
      <svg
        className={`w-4 h-4 text-[#034289]/50 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  /* ──────── User Dropdown Menu ──────── */
  const UserDropdownMenu = () => (
    <div
      className="absolute left-0 top-[calc(100%+8px)] w-72 bg-white/95 backdrop-blur-xl border border-[#D2E1D9]/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-down z-[100]"
      style={{ animationDuration: '200ms' }}
    >
      {/* User Info Section */}
      <div className="p-5 bg-gradient-to-br from-[#034289]/5 to-[#4F8751]/5 border-b border-[#D2E1D9]/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F8751] to-[#6ba96d] flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.name || '')
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[#034289] text-base truncate">{user?.name}</h4>
            <p className="text-xs text-[#034289]/50 truncate">{user?.email}</p>
            <span
              className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${user?.role === 'teacher'
                ? 'bg-[#034289]/10 text-[#034289]'
                : 'bg-[#4F8751]/10 text-[#4F8751]'
                }`}
            >
              {user?.role === 'teacher' ? 'معلم' : 'طالب'}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2 px-2">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDashboardClick(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#034289] hover:bg-[#D2E1D9]/30 transition-all duration-200 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#034289]/5 group-hover:bg-[#034289]/10 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-[#034289]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span className="font-semibold text-sm">لوحة التحكم</span>
        </button>

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSettingsClick(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#034289] hover:bg-[#D2E1D9]/30 transition-all duration-200 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#034289]/5 group-hover:bg-[#034289]/10 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-[#034289]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="font-semibold text-sm">الإعدادات</span>
        </button>
      </div>

      {/* Logout */}
      <div className="px-2 pb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-[#D2E1D9] to-transparent mx-3 mb-2" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="font-semibold text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
        ? 'glass shadow-lg py-2'
        : 'bg-white/95 backdrop-blur-sm py-3'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 animate-fade-in">
            <button
              onClick={() => onNavigate('home')}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8751] rounded-lg"
            >
              <Logo size="md" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-8">
            {NAV_LINKS.map((link, index) => (
              <button
                key={link.name}
                onClick={() => onNavigate(link.page as Page)}
                className={`nav-link text-lg font-semibold transition-all duration-300 hover:scale-105 animate-fade-in-down ${currentPage === link.page
                  ? 'text-[#4F8751]'
                  : 'text-[#034289] hover:text-[#4F8751]'
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Desktop Auth / User Section */}
          <div className="hidden md:flex items-center gap-4 animate-fade-in">
            {isLoggedIn && user ? (
              <div className="relative" ref={userMenuRef}>
                <UserAvatarButton />
                {isUserMenuOpen && <UserDropdownMenu />}
              </div>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="relative text-lg font-semibold text-[#034289] hover:text-[#4F8751] transition-all duration-300 px-4 py-2 rounded-lg hover:bg-[#D2E1D9]/30"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="btn-primary px-7 py-3 text-lg font-bold text-white rounded-xl shadow-lg"
                >
                  <span className="relative z-10">إنشاء حساب</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile User Avatar */}
            {isLoggedIn && user && (
              <div className="relative" ref={isMenuOpen ? undefined : userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F8751] to-[#6ba96d] flex items-center justify-center text-white font-bold text-sm shadow-md"
                >
                  {getInitials(user.name)}
                </button>
                {isUserMenuOpen && !isMenuOpen && <UserDropdownMenu />}
              </div>
            )}
            <button
              onClick={() => { setIsMenuOpen(!isMenuOpen); setIsUserMenuOpen(false); }}
              className="text-[#034289] p-2 rounded-lg hover:bg-[#D2E1D9]/30 transition-colors duration-200"
            >
              <div className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}>
                {isMenuOpen ? <CloseMenuIcon /> : <MobileMenuIcon />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mobile-menu glass border-t border-[#D2E1D9]/50">
          <nav className="flex flex-col items-center py-6 space-y-4">
            {NAV_LINKS.map((link, index) => (
              <button
                key={link.name}
                onClick={() => {
                  onNavigate(link.page as Page);
                  setIsMenuOpen(false);
                }}
                className={`text-lg font-semibold transition-all duration-300 py-2 px-6 rounded-lg animate-fade-in-up ${currentPage === link.page
                  ? 'text-[#4F8751] bg-[#D2E1D9]/30'
                  : 'text-[#034289] hover:text-[#4F8751] hover:bg-[#D2E1D9]/20'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.name}
              </button>
            ))}
            <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-[#D2E1D9] to-transparent my-2" />

            {isLoggedIn && user ? (
              <>
                {/* Mobile: User info in menu */}
                <div className="flex items-center gap-3 px-6 py-3 bg-[#D2E1D9]/20 rounded-xl w-4/5 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F8751] to-[#6ba96d] flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-bold text-[#034289] text-sm">{user.name}</p>
                    <span className={`text-xs font-semibold ${user.role === 'teacher' ? 'text-[#034289]' : 'text-[#4F8751]'}`}>
                      {user.role === 'teacher' ? 'معلم' : 'طالب'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { handleDashboardClick(); setIsMenuOpen(false); }}
                  className="text-lg font-semibold text-[#034289] hover:text-[#4F8751] py-2 px-6 rounded-lg animate-fade-in-up"
                  style={{ animationDelay: '200ms' }}
                >
                  لوحة التحكم
                </button>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-4/5 py-3 text-lg font-bold text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: '250ms' }}
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onNavigate('login');
                    setIsMenuOpen(false);
                  }}
                  className="text-lg font-semibold text-[#034289] hover:text-[#4F8751] py-2 px-6 rounded-lg animate-fade-in-up"
                  style={{ animationDelay: '200ms' }}
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => {
                    onNavigate('signup');
                    setIsMenuOpen(false);
                  }}
                  className="w-4/5 btn-primary py-4 text-lg font-bold text-white rounded-xl shadow-lg animate-fade-in-up"
                  style={{ animationDelay: '250ms' }}
                >
                  إنشاء حساب
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

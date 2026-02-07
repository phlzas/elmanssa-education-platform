
import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { NAV_LINKS } from '../constants';
import Logo from './Logo';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4 animate-fade-in">
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
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

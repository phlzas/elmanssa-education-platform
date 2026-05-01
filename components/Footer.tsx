import React from 'react';
import { Page } from '../App';
import Logo from './Logo';

interface FooterProps {
  onNavigate?: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const quickLinks: { name: string; page: Page }[] = [
    { name: 'الرئيسية', page: 'home' },
    { name: 'الكورسات', page: 'courses' },
    { name: 'التسعير', page: 'pricing' },
    { name: 'تواصل معنا', page: 'contact' },
  ];

  const socialLinks = [
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  return (
    <footer dir="rtl" className="relative bg-[#0a1628] text-[#d7e3fc] overflow-hidden">
      {/* Top gradient accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-[#4F8751]/60 via-[#034289]/80 to-[#4F8751]/60"
        aria-hidden="true"
      />

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#034289]/8 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4F8751]/6 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Main three-column grid: logo+desc (right) | nav links (center) | contact (left) */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">

          {/* Column 1 — Right in RTL: Logo + Description + Social icons */}
          <div>
            <Logo size="lg" className="mb-5" />
            <p
              className="text-[#c3c6d2] text-sm mb-6"
              style={{ lineHeight: '1.85' }}
            >
              منصة تعليمية عربية رائدة توفر كورسات احترافية وبث مباشر واختبارات متقدمة لتطوير مهاراتك وبناء مستقبلك.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-9 h-9 rounded-lg bg-[#142032] hover:bg-[#034289] flex items-center justify-center text-[#8d909c] hover:text-white cursor-pointer transition-colors duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Center: Navigation Links */}
          <div>
            <h3 className="font-bold text-[#d7e3fc] text-base mb-6 tracking-wide">
              روابط سريعة
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate(link.page)}
                    className="group text-[#c3c6d2] hover:text-[#99d597] text-sm cursor-pointer transition-colors duration-200 inline-flex items-center"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute -bottom-0.5 right-0 h-0.5 w-0 bg-[#4F8751] group-hover:w-full transition-all duration-200 rounded-full" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Left in RTL: Contact Info */}
          <div>
            <h3 className="font-bold text-[#d7e3fc] text-base mb-6 tracking-wide">
              تواصل معنا
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@elmanassa.com"
                  className="flex items-center gap-3 text-[#c3c6d2] hover:text-[#abc7ff] text-sm cursor-pointer transition-colors duration-200 group"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#034289]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#034289]/40 transition-colors duration-200">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#abc7ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <span>info@elmanassa.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+966500000000"
                  className="flex items-center gap-3 text-[#c3c6d2] hover:text-[#abc7ff] text-sm cursor-pointer transition-colors duration-200 group"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#034289]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#034289]/40 transition-colors duration-200">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#abc7ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <span dir="ltr">+966 50 000 0000</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-[#c3c6d2] text-sm">
                  <span className="w-8 h-8 rounded-lg bg-[#034289]/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#abc7ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span>المملكة العربية السعودية</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#434751]/40" />

        {/* Copyright bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#8d909c] text-sm text-center sm:text-right">
            &copy; {currentYear} Elmanassa. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('privacy')}
              className="text-[#8d909c] hover:text-[#c3c6d2] text-xs cursor-pointer transition-colors duration-200"
            >
              سياسة الخصوصية
            </button>
            <span className="text-[#434751]" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('privacy')}
              className="text-[#8d909c] hover:text-[#c3c6d2] text-xs cursor-pointer transition-colors duration-200"
            >
              الشروط والأحكام
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

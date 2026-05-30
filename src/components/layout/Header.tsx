import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  user: any;
  userProfile: any;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  setIsProfileOpen: (isOpen: boolean) => void;
}

export const Header = ({
  user,
  userProfile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setIsProfileOpen,
}: HeaderProps) => {
  const location = useLocation();
  const path = location.pathname;
  const isHome = path === '/';

  return (
    <>
      <header className={`flex items-center justify-between px-5 md:px-12 py-6 md:py-6 top-0 z-[100] pointer-events-none md:pointer-events-auto md:relative md:bg-transparent md:backdrop-blur-0 md:border-b-0 ${
        isHome
          ? 'fixed inset-x-0 bg-transparent border-b-0'
          : 'sticky bg-earth-sand/85 backdrop-blur-md border-b border-forest-deep/5'
      }`}>
        <Link to="/" className="flex items-center gap-2 group cursor-pointer py-2 pointer-events-auto transition-all">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="h-6 w-6" />
          <h2 className="text-forest-deep text-[1.1rem] leading-none font-semibold tracking-tight uppercase mt-0.5">Soil AI</h2>
        </Link>
        <div className="flex items-center gap-2 md:gap-8 pointer-events-auto">
          <nav className="hidden md:flex items-center gap-10 px-4 md:px-8 py-3">
            <Link
              to="/"
              className={`relative flex items-center gap-2 ${path === '/' ? 'text-forest-deep font-semibold' : 'text-forest-deep/60'} hover:text-forest-deep text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer pb-1`}
            >
              Analyze
              {path === '/' && <span className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-1 h-1 bg-forest-deep rounded-full"></span>}
            </Link>
            <Link
              to="/journal"
              className={`relative flex items-center gap-2 ${path.startsWith('/journal') || path.startsWith('/article') ? 'text-forest-deep font-semibold' : 'text-forest-deep/60'} hover:text-forest-deep text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer pb-1`}
            >
              Journal
              {(path.startsWith('/journal') || path.startsWith('/article')) && <span className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-1 h-1 bg-forest-deep rounded-full"></span>}
            </Link>
            <Link
              to="/history"
              className={`relative flex items-center gap-2 ${path === '/history' ? 'text-forest-deep font-semibold' : 'text-forest-deep/60'} hover:text-forest-deep text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer pb-1`}
            >
              My Garden
              {path === '/history' && <span className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-1 h-1 bg-forest-deep rounded-full"></span>}
            </Link>
          </nav>
          <div className="flex items-center p-1">
            <button
              className="flex items-center justify-center rounded-full w-10 h-10 hover:bg-forest-deep/5 text-forest-deep transition-all cursor-pointer relative group"
              aria-label="User Profile"
              onClick={() => setIsProfileOpen(true)}
            >
              <User className="w-5 h-5" strokeWidth={1.8} />
              {userProfile?.scanPoints !== undefined && (
                <div className="absolute top-0.5 right-0.5 translate-x-0.5 -translate-y-0.5 bg-yellow-400 text-forest-deep border border-white text-[8px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 shadow-sm">
                  {userProfile.scanPoints}
                </div>
              )}
            </button>
            <button
              className="md:hidden flex items-center justify-center rounded-full w-10 h-10 hover:bg-forest-deep/5 text-forest-deep transition-all cursor-pointer relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              <div className="relative w-5 h-5 flex justify-center items-center">
                <span className={`absolute block w-5 h-[2px] bg-forest-deep rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
                <span className={`absolute block w-5 h-[2px] bg-forest-deep rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`}></span>
                <span className={`absolute block w-5 h-[2px] bg-forest-deep rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

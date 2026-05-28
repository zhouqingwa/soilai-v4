import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Flower, Book, Sprout } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MobileNavProps {
  isOpen: boolean;
  navRef: React.RefObject<HTMLDivElement>;
  isNavTouching: boolean;
  setIsNavTouching: (isTouching: boolean) => void;
  navDragProgress: number | null;
  setNavDragProgress: (progress: number | null) => void;
  onNavigate?: () => void;
}

export const MobileNav = ({
  isOpen,
  navRef,
  isNavTouching,
  setIsNavTouching,
  navDragProgress,
  setNavDragProgress,
  onNavigate,
}: MobileNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const getActiveView = () => {
    if (path === '/') return 'analyze';
    if (path.startsWith('/journal') || path.startsWith('/article')) return 'journal';
    if (path.startsWith('/history')) return 'history';
    return 'analyze';
  };

  const view = getActiveView();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          exit={{ y: 200 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden fixed left-4 right-4 max-w-[400px] mx-auto"
          style={{
            bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
            zIndex: 9999
          }}
        >
          <div
            ref={navRef}
            className="bg-[#f0ece3]/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_-10px_rgba(26,54,33,0.15)] rounded-[99px] p-1.5 flex justify-between items-center relative touch-none"
            style={{ WebkitBackdropFilter: 'blur(20px)' }}
            onTouchStart={(e) => {
          setIsNavTouching(true);
          // Store initial touch to distinguish between tap and drag
          if (navRef.current) {
            navRef.current.dataset.touchStartX = e.touches[0].clientX.toString();
            navRef.current.dataset.isDragging = 'false';
          }
        }}
        onTouchMove={(e) => {
          if (!navRef.current) return;
          const touch = e.touches[0];
          const startX = parseFloat(navRef.current.dataset.touchStartX || '0');

          // Only consider it a drag if moved more than 10px
          if (Math.abs(touch.clientX - startX) > 10) {
            navRef.current.dataset.isDragging = 'true';
          }

          if (navRef.current.dataset.isDragging === 'true') {
            const rect = navRef.current.getBoundingClientRect();
            const usableWidth = rect.width - 12;
            const gliderWidth = usableWidth / 3;
            let leftEdge = touch.clientX - rect.left - 6 - gliderWidth / 2;
            leftEdge = Math.max(0, Math.min(leftEdge, usableWidth - gliderWidth));
            const progress = leftEdge / gliderWidth;
            setNavDragProgress(progress);

            // Navigate immediately while dragging
            const views = ['analyze', 'journal', 'history'];
            const closestIndex = Math.round(progress);
            if (views[closestIndex] && views[closestIndex] !== view) {
              const targetView = views[closestIndex];
              if (targetView === 'analyze') navigate('/');
              else navigate(`/${targetView}`);
            }
          }
        }}
        onTouchEnd={() => {
          const wasDragging = navRef.current?.dataset.isDragging === 'true';
          setNavDragProgress(null);
          setIsNavTouching(false);
          if (navRef.current) {
            navRef.current.dataset.isDragging = 'false';
          }
          if (wasDragging && onNavigate) {
            onNavigate();
          }
        }}
        onTouchCancel={() => {
          setNavDragProgress(null);
          setIsNavTouching(false);
        }}
      >
        {/* Active Glider Background */}
        <div
          className={`absolute top-1.5 bottom-1.5 rounded-[99px] bg-gradient-to-b from-white to-stone-50/80 z-0 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${navDragProgress !== null ? 'transition-none' : ''} ${isNavTouching ? 'shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,1)]' : 'shadow-[0_2px_10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]'} border border-white/40`}
          style={{
            width: 'calc(33.333% - 4px)',
            left: '6px',
            transform: `
              ${navDragProgress !== null
                ? `translateX(${navDragProgress * 100}%)`
                : view === 'analyze' ? 'translateX(0)' :
                  view === 'journal' ? 'translateX(100%)' :
                  view === 'history' ? 'translateX(200%)' : 'translateX(0)'}
              ${isNavTouching ? 'scale(1.08)' : 'scale(1)'}
            `,
            opacity: ['analyze', 'journal', 'history'].includes(view) ? 1 : 0
          }}
        />

        {/* Nav Items */}
        <button
          data-view="analyze"
          onClick={() => { navigate('/'); if (onNavigate) onNavigate(); }}
          className={`relative z-10 flex flex-col items-center justify-center flex-1 h-[52px] rounded-[99px] transition-all duration-300 ${view === 'analyze' ? 'text-[#2c5234]' : 'text-forest-deep/50 hover:text-forest-deep/70'}`}
        >
          <Camera className="w-5 h-5 mb-0.5 pointer-events-none" />
          <span className="text-[9px] font-bold uppercase tracking-wider pointer-events-none">Scan</span>
        </button>
        <button
          data-view="journal"
          onClick={() => { navigate('/journal'); if (onNavigate) onNavigate(); }}
          className={`relative z-10 flex flex-col items-center justify-center flex-1 h-[52px] rounded-[99px] transition-all duration-300 ${view === 'journal' ? 'text-[#2c5234]' : 'text-forest-deep/50 hover:text-forest-deep/70'}`}
        >
          <Book className="w-5 h-5 mb-0.5 pointer-events-none" />
          <span className="text-[9px] font-bold uppercase tracking-wider pointer-events-none">Journal</span>
        </button>
        <button
          data-view="history"
          onClick={() => { navigate('/history'); if (onNavigate) onNavigate(); }}
          className={`relative z-10 flex flex-col items-center justify-center flex-1 h-[52px] rounded-[99px] transition-all duration-300 ${view === 'history' ? 'text-[#2c5234]' : 'text-forest-deep/50 hover:text-forest-deep/70'}`}
        >
          <Sprout className="w-5 h-5 mb-0.5 pointer-events-none" />
          <span className="text-[9px] font-bold uppercase tracking-wider pointer-events-none">Garden</span>
        </button>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

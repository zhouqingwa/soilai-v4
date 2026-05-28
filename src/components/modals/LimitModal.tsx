import { motion, AnimatePresence } from 'framer-motion';
import { X, Flower } from 'lucide-react';

interface LimitModalProps {
  showLimitModal: boolean;
  setShowLimitModal: (show: boolean) => void;
  setIsProfileOpen: (show: boolean) => void;
}

export const LimitModal = ({
  showLimitModal,
  setShowLimitModal,
  setIsProfileOpen,
}: LimitModalProps) => {
  return (
    <AnimatePresence>
      {showLimitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-earth-sand/90 backdrop-blur-md p-4"
          onClick={() => setShowLimitModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative p-8 md:p-12 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center text-forest-deep transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 bg-forest-deep/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Flower className="w-10 h-10 text-forest-deep" />
            </div>

            <h3 className="text-2xl font-bold text-forest-deep mb-4 font-heading">
              The Professor is Tired
            </h3>

            <p className="text-forest-deep/70 mb-8 leading-relaxed">
              You've used today's 1 free Basic Diagnosis. Log in to get Scan Points and run a full Pro Diagnosis today.
            </p>

            <button
              onClick={() => {
                setShowLimitModal(false);
                setIsProfileOpen(true);
              }}
              className="w-full py-4 bg-forest-deep text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-forest-deep/90 transition-colors shadow-lg hover:shadow-xl"
            >
              Log In
            </button>
            <p className="text-[10px] text-forest-deep/40 mt-4 uppercase tracking-wider">
              Free Basic resets daily.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

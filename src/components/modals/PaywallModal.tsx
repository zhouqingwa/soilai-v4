import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Check } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyPoints: () => void;
}

export const PaywallModal = ({ isOpen, onClose, onBuyPoints }: PaywallModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-earth-sand/90 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden text-center p-8"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-forest-deep transition-colors bg-stone-100 hover:bg-stone-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-6 border border-yellow-100">
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>

            <h2 className="text-2xl font-serif text-forest-deep mb-2">Unlock Professor's Plan</h2>
            <p className="text-stone-500 mb-8 text-sm px-4">
              You've run out of Scan Points. Get more to access deep dive analysis, step-by-step rescue plans, and product recommendations.
            </p>

            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 mb-8 text-left">
              <ul className="space-y-3">
                {[
                  "Detailed botanical deep dive",
                  "Step-by-step rescue action plan",
                  "Curated product recommendations",
                  "Priority AI analysis"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-forest-deep/80">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onBuyPoints}
              className="w-full bg-forest-deep hover:bg-forest-deep/90 text-white py-4 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Get Scan Points
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

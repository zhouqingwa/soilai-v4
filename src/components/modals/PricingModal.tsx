import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onPointsAdded?: (points: number) => void;
}

const pricingTiers = [
  { id: 'starter', name: 'Starter', price: 1.99, points: 2, desc: 'Unlock 2 Pro Rescue Plans or save to My Garden' },
  { id: 'lover', name: 'Plant Lover', price: 4.99, points: 8, desc: 'Multiple Pro unlocks and rich AI illustrations', badge: 'Most Popular' },
  { id: 'parent', name: 'Plant Parent', price: 9.99, points: 20, desc: 'High points, perfect for constant use and collectors' }
];

const paypalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture"
};

const checkoutRequest = async <T,>(user: any, url: string, body: unknown): Promise<T> => {
  const token = await user?.getIdToken?.();
  if (!token) {
    throw new Error('Please sign in before buying Scan Points.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Checkout failed.');
  }
  return data as T;
};

export const PricingModal = ({ isOpen, onClose, user, onPointsAdded }: PricingModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState('lover');

  const selectedTier = pricingTiers.find(t => t.id === selectedTierId) || pricingTiers[1];

  const handleApprove = async (data: any) => {
    try {
      setIsProcessing(true);
      const result = await checkoutRequest<{ points: number }>(user, '/api/paypal/capture-order', {
        orderId: data.orderID,
        tierId: selectedTier.id,
      });

      onPointsAdded?.(result.points || selectedTier.points);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Payment failed", error);
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative text-center my-8 border border-stone-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative pt-12 pb-8 px-8 bg-gradient-to-b from-stone-50 to-white">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 bg-white shadow-sm border border-stone-200 hover:bg-stone-50 rounded-full flex items-center justify-center text-stone-500 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-full flex items-center justify-center shadow-inner">
                  <Sparkles className="w-10 h-10 text-yellow-600" strokeWidth={1.5} />
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-light text-forest-deep mb-3 font-heading tracking-tight">
                Unlock Premium Features
              </h3>

              <p className="text-forest-deep/60 sm:px-6 text-sm sm:text-base font-medium">
                Get Scan Points to unlock the Professor's Pro Rescue Plans and beautiful AI-generated illustrations.
              </p>
            </div>

            <div className="px-6 sm:px-10 pb-10">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 text-emerald-800 p-8 rounded-3xl font-medium mb-4 flex flex-col items-center border border-emerald-100"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Payment Successful!</h4>
                  <p className="text-emerald-700/80">{selectedTier.points} Scan Points have been added to your account.</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-6 relative">
                  {isProcessing && (
                    <div className="absolute inset-x-0 top-0 bottom-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
                      <Loader2 className="w-10 h-10 animate-spin text-forest-deep mb-4" />
                      <p className="text-base font-bold text-forest-deep">Authorizing Payment...</p>
                      <p className="text-sm text-forest-deep/60 mt-1">Please keep this window open</p>
                    </div>
                  )}

                  <div className={`flex flex-col gap-3 text-left ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                    {pricingTiers.map((tier) => (
                      <div
                        key={tier.id}
                        onClick={() => !isProcessing && setSelectedTierId(tier.id)}
                        className={`relative flex items-center p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                          selectedTierId === tier.id
                            ? 'border-forest-deep bg-emerald-50/30'
                            : 'border-stone-100 hover:border-forest-deep/20 hover:bg-stone-50'
                        }`}
                      >
                        {tier.badge && (
                          <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            selectedTierId === tier.id ? 'bg-forest-deep text-white shadow-md' : 'bg-stone-200 text-stone-600'
                          }`}>
                            {tier.badge}
                          </div>
                        )}

                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mr-4 sm:mr-5 transition-all ${
                          selectedTierId === tier.id ? 'border-forest-deep bg-forest-deep' : 'border-stone-300 bg-white'
                        }`}>
                          {selectedTierId === tier.id && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-end mb-1">
                            <span className="font-bold text-forest-deep text-base sm:text-lg leading-none">{tier.name}</span>
                            <span className="font-bold text-forest-deep text-base sm:text-lg leading-none">${tier.price.toFixed(2)}</span>
                          </div>
                          <div className="text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5 mt-1">
                            {tier.points} Scan Points
                          </div>
                          <p className="text-xs sm:text-sm text-forest-deep/60 leading-snug">
                            {tier.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="w-full relative z-10 pt-2 border-t border-stone-100 min-h-[160px]">
                    <PayPalScriptProvider options={paypalOptions}>
                      <PayPalButtons
                        forceReRender={[selectedTier.id, selectedTier.price]}
                        style={{ layout: "vertical", shape: "rect", color: "black", label: "checkout" }}
                        createOrder={async () => {
                          const result = await checkoutRequest<{ orderId: string }>(user, '/api/paypal/create-order', {
                            tierId: selectedTier.id,
                          });
                          return result.orderId;
                        }}
                        onApprove={handleApprove}
                        onCancel={(data) => {
                          console.log("Payment cancelled", data);
                          setIsProcessing(false);
                        }}
                        onError={(err: any) => {
                          console.error("PayPal Error:", err);
                          setIsProcessing(false);
                          if (err?.message?.includes("Window closed")) {
                            console.log("User closed the PayPal window manually.");
                          } else {
                            alert("There was an issue processing your payment: " + err?.message);
                          }
                        }}
                      />
                    </PayPalScriptProvider>

                    <p className="text-[10px] text-forest-deep/40 mt-4 uppercase tracking-widest flex items-center justify-center gap-2">
                      Securely processed by PayPal
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Loader2, Flower, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';
import QRCode from 'react-qr-code';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantData: {
    species: string;
    risk: string;
    summary: string;
    imageData: string;
    imageType: string;
    imageUrl?: string | null;
    killerTitle?: string;
    originalImageData?: string | null;
    originalImageType?: string | null;
    originalImageUrl?: string | null;
    particleImageUrl?: string | null;
    particleImageData?: string | null;
    particleImageType?: string | null;
  } | null;
}

export const ShareModal = ({ isOpen, onClose, plantData }: ShareModalProps) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyzeId, setAnalyzeId] = useState('');
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [generationError, setGenerationError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnalyzeId(Math.random().toString(36).substr(2, 9).toUpperCase());
      setShowOriginalImage(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && plantData) {
      setShareFile(null);
      setGenerationError(false);
      // Delay pre-generation to allow modal animation to finish and fonts to load
      const timer = setTimeout(async () => {
        try {
          if (!posterRef.current) return;
          const dataUrl = await generateImage();
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `soilai-${plantData.species.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });
          if (isMounted) setShareFile(file);
        } catch (e) {
          console.error("Pre-generation failed", e);
          if (isMounted) setGenerationError(true);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
    return () => { isMounted = false; };
  }, [isOpen, showOriginalImage, plantData]);

  if (!plantData) return null;

  const originalSrc = plantData.originalImageUrl || (plantData.originalImageData ? `data:${plantData.originalImageType || 'image/jpeg'};base64,${plantData.originalImageData}` : null);
  const aiSrc = plantData.imageUrl || plantData.particleImageUrl || (plantData.particleImageData ? `data:${plantData.particleImageType || 'image/jpeg'};base64,${plantData.particleImageData}` : null) || (plantData.imageData ? `data:${plantData.imageType || 'image/jpeg'};base64,${plantData.imageData}` : null);
  const displaySrc = (showOriginalImage && originalSrc) ? originalSrc : (aiSrc || originalSrc);
  const hasMultipleImages = !!(originalSrc && aiSrc && originalSrc !== aiSrc);

  const generateImage = async (): Promise<string> => {
    if (!posterRef.current) throw new Error("Poster reference not found");

    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 300));

    const node = posterRef.current;
    const width = node.offsetWidth;
    const height = node.offsetHeight;

    const options = {
      backgroundColor: '#F4F1EB', // Warm cream background
      pixelRatio: 3, // High quality for crisp text
      width,
      height,
      style: {
        margin: '0',
        transform: 'none',
      },
      filter: (n: any) => {
        if (n.tagName === 'SCRIPT' || n.tagName === 'NOSCRIPT') return false;
        return true;
      }
    };

    try {
      await Promise.race([
        toPng(node, { ...options, pixelRatio: 0.1 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('dummy timeout')), 1000))
      ]);
    } catch (e) {}

    const dataUrl = await Promise.race([
      toPng(node, options),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Render timed out')), 8000))
    ]);

    return dataUrl;
  };

  const handleDownload = async () => {
    if (!shareFile) return;

    try {
      const link = document.createElement('a');
      link.download = shareFile.name;
      link.href = URL.createObjectURL(shareFile);
      link.click();
    } catch (err) {
      console.error('Failed to download poster:', err);
      alert('Failed to save image. Please try again.');
    }
  };

  const handleShareImage = async () => {
    if (!shareFile) return;

    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({
          files: [shareFile],
          title: 'Soil AI Plant Report',
          text: `My ${plantData.species} diagnosis.`,
        });
      } else {
        const link = document.createElement('a');
        link.download = shareFile.name;
        link.href = URL.createObjectURL(shareFile);
        link.click();
      }
    } catch (err: any) {
      console.error('Failed to share poster:', err);
      if (err.name !== 'AbortError') {
        alert('Sharing failed. You can try saving the image instead.');
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  const appUrl = window.location.origin;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={handleClose}
        >
          <div className="min-h-full w-full flex flex-col items-center justify-center p-4 sm:p-6 py-12 sm:py-16">
            {/* Floating Close Button */}
            <button
              onClick={handleClose}
              className="fixed top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[360px] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <style>
                {`
                  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600&display=swap');
                `}
              </style>

              {/* The Poster */}
              <div
                ref={posterRef}
                style={{
                  width: '100%',
                  backgroundColor: '#F4F1EB', // Warm Cream
                  padding: '16px',
                  position: 'relative',
                  boxSizing: 'border-box',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#2C3D28' // Deep Botanical Green
                }}
              >
                {/* Inner Border Frame (Passe-partout effect) */}
                <div style={{
                  border: '1px solid #2C3D28',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative'
                }}>

                  {/* Top: Branding & ID */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Flower style={{ width: '12px', height: '12px', color: '#2C3D28' }} />
                      <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '9px' }}>Soil AI</span>
                    </div>
                    <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                      NO. {analyzeId}
                    </div>
                  </div>

                  {/* Killer Title (Main Headline) */}
                  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h2 style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '40px',
                      fontWeight: 600,
                      lineHeight: 0.9,
                      textTransform: 'uppercase',
                      margin: 0,
                      letterSpacing: '-0.02em',
                      wordWrap: 'break-word'
                    }}>
                      {plantData.killerTitle?.replace(/^THE\s+/i, '') || "UNKNOWN ASSASSIN"}
                    </h2>
                  </div>

                  {/* Arched Image Frame */}
                  <div
                    style={{
                      width: '85%',
                      margin: '0 auto',
                      position: 'relative',
                      marginBottom: '20px',
                      zIndex: 10,
                      cursor: hasMultipleImages ? 'pointer' : 'default'
                    }}
                    onClick={(e) => {
                      if (hasMultipleImages) {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowOriginalImage(!showOriginalImage);
                      }
                    }}
                  >
                    <div style={{
                      paddingBottom: '125%', // Creates a tall rectangle
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '200px 200px 0 0', // The Arch
                      border: '1px solid #2C3D28',
                      backgroundColor: '#E8E5DF'
                    }}>
                      <img
                        src={aiSrc || originalSrc || ''}
                        alt="Illustration"
                        style={{
                          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
                          opacity: showOriginalImage ? 0 : 1,
                          pointerEvents: 'none',
                          transition: 'opacity 0.5s ease-in-out'
                        }}
                        referrerPolicy="no-referrer"
                      />
                      {originalSrc && aiSrc && (
                        <img
                          src={originalSrc}
                          alt="Original Photo"
                          style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
                            opacity: showOriginalImage ? 1 : 0,
                            pointerEvents: 'none',
                            transition: 'opacity 0.5s ease-in-out'
                          }}
                          referrerPolicy="no-referrer"
                        />
                      )}
                      {hasMultipleImages && (
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: '20px',
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          border: '1px solid rgba(44, 61, 40, 0.1)',
                          pointerEvents: 'none'
                        }}>
                          <RefreshCw style={{ width: '12px', height: '12px', color: '#2C3D28' }} />
                          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '9px', fontWeight: 600, color: '#2C3D28', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {showOriginalImage ? 'Show Art' : 'Show Photo'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Species Name */}
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '22px',
                      fontStyle: 'italic',
                      lineHeight: 1.2,
                      fontWeight: 600
                    }}>
                      {plantData.species.includes('(') ? (
                        <>
                          <div>{plantData.species.split('(')[0].trim()}</div>
                          <div style={{ fontSize: '0.8em', marginTop: '2px' }}>({plantData.species.split('(')[1]}</div>
                        </>
                      ) : (
                        plantData.species
                      )}
                    </div>
                    <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6, marginTop: '6px' }}>
                      Subject Identified
                    </div>
                  </div>

                  {/* Spacer to push footer down if needed */}
                  <div style={{ flex: 1 }}></div>

                  {/* Bottom Section: Info & QR */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    borderTop: '1px solid #2C3D28',
                    paddingTop: '16px'
                  }}>
                    <div style={{ flex: 1, paddingRight: '16px' }}>
                      <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>
                        Botanical Diagnosis
                      </div>
                      <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '7px', opacity: 0.8, lineHeight: 1.5, letterSpacing: '0.05em' }}>
                        Stop killing plants.<br/>
                        Scan to get your own brutally<br/>honest plant diagnosis.
                      </div>
                    </div>

                    {/* QR Code */}
                    <div style={{ flexShrink: 0 }}>
                      <QRCode value={appUrl} size={42} level="L" fgColor="#2C3D28" bgColor="transparent" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex gap-3 mt-6">
                <button
                  onClick={handleShareImage}
                  disabled={!shareFile || generationError}
                  className="flex-1 bg-[#2C3D28] text-[#F4F1EB] py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#1A2518] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!shareFile && !generationError ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Preparing...</>
                  ) : generationError ? (
                    'Error'
                  ) : (
                    <><Share2 className="w-3.5 h-3.5" /> Share</>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!shareFile || generationError}
                  className="flex-1 bg-[#F4F1EB] text-[#2C3D28] py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {!shareFile && !generationError ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Preparing...</>
                  ) : generationError ? (
                    'Error'
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> Save</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

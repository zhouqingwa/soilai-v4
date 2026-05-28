import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, ChevronRight, X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import Markdown from 'react-markdown';
import { MarkdownResult } from './MarkdownResult';
import ParticleImage from './ParticleImage';

function HistoryCard({ scan, onClick, getRiskIcon, getRiskColor }: any) {
  return (
    <motion.div
      layoutId={scan.id}
      whileHover={{ scale: 1.03 }}
      className="relative w-full aspect-[3/4] cursor-pointer bg-white rounded-3xl border border-forest-deep/10 overflow-hidden shadow-sm flex flex-col"
      onClick={() => onClick(scan)}
    >
      <div className="flex-1 relative bg-stone-50 overflow-hidden">
        {scan.particleImageData ? (
          <ParticleImage
            src={`data:${scan.particleImageType || 'image/jpeg'};base64,${scan.particleImageData}`}
            className="absolute inset-0"
          />
        ) : scan.imageData ? (
          <ParticleImage
            src={`data:${scan.imageType || 'image/jpeg'};base64,${scan.imageData}`}
            className="absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-forest-deep/20">
            No Image
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-forest-deep shadow-sm">
          {scan.createdAt ? new Date(scan.createdAt.seconds ? scan.createdAt.seconds * 1000 : scan.createdAt).toLocaleDateString() : 'Recent'}
        </div>
      </div>
      <div className="p-4 bg-white border-t border-forest-deep/5 flex items-center justify-between">
        <h3 className="font-medium text-forest-deep truncate pr-4" title={(scan.basic?.species || scan.species || "Unknown Plant")}>{(scan.basic?.species || scan.species || "Unknown Plant")}</h3>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getRiskColor((scan.basic?.risk || scan.risk || "N/A"))}`}>
          {getRiskIcon((scan.basic?.risk || scan.risk || "N/A"))}
        </div>
      </div>
    </motion.div>
  );
}

function PlantStack({ group, onClick, onGroupClick, onDelete, getRiskIcon, getRiskColor }: any) {
  const [isHovered, useStateHovered] = useState(false);

  // Limit to max 4 cards in the stack for visual sanity
  const displayGroup = group.slice(0, 4);

  if (displayGroup.length === 1) {
    return (
      <HistoryCard
        scan={displayGroup[0]}
        onClick={onClick}
        onDelete={onDelete}
        getRiskIcon={getRiskIcon}
        getRiskColor={getRiskColor}
      />
    );
  }

  return (
    <div
      className="relative w-full aspect-[3/4]"
      style={{ zIndex: isHovered ? 50 : 1 }}
      onMouseEnter={() => useStateHovered(true)}
      onMouseLeave={() => useStateHovered(false)}
      onClick={() => onGroupClick(group)}
    >
      {/* Render in reverse order so index 0 (newest) is on top (rendered last) */}
      {displayGroup.slice().reverse().map((scan: any, reverseIdx: number) => {
        const i = displayGroup.length - 1 - reverseIdx; // original index (0 is newest)

        // Calculate fan out positions
        const direction = i % 2 === 0 ? 1 : -1;
        const magnitude = Math.ceil(i / 2);

        const baseRotate = i === 0 ? 0 : direction * magnitude * 4;
        const hoverRotate = i === 0 ? 0 : direction * magnitude * 8;

        const baseScale = 1 - (i * 0.04);
        const hoverScale = 1 - (i * 0.02);

        const baseY = i * 6;
        const hoverY = i === 0 ? -5 : -15 + (i * 3);
        const hoverX = i === 0 ? 0 : direction * magnitude * 30;

        return (
          <motion.div
            key={scan.id}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              zIndex: 10 - i,
              transformOrigin: 'bottom center'
            }}
            initial={false}
            animate={{
              rotate: isHovered ? hoverRotate : baseRotate,
              scale: isHovered ? hoverScale : baseScale,
              y: isHovered ? hoverY : baseY,
              x: isHovered ? hoverX : 0,
            }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
          >
            <HistoryCard
              scan={scan}
              onClick={() => {}}
              onDelete={onDelete}
              getRiskIcon={getRiskIcon}
              getRiskColor={getRiskColor}
            />
          </motion.div>
        );
      })}

      {/* Badge showing count if more than 1 */}
      <motion.div
        className="absolute -top-3 -right-3 z-20 bg-forest-deep text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md border-2 border-stone-50 pointer-events-none"
        animate={{
          opacity: isHovered ? 0 : 1,
          scale: isHovered ? 0.8 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        {group.length}
      </motion.div>
    </div>
  );
}

export default function HistoryView({ user, onShare, scans = [], isLoading = false, loadError = false }: { user: any, onShare?: (data: any) => void, scans?: any[], isLoading?: boolean, loadError?: boolean }) {
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any[] | null>(null);
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);
  const [expandedImageSrc, setExpandedImageSrc] = useState<string | null>(null);

  const groupedScans = useMemo(() => {
    const groups: Record<string, any[]> = {};
    scans.forEach(scan => {
      let rawSpecies = (scan.basic?.species || scan.species || "Unknown Plant") || 'Unknown Plant';
      let key = rawSpecies;

      // Normalize key to group similar plants together
      // Extract common name in parentheses if it exists
      const match = rawSpecies.match(/\(([^)]+)\)/);
      if (match) {
        key = match[1].trim().toLowerCase();
      } else {
        // Fallback to the first word (genus)
        key = rawSpecies.split(' ')[0].trim().toLowerCase();
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(scan);
    });

    // Sort each group by date (newest first)
    Object.values(groups).forEach(group => {
      group.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    });

    // Sort all groups by the date of their newest scan
    return Object.values(groups).sort((a, b) => {
      const timeA = a[0].createdAt?.seconds || 0;
      const timeB = b[0].createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [scans]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setScanToDelete(id);
  };

  const confirmDelete = async () => {
    if (!scanToDelete) return;
    try {
      await deleteDoc(doc(db, 'scans', scanToDelete));
      if (selectedScan?.id === scanToDelete) setSelectedScan(null);
    } catch (error) {
      console.error("Error deleting scan:", error);
    } finally {
      setScanToDelete(null);
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'High': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Moderate': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'Low': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-50 text-red-700 border-red-100';
      case 'Moderate': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Low': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-forest-deep mb-4">
          My <span className="font-semibold italic">Garden.</span>
        </h1>
        <p className="text-stone-muted max-w-md text-sm">
          A living collection of your botanical journey, from thriving leaves to wilted stems.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-forest-deep/40">
          <Clock className="w-8 h-8 animate-pulse mb-4" />
          <p className="text-sm font-medium uppercase tracking-widest">Consulting the archives...</p>
        </div>
      ) : loadError ? (
        <div className="text-center py-20 bg-white/40 rounded-[2rem] border border-dashed border-red-500/10">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-900/60 italic max-w-md mx-auto">We couldn't load your garden right now because the backend quota limit was reached. Please try again later when the database resets.</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="text-center py-20 bg-white/40 rounded-[2rem] border border-dashed border-forest-deep/10">
          <p className="text-forest-deep/50 italic">Your garden is empty. Scan a plant to add it to your collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {groupedScans.map((group) => (
            <PlantStack
              key={group[0].species || group[0].id}
              group={group}
              onClick={setSelectedScan}
              onGroupClick={setSelectedGroup}
              onDelete={handleDeleteClick}
              getRiskIcon={getRiskIcon}
              getRiskColor={getRiskColor}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-earth-sand/90 backdrop-blur-md p-4"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div
              layoutId={selectedScan.id}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedScan(null)}
                className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-forest-deep hover:bg-white transition-colors border border-forest-deep/10 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto custom-scrollbar flex-1 relative">
                {selectedScan.particleImageData ? (
                  <div
                    className="w-full h-48 sm:h-64 overflow-hidden bg-stone-100 relative shrink-0 cursor-pointer"
                    onClick={() => setExpandedImageSrc(`data:${selectedScan.particleImageType || 'image/jpeg'};base64,${selectedScan.particleImageData}`)}
                  >
                    <ParticleImage
                      src={`data:${selectedScan.particleImageType || 'image/jpeg'};base64,${selectedScan.particleImageData}`}
                      className="absolute inset-0"
                    />
                  </div>
                ) : selectedScan.imageData ? (
                  <div
                    className="w-full h-48 sm:h-64 overflow-hidden shrink-0 cursor-pointer group relative"
                    onClick={() => setExpandedImageSrc(`data:${selectedScan.imageType || 'image/jpeg'};base64,${selectedScan.imageData}`)}
                  >
                    <img
                      src={`data:${selectedScan.imageType || 'image/jpeg'};base64,${selectedScan.imageData}`}
                      alt={selectedScan.species}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-forest-deep text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        View Full Image
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="p-8 md:p-10">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border ${getRiskColor(selectedScan.risk)}`}>
                    {getRiskIcon(selectedScan.risk)}
                    Risk: {selectedScan.risk}
                  </div>

                  <h2 className="text-3xl font-light text-forest-deep mb-2">{selectedScan.species}</h2>
                  {selectedScan.killerTitle && (
                    <div className="inline-block bg-forest-deep text-earth-sand px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded mb-6">
                      {selectedScan.killerTitle}
                    </div>
                  )}
                  <p className="text-xs text-stone-muted uppercase tracking-widest mb-8">
                    Scanned on {selectedScan.createdAt ? new Date(selectedScan.createdAt.seconds ? selectedScan.createdAt.seconds * 1000 : selectedScan.createdAt).toLocaleString() : 'Recent'}
                  </p>

                  <div className="markdown-body prose prose-stone prose-sm max-w-none text-forest-deep/90 leading-relaxed mb-8">
                    <MarkdownResult content={selectedScan.summary} />
                  </div>

                  {/* Basic Care Rule */}
                  {selectedScan.basic?.basicCareRule && (
                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex gap-4 items-start mb-8">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-1">
                        <Info className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-emerald-900 font-bold text-sm mb-1 uppercase tracking-widest">Immediate Care Rule</h4>
                        <div className="text-emerald-800 text-sm leading-relaxed"><MarkdownResult content={selectedScan.basic.basicCareRule} /></div>
                      </div>
                    </div>
                  )}

                  {/* Pro Data */}
                  {selectedScan.pro && (
                    <div className="space-y-6 pt-6 border-t border-forest-deep/10">
                      {selectedScan.pro.deepDive && (
                        <div className="bg-forest-deep/5 rounded-2xl p-5 border border-forest-deep/10">
                          <h4 className="text-forest-deep font-bold uppercase tracking-widest text-xs mb-3">Botanical Deep Dive</h4>
                          <div className="prose prose-sm prose-stone max-w-none">
                            <MarkdownResult content={selectedScan.pro.deepDive} />
                          </div>
                        </div>
                      )}

                      {(selectedScan.pro.stepByStepPlan || selectedScan.basic?.actionPlan || selectedScan.actionPlan) && (
                        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                          <h4 className="text-forest-deep font-bold uppercase tracking-widest text-xs mb-4">Rescue Plan</h4>
                          <ul className="space-y-3">
                            {(selectedScan.pro.stepByStepPlan || selectedScan.basic?.actionPlan || selectedScan.actionPlan).map((step: string, idx: number) => (
                              <li key={idx} className="flex gap-3 items-start">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-forest-deep/10 text-forest-deep flex items-center justify-center text-[10px] font-bold mt-0.5">
                                  {idx + 1}
                                </div>
                                <div className="text-forest-deep/80 text-sm leading-relaxed pt-0.5">
                                  <MarkdownResult content={step} />
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedScan.pro.environmentalAdjustments && (
                        <div>
                          <h4 className="text-forest-deep font-bold uppercase tracking-widest text-xs mb-3">Environment</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(selectedScan.pro.environmentalAdjustments).map(([key, value]) => (
                              <div key={key} className="bg-white rounded-xl p-4 border border-stone-200">
                                <h5 className="text-forest-deep font-bold uppercase tracking-widest text-[10px] mb-1">{key}</h5>
                                <div className="text-forest-deep/80 text-xs"><MarkdownResult content={value as string} /></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedScan.pro.mistakesToAvoid && selectedScan.pro.mistakesToAvoid.length > 0 && (
                        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                          <h4 className="text-red-900 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Mistakes to Avoid
                          </h4>
                          <ul className="space-y-2">
                            {selectedScan.pro.mistakesToAvoid.map((mistake: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span> <MarkdownResult content={mistake} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              <div className="p-6 bg-white border-t border-forest-deep/5 flex justify-between items-center shrink-0">
                <button
                  onClick={(e) => handleDeleteClick(e, selectedScan.id)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Uproot Entry
                </button>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="px-8 py-3 bg-forest-deep text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-forest-deep/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
            onClick={() => setExpandedImageSrc(null)}
          >
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              src={expandedImageSrc}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={() => setExpandedImageSrc(null)}
            />
            <button
              onClick={() => setExpandedImageSrc(null)}
              className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Expanded Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-start bg-earth-sand/90 backdrop-blur-md p-6 overflow-x-auto overflow-y-hidden custom-scrollbar"
            onClick={() => setSelectedGroup(null)}
          >
            <div className="flex gap-6 sm:gap-8 items-center h-full max-h-[70vh] px-4 md:px-12 min-w-max mx-auto">
              {selectedGroup.map((scan: any, idx: number) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 400, damping: 30 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScan(scan);
                  }}
                  className="w-[280px] h-full max-h-[500px]"
                >
                  <HistoryCard
                    scan={scan}
                    onClick={() => setSelectedScan(scan)}
                    onDelete={handleDeleteClick}
                    getRiskIcon={getRiskIcon}
                    getRiskColor={getRiskColor}
                  />
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setSelectedGroup(null)}
              className="fixed top-8 right-8 z-[100] w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-forest-deep hover:bg-white transition-colors border border-forest-deep/10 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {scanToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-earth-sand/90 backdrop-blur-md p-4"
            onClick={() => setScanToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-forest-deep mb-2">Uproot this entry?</h3>
              <p className="text-forest-deep/60 mb-8">This action cannot be undone. Are you sure you want to remove this plant from your garden?</p>

              <div className="flex gap-4">
                <button
                  onClick={() => setScanToDelete(null)}
                  className="flex-1 px-6 py-3 bg-stone-100 text-forest-deep rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors"
                >
                  Keep It
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                >
                  Uproot
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

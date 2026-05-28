import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Leaf, Search, ChevronDown, Skull, X, ShieldAlert, Activity, Shield } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { plantsData as defaultPlantsData } from '../../data/plants';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { FurinBell3D } from '../../components/FurinBell3D';

gsap.registerPlugin(ScrollTrigger);

import { CareGuideHero } from './CareGuideHero';

const generateTanzakuBackground = (index: number, color: string) => {
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // 1. Sakura (Cherry Blossom) SVG - Fixed aspect ratio to prevent squashing
  let sakuraSvg = `<svg width="100" height="300" viewBox="0 0 100 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`;

  // Generate 2 to 4 full flowers
  const numFlowers = 2 + Math.floor(random(index + 1) * 3);

  for (let i = 0; i < numFlowers; i++) {
    const isTop = random(index * 10 + i) > 0.5;
    // Keep flowers in top 20% or bottom 20% to avoid text
    const y = isTop ? 10 + random(index * 20 + i) * 50 : 240 + random(index * 20 + i) * 50;
    const x = random(index * 30 + i) * 100;
    const size = 0.5 + random(index * 40 + i) * 0.6;
    const rotation = random(index * 45 + i) * 360;
    const opacity = 0.4 + random(index * 50 + i) * 0.4;

    // A beautiful 5-petal sakura flower
    sakuraSvg += `<g transform="translate(${x}, ${y}) scale(${size}) rotate(${rotation})" fill="${color}" fill-opacity="${opacity}">
      <path d="M0,0 C-5,-5 -7,-10 -3,-12 L0,-10 L3,-12 C7,-10 5,-5 0,0" transform="rotate(0)" />
      <path d="M0,0 C-5,-5 -7,-10 -3,-12 L0,-10 L3,-12 C7,-10 5,-5 0,0" transform="rotate(72)" />
      <path d="M0,0 C-5,-5 -7,-10 -3,-12 L0,-10 L3,-12 C7,-10 5,-5 0,0" transform="rotate(144)" />
      <path d="M0,0 C-5,-5 -7,-10 -3,-12 L0,-10 L3,-12 C7,-10 5,-5 0,0" transform="rotate(216)" />
      <path d="M0,0 C-5,-5 -7,-10 -3,-12 L0,-10 L3,-12 C7,-10 5,-5 0,0" transform="rotate(288)" />
      <circle cx="0" cy="0" r="2" fill="#fff" opacity="0.9"/>
      <circle cx="0" cy="0" r="1" fill="${color}" opacity="0.8"/>
    </g>`;
  }

  // Generate some scattered falling petals
  const numPetals = 3 + Math.floor(random(index + 5) * 4);
  for (let i = 0; i < numPetals; i++) {
    const isTop = random(index * 60 + i) > 0.5;
    const y = isTop ? random(index * 70 + i) * 60 : 230 + random(index * 70 + i) * 60;
    const x = random(index * 80 + i) * 100;
    const size = 0.3 + random(index * 85 + i) * 0.4;
    const rotation = random(index * 90 + i) * 360;
    const opacity = 0.3 + random(index * 95 + i) * 0.4;

    sakuraSvg += `<g transform="translate(${x}, ${y}) scale(${size}) rotate(${rotation})" fill="${color}" fill-opacity="${opacity}">
      <path d="M0,0 C-5,-5 -7,-10 -3,-12 L0,-10 L3,-12 C7,-10 5,-5 0,0" />
    </g>`;
  }

  sakuraSvg += `</svg>`;

  // 2. Traditional Patterns Array
  const patterns = [
    // Asanoha (Hemp leaf)
    `<svg width='12' height='12' viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'><path d='M6 0a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6zm0 1a5 5 0 1 0 0 10 5 5 0 0 0 0-10z' fill='%232c3e2e' fill-opacity='0.04' fill-rule='evenodd'/></svg>`,
    // Shippo (Seven Treasures)
    `<svg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><circle cx='0' cy='10' r='10' fill='none' stroke='%232c3e2e' stroke-width='1' stroke-opacity='0.06'/><circle cx='20' cy='10' r='10' fill='none' stroke='%232c3e2e' stroke-width='1' stroke-opacity='0.06'/><circle cx='10' cy='0' r='10' fill='none' stroke='%232c3e2e' stroke-width='1' stroke-opacity='0.06'/><circle cx='10' cy='20' r='10' fill='none' stroke='%232c3e2e' stroke-width='1' stroke-opacity='0.06'/></svg>`,
    // Ichimatsu (Checkered)
    `<svg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'><rect width='8' height='8' fill='%232c3e2e' fill-opacity='0.03'/><rect x='8' y='8' width='8' height='8' fill='%232c3e2e' fill-opacity='0.03'/></svg>`,
    // Seigaiha (Waves)
    `<svg width='20' height='10' viewBox='0 0 20 10' xmlns='http://www.w3.org/2000/svg'><path d='M0 10a10 10 0 0 1 20 0M-10 10a10 10 0 0 1 20 0M10 10a10 10 0 0 1 20 0' fill='none' stroke='%232c3e2e' stroke-width='1' stroke-opacity='0.06'/><path d='M0 10a7 7 0 0 1 20 0M-10 10a7 7 0 0 1 20 0M10 10a7 7 0 0 1 20 0' fill='none' stroke='%232c3e2e' stroke-width='1' stroke-opacity='0.06'/></svg>`,
    // Yagasuri (Arrow feathers)
    `<svg width='10' height='20' viewBox='0 0 10 20' xmlns='http://www.w3.org/2000/svg'><path d='M0 0l5 5 5-5v5l-5 5-5-5v-5zm0 10l5 5 5-5v5l-5 5-5-5v-5z' fill='%232c3e2e' fill-opacity='0.03'/></svg>`
  ];

  // Select a random pattern based on index
  const patternIndex = Math.floor(random(index * 17) * patterns.length);
  const selectedPatternSvg = patterns[patternIndex];

  const encodedSakura = encodeURIComponent(sakuraSvg);
  const encodedPattern = encodeURIComponent(selectedPatternSvg);

  // Randomize background position and size for the traditional pattern
  const bgPosX = Math.floor(random(index * 11) * 20);
  const bgPosY = Math.floor(random(index * 12) * 20);

  // Base sizes for patterns to look good
  const baseSizes = [12, 20, 16, 20, 10];
  const bgSize = baseSizes[patternIndex] + Math.floor(random(index * 13) * 4);

  return {
    backgroundImage: `url("data:image/svg+xml,${encodedSakura}"), url("data:image/svg+xml,${encodedPattern}")`,
    backgroundSize: `100% 100%, ${bgSize}px auto`,
    backgroundPosition: `0 0, ${bgPosX}px ${bgPosY}px`,
    backgroundRepeat: 'no-repeat, repeat'
  };
};

const CareGuideContent = ({ plantsData, isMobileMenuOpen = false }: { plantsData: any[], isMobileMenuOpen?: boolean }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const desktopTabsContainerRef = useRef<HTMLDivElement>(null);
  const mobileTabsContainerRef = useRef<HTMLDivElement>(null);
  const desktopTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileTabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const stRef = useRef<ScrollTrigger | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const touchStartYRef = useRef<number>(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [expandedPlantId, setExpandedPlantId] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCardClick = (id: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const checkIsCentered = () => {
      if (!stRef.current || filteredPlants.length === 0) return false;
      const totalCards = filteredPlants.length;
      const segmentSize = 1 / totalCards;
      const targetProgress = index * segmentSize;
      // 0.03 progress threshold means it must look visually locked in the center
      return Math.abs(stRef.current.progress - targetProgress) < 0.03;
    };

    if (expandedPlantId === id) {
      // Close if clicking the currently expanded card
      setExpandedPlantId(null);
    } else {
      // Instantly scroll AND trigger CSS scale expansion transition so it glides open beautifully!
      scrollToPlant(index);
      setExpandedPlantId(id);
    }
  };

  const handleWheelBounce = (e: React.WheelEvent<HTMLDivElement>, pid: string) => {
    if (expandedPlantId !== pid) return;
    const el = e.currentTarget;
    const atTop = el.scrollTop <= 1;
    const atBottom = Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight - 1;
    if (e.deltaY < 0 && atTop) return;
    if (e.deltaY > 0 && atBottom) return;
    e.stopPropagation();
  };

  const handleTouchStartBounce = (e: React.TouchEvent<HTMLDivElement>, pid: string) => {
    if (expandedPlantId !== pid) return;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMoveBounce = (e: React.TouchEvent<HTMLDivElement>, pid: string) => {
    if (expandedPlantId !== pid) return;
    const el = e.currentTarget;
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartYRef.current - currentY;
    touchStartYRef.current = currentY;
    const atTop = el.scrollTop <= 1;
    const atBottom = Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight - 1;
    if (deltaY < 0 && atTop) return;
    if (deltaY > 0 && atBottom) return;
    e.stopPropagation();
  };

  // Auto-collapse cards when the user scrolls to a different card
  useEffect(() => {
    if (expandedPlantId) {
      setExpandedPlantId(null);
    }
  }, [activeIndex]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSidebarVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    plantsData.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [plantsData]);

  const filteredPlants = useMemo(() => {
    return plantsData.filter(p => {
      const matchesCategory = activeCategory ? p.category === activeCategory : true;
      return matchesCategory;
    });
  }, [plantsData, activeCategory]);

  const searchedPlants = useMemo(() => {
    return filteredPlants
      .map((plant, index) => ({ plant, originalIndex: index }))
      .filter(({ plant }) => plant.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [filteredPlants, searchQuery]);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean);
    const totalCards = cards.length;
    if (totalCards === 0) return;

    const segmentSize = 1 / totalCards;
    const cardOffset = 5;
    const cardScaleStep = 0.075;

    // Initialize
    cards.forEach((card, i) => {
      gsap.set(card, {
        xPercent: -50,
        yPercent: -50 + (i * cardOffset),
        scale: 1 - (i * cardScaleStep),
      });
    });

    const scrollDistance = window.innerHeight * totalCards * 1.5;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${scrollDistance}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const animationIdx = Math.min(
          Math.floor(progress / segmentSize),
          totalCards - 1
        );

        // Use the card closest to the center for the navigation highlight
        const displayIdx = Math.min(
          Math.round(progress / segmentSize),
          totalCards - 1
        );

        if (displayIdx !== activeIndexRef.current) {
           activeIndexRef.current = displayIdx;
           setActiveIndex(displayIdx);
        }

        const segProgress = (progress - animationIdx * segmentSize) / segmentSize;

        cards.forEach((card, i) => {
          const distance = i - animationIdx;

          if (distance < -1) {
            // Already completely past, hide to save GPU
            if (card.dataset.hidden !== 'true') {
              gsap.set(card, {
                yPercent: -250,
                rotationX: 35,
                scale: 1,
                visibility: 'hidden',
                opacity: 1
              });
              card.dataset.hidden = 'true';
            }
          } else if (distance > 3) {
            if (card.dataset.hidden !== 'true') {
              gsap.set(card, { visibility: 'hidden' });
              card.dataset.hidden = 'true';
            }
          } else {
            // Unhide active cards
            card.dataset.hidden = 'false';

            if (distance < 0) {
              // Just passed, wait completely out of view
              gsap.set(card, {
                yPercent: -250,
                rotationX: 35,
                scale: 1,
                visibility: 'visible',
                opacity: 1
              });
            } else if (distance === 0) {
              // Currently flipping and moving out
              gsap.set(card, {
                yPercent: gsap.utils.interpolate(-50, -250, segProgress),
                rotationX: gsap.utils.interpolate(0, 35, segProgress),
                scale: 1,
                visibility: 'visible',
                opacity: 1
              });
            } else {
              const currentYOffset = -50 + (distance * cardOffset);
              const nextYOffset = -50 + ((distance - 1) * cardOffset);
              const currentScale = Math.max(0, 1 - (distance * cardScaleStep));
              const nextScale = Math.max(0, 1 - ((distance - 1) * cardScaleStep));

              gsap.set(card, {
                yPercent: gsap.utils.interpolate(currentYOffset, nextYOffset, segProgress),
                rotationX: 0,
                scale: gsap.utils.interpolate(currentScale, nextScale, segProgress),
                visibility: 'visible',
                opacity: 1
              });
            }
          }
        });
      }
    });

    stRef.current = st;

    // Handle initial scroll to target plant
    if (location.state?.targetPlantName) {
      const targetName = location.state.targetPlantName.toLowerCase();
      const index = filteredPlants.findIndex(p => p.name.toLowerCase() === targetName);
      if (index !== -1) {
        setTimeout(() => {
          scrollToPlant(index);
        }, 100);
      }
    }

    return () => {
      st.kill();
      stRef.current = null;
    };
  }, [filteredPlants, location.state]);

  useEffect(() => {
    // Handle Desktop Sidebar Auto-scroll
    if (desktopTabsContainerRef.current && desktopTabRefs.current[activeIndex]) {
      const containerEl = desktopTabsContainerRef.current;
      const tabEl = desktopTabRefs.current[activeIndex];
      if (tabEl && window.innerWidth >= 768) {
        const scrollTop = tabEl.offsetTop - containerEl.offsetHeight / 2 + tabEl.offsetHeight / 2;
        containerEl.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }

    // Handle Mobile Chimes Auto-scroll
    if (mobileTabsContainerRef.current && mobileTabRefs.current[activeIndex]) {
      const containerEl = mobileTabsContainerRef.current;
      const tabEl = mobileTabRefs.current[activeIndex];
      if (tabEl && window.innerWidth < 768) {
        const scrollLeft = tabEl.offsetLeft - containerEl.offsetWidth / 2 + tabEl.offsetWidth / 2;
        containerEl.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  const scrollToPlant = (index: number) => {
    if (stRef.current && lenisRef.current && filteredPlants.length > 0) {
      // Always collapse any open card when navigating
      setExpandedPlantId(null);

      const totalCards = filteredPlants.length;
      const segmentSize = 1 / totalCards;

      // Use exact ScrollTrigger start and end to guarantee accuracy even if pinning shifts layout
      const startY = stRef.current.start;
      const endY = stRef.current.end;
      const actualDistance = endY - startY;

      const targetProgress = index * segmentSize;
      const targetY = startY + (actualDistance * targetProgress);

      lenisRef.current.scrollTo(targetY, { duration: 1.2, force: true });
      if (window.innerWidth < 768) setIsNavExpanded(false);
    }
  };

  return (
    <div className="w-full relative z-10 bg-earth-sand">

      {/* WebGL Displacement Hero Section */}
      <CareGuideHero />

      <div className="flex flex-col md:flex-row relative w-full bg-earth-sand">

        {/* Sidebar (Desktop Only) */}
        <div
          data-lenis-prevent
          className={`hidden md:flex sticky top-8 z-50 w-80 h-[calc(100vh-64px)] bg-[#f4f1eb]/90 backdrop-blur-2xl border border-white/60 flex-col shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl m-8 transition-all duration-700 ease-out ${isSidebarVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
        >
          <div className="p-6 border-b border-forest-deep/5 shrink-0 flex flex-col gap-4 rounded-t-3xl bg-white/40">
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-forest-deep text-white'
                    : 'bg-white/50 text-forest-deep/70 hover:bg-white/80'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-forest-deep text-white'
                      : 'bg-white/50 text-forest-deep/70 hover:bg-white/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-deep/40" />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 border border-white/60 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-forest-deep/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-forest-deep placeholder:text-forest-deep/40 font-medium"
            />
          </div>
        </div>

        <div
          ref={desktopTabsContainerRef}
          data-lenis-prevent
          className="flex-1 overflow-y-auto p-4 pb-8 flex flex-col gap-2 scroll-smooth overscroll-contain custom-scrollbar-sidebar rounded-br-3xl"
        >
          {filteredPlants.map((plant, index) => {
            const nameParts = plant.name.split('(');
            const mainName = nameParts[0].trim();
            const subName = nameParts.length > 1 ? `(${nameParts[1]}` : null;

            return (
            <button
              key={plant.id || index}
              ref={el => { desktopTabRefs.current[index] = el; }}
              onClick={() => scrollToPlant(index)}
              className={`w-full text-left p-3.5 rounded-2xl transition-all duration-300 flex items-center gap-4 group ${
                activeIndex === index
                  ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] ring-1 ring-black/5 scale-100'
                  : 'hover:bg-white/60 scale-100'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full shrink-0 overflow-hidden border-2 transition-colors duration-300 ${activeIndex === index ? 'border-white shadow-sm' : 'border-transparent group-hover:border-white/50'}`}
                style={{ backgroundColor: plant.bgColor || '#e8e4dc' }}
              >
                <img
                  src={plant.image || `https://picsum.photos/seed/${encodeURIComponent(plant.name)}/200/200`}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-sm truncate transition-colors ${activeIndex === index ? 'text-forest-deep' : 'text-forest-deep/80'}`}>{mainName}</div>
                {subName && <div className="text-[10px] text-forest-deep/70 truncate mt-0.5">{subName}</div>}
                <div className={`text-xs mt-1 font-medium transition-colors ${activeIndex === index ? 'text-forest-deep/80' : 'text-forest-deep/60'}`}>{plant.difficulty || 'Medium'}</div>
              </div>
            </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Wind Chime Navigation (Bottom Floating Pill) */}
      <div className={`md:hidden fixed bottom-6 left-4 right-4 max-w-[400px] mx-auto z-[90] flex flex-col justify-end transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${(isSidebarVisible && !isMobileMenuOpen) ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-12 opacity-0 pointer-events-none'}`}>

        {/* Expanded Area (Wind Chimes) */}
        <div className={`bg-white/80 backdrop-blur-3xl border border-white/60 shadow-[0_-8px_30px_rgba(26,54,33,0.08)] rounded-[2rem] transition-all duration-500 overflow-hidden relative w-full mb-3 ${isNavExpanded ? 'h-[40vh] opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}>
          {/* Close Handle */}
          <div className="w-full h-8 flex items-center justify-center absolute top-0 left-0 z-20 cursor-pointer bg-gradient-to-b from-white/40 to-transparent" onClick={() => setIsNavExpanded(false)}>
            <div className="w-10 h-1 bg-forest-deep/15 rounded-full"></div>
          </div>

          <div
            ref={mobileTabsContainerRef}
            data-lenis-prevent
            className="flex gap-8 px-8 pt-7 pb-8 overflow-x-auto hide-scrollbar h-full items-start relative z-10 pointer-events-auto"
          >
            {searchedPlants.map(({ plant, originalIndex }, displayIndex) => {
              const randomDuration = 2.5 + (originalIndex % 3);
              const randomDelay = -(originalIndex % 5);

              return (
                <div key={plant.id || originalIndex} className="flex flex-col items-center shrink-0 relative group cursor-pointer w-16 pointer-events-auto" style={{ WebkitUserSelect: 'none' }}>
                  <div className="w-2.5 h-1.5 bg-stone-800/40 rounded-[100%] absolute top-0 z-20 shadow-inner"></div>

                  <button
                    ref={el => { mobileTabRefs.current[originalIndex] = el; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToPlant(originalIndex);
                    }}
                    className="flex flex-col items-center animate-chime w-full pt-0.5 pointer-events-auto"
                    draggable={false}
                    style={{
                      animationDuration: `${randomDuration}s`,
                      animationDelay: `${randomDelay}s`,
                      transformOrigin: 'top center',
                      WebkitUserDrag: 'none'
                    } as any}
                  >
                    <div className="w-[1px] h-5 bg-[#8c8273]"></div>

                    <div className="-mt-1 -mb-1">
                      <FurinBell3D
                        image={plant.bellImage || plant.image}
                        color={plant.bgColor || '#ffffff'}
                        active={activeIndex === originalIndex}
                      />
                    </div>

                    <div className="relative flex flex-col items-center z-10 -mt-2">
                      <div className="w-[1px] h-3 bg-[#8c8273]/60"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/90 border border-white shadow-sm z-10"></div>
                      <div className="w-[1px] h-3 bg-[#8c8273]"></div>
                    </div>

                    <div
                      className="bg-[#fdfcf8] border border-[#e8e3d9] shadow-md rounded-sm min-h-[95px] w-[28px] flex flex-col items-center justify-start transition-colors group-hover:bg-white relative overflow-hidden"
                      style={{
                        ...(plant.tanzakuImage ? { backgroundImage: `url(${plant.tanzakuImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : generateTanzakuBackground(originalIndex, plant.bgColor || '#2c3e2e')),
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 8px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[16px] bg-white/85 backdrop-blur-[2px] shadow-[0_0_4px_rgba(255,255,255,0.8)] z-0"></div>
                      <div className="w-1 h-1 rounded-full bg-[#d4cbb8] shadow-inner mt-3 mb-2.5 z-10 relative"></div>
                      <span
                        className="writing-vertical text-[10px] font-serif tracking-[0.2em] text-forest-deep whitespace-nowrap leading-none z-10 relative pb-3"
                        style={{ fontWeight: 500 }}
                      >
                        {plant.name}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pill Bar */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(26,54,33,0.12)] rounded-full h-14 flex items-center justify-between px-2 w-full shrink-0">
          <div className="relative flex-1 mx-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-deep/50" />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => { e.stopPropagation(); setIsNavExpanded(true); }}
              className="w-full bg-forest-deep/5 border border-transparent rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:bg-white focus:border-forest-deep/10 text-forest-deep transition-all placeholder:text-forest-deep/40"
            />
          </div>

          <button
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            className={`flex items-center justify-center gap-1.5 px-4 h-10 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${isNavExpanded ? 'bg-forest-deep text-earth-sand' : 'text-forest-deep hover:bg-forest-deep/5'}`}
          >
            Index
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isNavExpanded ? '' : 'rotate-180'}`} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full relative">
        <section ref={containerRef} className="sticky-cards-container relative w-full h-screen overflow-hidden" style={{ perspective: '850px' }}>
          {filteredPlants.map((plant, i) => {
            const nameParts = plant.name.split('(');
            const mainName = nameParts[0].trim();
            const subName = nameParts.length > 1 ? `(${nameParts[1]}` : null;

                  return (
                    <div
                      key={plant.id || i}
                      ref={el => { cardsRef.current[i] = el; }}
                      className="gsap-card absolute top-1/2 left-1/2 w-[90%] md:w-[85%] lg:w-[80%] max-w-5xl h-[70vh] md:h-[75vh]"
                      style={{
                        zIndex: filteredPlants.length - i,
                        transformOrigin: 'center bottom',
                        willChange: 'transform'
                      }}
                    >
                      <div
                        className={`absolute top-1/2 left-0 w-full -translate-y-1/2 flex flex-col items-center rounded-[2rem] text-white transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${expandedPlantId === plant.id ? 'h-[90vh] md:h-[95vh] overflow-y-auto hide-scrollbar overscroll-contain' : 'h-[70vh] md:h-[75vh] overflow-hidden'}`}
                        style={{
                          backgroundColor: plant.bgColor || '#3d2fa9',
                          color: plant.textColor || '#ffffff',
                          willChange: 'transform, height'
                        }}
                        onClick={(e) => handleCardClick(plant.id || i.toString(), i, e)}
                        onWheel={(e) => handleWheelBounce(e, plant.id || i.toString())}
                        onTouchStart={(e) => handleTouchStartBounce(e, plant.id || i.toString())}
                        onTouchMove={(e) => handleTouchMoveBounce(e, plant.id || i.toString())}
                      >
                  <div
                    className={`w-full flex-shrink-0 flex flex-col md:flex-row gap-6 md:gap-12 p-6 md:p-12 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${expandedPlantId === plant.id ? 'min-h-[70vh] h-auto md:min-h-0 md:h-[45vh]' : 'h-[70vh] md:h-[75vh]'}`}
                  >
                    <div className={`flex-1 min-h-0 w-full flex flex-col hide-scrollbar pr-2 md:pr-0 relative ${expandedPlantId === plant.id ? 'overflow-visible' : 'overflow-hidden'} md:overflow-y-auto`}>
                      {/* Spacer to simulate vertical centering without layout jumping */}
                      <div
                        className="w-full flex-shrink-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{ height: expandedPlantId === plant.id ? '0vh' : '15vh' }}
                      />
                      <div className={`w-full flex flex-col transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${expandedPlantId === plant.id ? 'pt-2 md:pt-4' : 'pt-0'}`}>
                        <p className="font-dm-mono text-[10px] md:text-xs uppercase tracking-[0.3em] opacity-70 mb-4">
                          {plant.difficulty || 'Medium'} Care
                        </p>
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light uppercase leading-none tracking-tight mb-3">
                          {mainName}
                        </h1>
                        {subName && (
                          <h2 className="font-serif text-xl md:text-2xl italic opacity-80 mb-6">
                            {subName}
                          </h2>
                        )}
                        <p className={`text-sm md:text-base opacity-90 leading-relaxed font-light ${!subName ? 'mt-6' : ''}`}>
                          {plant.desc}
                        </p>

                        {(plant.watering || plant.water || plant.light) && (
                          <div className="flex gap-8 md:gap-12 mt-6 md:mt-8 bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
                            {(plant.watering || plant.water) && (
                              <div className="flex flex-col gap-1.5 flex-1">
                                <span className="font-dm-mono text-[10px] uppercase tracking-widest opacity-60">Water</span>
                                <span className="font-medium text-sm md:text-base line-clamp-3">{plant.watering || plant.water}</span>
                              </div>
                            )}
                            {plant.light && (
                              <div className="flex flex-col gap-1.5 flex-1">
                                <span className="font-dm-mono text-[10px] uppercase tracking-widest opacity-60">Light</span>
                                <span className="font-medium text-sm md:text-base line-clamp-3">{plant.light}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-8 md:mt-10">
                          <button
                            className="group relative inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-dm-mono text-[11px] uppercase tracking-widest transition-all duration-300"
                          >
                            <Activity className={`w-4 h-4 text-white/70 group-hover:text-white transition-transform duration-500 ${expandedPlantId === plant.id ? 'rotate-180' : ''}`} />
                            <span>{expandedPlantId === plant.id ? 'Close Protocol' : 'Read Protocol'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-full md:w-5/12 shrink-0 rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 relative group ${expandedPlantId === plant.id ? 'h-[35vh] md:h-full' : 'flex-1 md:h-full min-h-[30vh]'}`}
                    >
                      <img
                        src={plant.image || `https://images.unsplash.com/photo-${['1593482892290-f54927eba7fa','1485955900006-10f4d324d411','1501004318641-b39e6451bec6','1545241047-6083a36db158','1416879598555-220b3af4dd25'][i % 5]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                        alt={plant.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Expandable Protocol Bottom Section */}
                  <div
                    className={`w-full bg-[#fdfcf8] text-forest-deep transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] relative grid rounded-b-[2rem]`}
                    style={{
                      gridTemplateRows: expandedPlantId === plant.id ? '1fr' : '0fr',
                      opacity: expandedPlantId === plant.id ? 1 : 0,
                      pointerEvents: expandedPlantId === plant.id ? 'auto' : 'none',
                      borderTopWidth: expandedPlantId === plant.id ? '1px' : '0px',
                      borderColor: 'rgba(21, 35, 23, 0.1)'
                    }}
                onClick={(e) => {
                  // Prevent clicking inner text from immediately closing the card,
                  // but double clicking or clicking empty space could close if wanted.
                  // For now, any click inside protocol doesn't close it, except the top part.
                  e.stopPropagation();
                }}
              >
                <div className="overflow-hidden min-h-0">
                  <div
                    className={`w-full p-8 md:p-12 space-y-10 pb-20 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] delay-[150ms] ${expandedPlantId === plant.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="font-dm-mono text-[10px] md:text-xs uppercase tracking-[0.3em] opacity-50 mb-2">Emergency Details</p>
                      <h2 className="font-heading text-3xl md:text-4xl font-light uppercase leading-none tracking-tight">{mainName} Protocol</h2>
                    </div>
                  </div>

                  {/* 1. Rescue Plan */}
                  <div className="bg-[#ebf5df]/50 p-6 rounded-3xl border border-forest-deep/10">
                    <div className="flex items-center gap-3 mb-4">
                      <ShieldAlert className="w-5 h-5 text-red-700/80" />
                      <h3 className="font-serif text-2xl italic">Rescue Plan</h3>
                    </div>
                    <p className="font-light leading-relaxed opacity-80 text-sm md:text-base">
                      If leaves are yellowing or dropping rapidly, immediately assess soil moisture. Often this indicates root suffocation (overwatering) rather than lack of water. Let the top 50% of the soil dry entirely before the next watering, and ensure the pot has proper drainage.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 2. Soil & Repotting */}
                    <div>
                      <div className="flex items-center gap-3 mb-4 border-b border-forest-deep/10 pb-4">
                        <Shield className="w-4 h-4 opacity-50" />
                        <h3 className="font-dm-mono text-xs uppercase tracking-widest">Soil & Repotting</h3>
                      </div>
                      <ul className="space-y-3 font-light text-sm opacity-80 leading-relaxed">
                        <li><span className="font-medium">Mix:</span> Requires a well-draining, airy mix. Combine 50% organic potting soil with 30% perlite and 20% orchid bark.</li>
                        <li><span className="font-medium">Timing:</span> Repot only when roots begin pushing out of the drainage holes or the soil depletes (every 1-2 years).</li>
                      </ul>
                    </div>

                    {/* 3. Toxicity / Pets */}
                    <div>
                      <div className="flex items-center gap-3 mb-4 border-b border-forest-deep/10 pb-4">
                        <Skull className="w-4 h-4 opacity-50" />
                        <h3 className="font-dm-mono text-xs uppercase tracking-widest">Toxicity Warning</h3>
                      </div>
                      <p className="font-light text-sm opacity-80 leading-relaxed text-red-900/80 font-medium bg-red-50/50 p-4 rounded-2xl border border-red-900/10">
                        Please secure this plant away from cats, dogs, and small children. Ingestion may cause acute irritation and discomfort.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            </div>
            );
          })}
        </section>
      </div>
      </div>
    </div>
  );
};

const CareGuideView = ({ isMobileMenuOpen = false }: { isMobileMenuOpen?: boolean }) => {
  const [plantsData, setPlantsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPlants = async () => {
      try {
        const snap = await getDocs(collection(db, 'plants'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a: any, b: any) => {
          const orderA = a.order !== undefined ? a.order : 9999;
          const orderB = b.order !== undefined ? b.order : 9999;
          if (orderA !== orderB) return orderA - orderB;
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        });
        if (isMounted) {
          setPlantsData(data);
        }
      } catch (error) {
        console.error("Error fetching plants", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchPlants();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col md:flex-row bg-earth-sand overflow-hidden">
        <div className="w-full md:w-80 h-auto md:h-full bg-earth-sand/90 border-b md:border-b-0 md:border-r border-forest-deep/10 flex flex-col shrink-0 p-6 animate-pulse">
          <div className="h-10 bg-stone-200 rounded-full w-full mb-6"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-stone-200 rounded-xl w-full"></div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-12 animate-pulse">
          <div className="w-full max-w-5xl h-[75vh] bg-stone-200 rounded-[2.5rem] border border-forest-deep/5 shadow-sm flex flex-col md:flex-row p-8 md:p-16 gap-8">
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-16 bg-stone-300 rounded-lg w-3/4 mb-6"></div>
              <div className="h-6 bg-stone-300 rounded w-full mb-3"></div>
              <div className="h-6 bg-stone-300 rounded w-5/6 mb-8"></div>
              <div className="h-10 bg-stone-300 rounded-full w-32 mb-auto"></div>
              <div className="h-48 bg-stone-300 rounded-2xl w-full mt-8"></div>
            </div>
            <div className="flex-1 h-full bg-stone-300 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (plantsData.length === 0 && defaultPlantsData.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-earth-sand px-6">
        <div className="text-center py-24 bg-white/40 rounded-[2rem] border border-dashed border-forest-deep/10 flex flex-col items-center justify-center max-w-md w-full">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
            <Skull className="w-10 h-10 text-stone-300" />
          </div>
          <h3 className="text-xl font-medium text-forest-deep mb-2">No survivors found</h3>
          <p className="text-forest-deep/50 italic">
            The survival guide is currently empty. We're probably out burying the evidence. Check back later.
          </p>
        </div>
      </div>
    );
  }

  const displayData = plantsData.length > 0 ? plantsData : defaultPlantsData;

  return <CareGuideContent plantsData={displayData} isMobileMenuOpen={isMobileMenuOpen} />;
};

export default CareGuideView;

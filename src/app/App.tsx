import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useVelocity,
  useTransform,
  useMotionValueEvent,
} from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GalleryItem } from './components/GalleryItem';
import { LandingPages } from './components/LandingPages';
import { ContactPanel } from './components/ContactPanel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import {
  AdminProvider,
  useAdmin,
  type GalleryItemData,
} from './context/AdminContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function canUseTouchGalleryHighlight() {
  if (typeof window === 'undefined') return false;
  const hasDesktopHover = window.matchMedia(
    '(hover: hover) and (pointer: fine)',
  ).matches;

  if (hasDesktopHover) return false;

  return (
    window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0
  );
}

function LoadingWave({ isActive }: { isActive: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let startTime = Date.now();
    const duration = 2000; // 스윕 속도를 2배로 늦춤 (더 천천히 여유롭게)
    let frame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const cycle = (elapsed / duration) % 2;
      const progress = cycle <= 1 ? cycle : 2 - cycle;

      // 진자 운동처럼 양끝에서 우아하게 감속하는 easeInOutSine
      const ease = -(Math.cos(Math.PI * progress) - 1) / 2;

      // 소수점을 유지하여 60fps로 매 프레임 위치/높이가 초미세하게 갱신되도록 개선
      setActiveIndex(ease * 24);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isActive]);

  return (
    <div className="flex gap-[8px] items-center justify-center h-[72px]">
      {Array.from({ length: 25 }).map((_, i) => {
        const distance = Math.abs(i - activeIndex);
        const curveFactor = Math.max(0, 1 - distance / 5);
        const mobileWave =
          curveFactor *
          curveFactor *
          curveFactor *
          (curveFactor * (curveFactor * 6 - 15) + 10);
        const mobileScaleY = 0.62 + mobileWave * 0.5;
        const mobileScaleX = 1 + mobileWave * 0.06;
        const mobileYOffset = (1 - mobileWave) * 7;
        const mobileOpacity = Math.max(0.18, 0.35 + mobileWave * 0.65);

        // 현재 위치에서 가장 가까운 단 1개의 바를 찾아서 색상 부여
        const isCenter = i === Math.round(activeIndex);
        const barStyle = {
          height: '24px',
          transform: `translateY(${mobileYOffset}px) scaleX(${mobileScaleX}) scaleY(${mobileScaleY})`,
          opacity: mobileOpacity,
          transformOrigin: 'center bottom',
        };

        return (
          <div
            key={i}
            className={cn(
              'w-[1.5px] shrink-0 rounded-full',
              'will-change-transform transition-[background-color,box-shadow] duration-200 ease-out',
              isCenter
                ? 'bg-theme-primary shadow-[0_0_10px_var(--theme-primary)] z-10'
                : 'bg-white',
            )}
            style={barStyle}
          />
        );
      })}
    </div>
  );
}

export function Gallery() {
  const [isHovering, setIsHovering] = useState(false);
  const [activeDetail, setActiveDetail] = useState<GalleryItemData | null>(
    null,
  );
  const [isDetailClosing, setIsDetailClosing] = useState(false);
  const [isDetailAnimating, setIsDetailAnimating] = useState(false);
  const [isDetailSwitching, setIsDetailSwitching] = useState(false);
  const [detailChromeColor, setDetailChromeColor] = useState('#C29B4C');
  const [isIntroLoading, setIsIntroLoading] = useState(true);
  const [maxScroll, setMaxScroll] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [highlightedGalleryId, setHighlightedGalleryId] = useState<
    number | null
  >(null);
  const { settings, isLoading: isAdminLoading } = useAdmin();
  const galleryData = isAdminLoading ? [] : settings.galleryData;

  const containerRef = useRef<HTMLDivElement>(null);

  // Custom cursor without delay (1:1 follow)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Advanced horizontal smooth scroll with velocity
  const scrollX = useMotionValue(0);
  const smoothScrollX = useSpring(scrollX, { damping: 50, stiffness: 400 });
  const scrollVelocity = useVelocity(smoothScrollX);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const targetScrollRef = useRef(0);
  const closeTimeoutRef = useRef<number | null>(null);
  const detailSwitchTimeoutRef = useRef<number | null>(null);
  const detailChromeColorTimeoutRef = useRef<number | null>(null);
  const imagePreloadCacheRef = useRef<Map<string, Promise<void>>>(new Map());
  const openDetailRequestRef = useRef(0);
  const DETAIL_CLOSE_DURATION_MS = 1200;
  const activeDetailIndex = activeDetail
    ? galleryData.findIndex((item) => item.id === activeDetail.id)
    : -1;
  const canShowPreviousDetail = activeDetailIndex > 0;
  const canShowNextDetail =
    activeDetailIndex >= 0 && activeDetailIndex < galleryData.length - 1;

  useEffect(() => {
    if (activeDetail && !isDetailClosing) {
      // 약간의 지연을 주어 DOM이 닫힌 상태로 마운트된 후 열림 상태로 전환되게 함 (초기 마운트 애니메이션 누락 방지)
      const t = setTimeout(() => setIsDetailAnimating(true), 50);
      return () => clearTimeout(t);
    } else {
      setIsDetailAnimating(false);
    }
  }, [activeDetail, isDetailClosing]);

  const isDetailOpen = isDetailAnimating;
  const isDetailSurfaceOpen =
    Boolean(activeDetail) &&
    !isDetailClosing &&
    (isDetailOpen || isDetailSwitching);
  const isDetailChromeOpen = isDetailSurfaceOpen;
  const getDetailTextColor = (detail: GalleryItemData | null) =>
    detail?.textColor || settings.themeColor;
  const updateTouchGalleryHighlight = (detail: GalleryItemData) => {
    if (!canUseTouchGalleryHighlight()) return;
    setHighlightedGalleryId(detail.id);
  };
  const clearTouchGalleryHighlightOnScroll = () => {
    if (!canUseTouchGalleryHighlight()) return;
    setHighlightedGalleryId(null);
  };

  const preloadDetailImage = (detail: GalleryItemData) => {
    const cached = imagePreloadCacheRef.current.get(detail.img);
    if (cached) return cached;

    const preload = new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (img.decode) {
          img.decode().then(resolve).catch(resolve);
          return;
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = detail.img;
    });

    imagePreloadCacheRef.current.set(detail.img, preload);
    return preload;
  };

  const openDetail = (detail: GalleryItemData) => {
    openDetailRequestRef.current += 1;

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (detailSwitchTimeoutRef.current) {
      window.clearTimeout(detailSwitchTimeoutRef.current);
      detailSwitchTimeoutRef.current = null;
    }
    if (detailChromeColorTimeoutRef.current) {
      window.clearTimeout(detailChromeColorTimeoutRef.current);
      detailChromeColorTimeoutRef.current = null;
    }

    setIsDetailClosing(false);
    setIsDetailSwitching(false);
    setDetailChromeColor(getDetailTextColor(detail));
    updateTouchGalleryHighlight(detail);
    setActiveDetail(detail);
    preloadDetailImage(detail);
  };

  const triggerCloseDetail = () => {
    if (!activeDetail || isDetailClosing) return;
    openDetailRequestRef.current += 1;
    setIsDetailClosing(true);
    setIsDetailSwitching(false);
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    if (detailSwitchTimeoutRef.current) {
      window.clearTimeout(detailSwitchTimeoutRef.current);
      detailSwitchTimeoutRef.current = null;
    }
    if (detailChromeColorTimeoutRef.current) {
      window.clearTimeout(detailChromeColorTimeoutRef.current);
      detailChromeColorTimeoutRef.current = null;
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setActiveDetail(null);
      setIsDetailClosing(false);
      closeTimeoutRef.current = null;
    }, DETAIL_CLOSE_DURATION_MS);
  };

  const showAdjacentDetail = (direction: -1 | 1) => {
    if (activeDetailIndex < 0) return;
    const nextIndex = activeDetailIndex + direction;
    if (nextIndex < 0 || nextIndex >= galleryData.length) return;
    const requestId = openDetailRequestRef.current + 1;
    openDetailRequestRef.current = requestId;

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsDetailClosing(false);
    setIsDetailSwitching(true);
    setIsDetailAnimating(false);
    if (detailSwitchTimeoutRef.current) {
      window.clearTimeout(detailSwitchTimeoutRef.current);
    }
    detailSwitchTimeoutRef.current = window.setTimeout(() => {
      const nextDetail = galleryData[nextIndex];
      preloadDetailImage(nextDetail).finally(() => {
        if (openDetailRequestRef.current !== requestId) return;
        setActiveDetail(nextDetail);
        updateTouchGalleryHighlight(nextDetail);
        detailChromeColorTimeoutRef.current = window.setTimeout(() => {
          setDetailChromeColor(getDetailTextColor(nextDetail));
          detailChromeColorTimeoutRef.current = null;
        }, 250);
        detailSwitchTimeoutRef.current = null;
      });
    }, 180);
  };

  useEffect(() => {
    if (!isDetailOpen || !isDetailSwitching) return;

    const t = window.setTimeout(() => {
      setIsDetailSwitching(false);
    }, 80);

    return () => window.clearTimeout(t);
  }, [isDetailOpen, isDetailSwitching]);

  useEffect(() => {
    if (!isDetailOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canShowPreviousDetail) {
        e.preventDefault();
        showAdjacentDetail(-1);
      }
      if (e.key === 'ArrowRight' && canShowNextDetail) {
        e.preventDefault();
        showAdjacentDetail(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isDetailOpen,
    canShowPreviousDetail,
    canShowNextDetail,
    activeDetailIndex,
    galleryData,
  ]);

  // Measure max scrollable distance
  useEffect(() => {
    const updateMaxScroll = () => {
      if (containerRef.current) {
        const firstChild = containerRef.current
          .firstElementChild as HTMLElement;
        const lastChild = containerRef.current.lastElementChild as HTMLElement;
        if (firstChild && lastChild) {
          const totalWidth = lastChild.offsetLeft - firstChild.offsetLeft;
          setMaxScroll(totalWidth);
        }
      }
    };

    updateMaxScroll();
    const t = setTimeout(updateMaxScroll, 500); // Wait for images to load
    window.addEventListener('resize', updateMaxScroll);
    return () => {
      window.removeEventListener('resize', updateMaxScroll);
      clearTimeout(t);
    };
  }, [galleryData.length, isAdminLoading]);

  // Wheel and drag handling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (activeDetail) {
        // 상세 오버레이가 열린 동안에는 브라우저 기본 세로 스크롤을 항상 차단
        e.preventDefault();
        // 상세 페이지가 열려있을 때 휠(스크롤) 감지 시 홈으로 이동
        if (Math.abs(e.deltaY) > 5 || Math.abs(e.deltaX) > 5) {
          triggerCloseDetail();
        }
        return;
      }

      // 브라우저 기본 스크롤 동작 방지 (위아래 흔들림 방지)
      e.preventDefault();

      if (Math.abs(e.deltaY) > 5 || Math.abs(e.deltaX) > 5) {
        clearTouchGalleryHighlightOnScroll();
      }

      targetScrollRef.current += e.deltaY * 1.5 + e.deltaX * 1.5;
      targetScrollRef.current = Math.max(
        0,
        Math.min(targetScrollRef.current, maxScroll),
      );
      scrollX.set(targetScrollRef.current);
    };

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let hasClearedHighlightInDrag = false;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      hasClearedHighlightInDrag = false;
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    };
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      // 터치 스크롤 시 브라우저 기본 동작 방지
      if (e.cancelable) {
        e.preventDefault();
      }

      const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (activeDetail) {
        // 상세 페이지에서 드래그/스와이프 감지 시 홈으로 이동
        const diffX = Math.abs(startX - currentX);
        const diffY = Math.abs(startY - currentY);
        if (diffX > 30 || diffY > 30) {
          triggerCloseDetail();
          isDragging = false;
        }
        return;
      }

      const isTouchMove = 'touches' in e;
      const diffX = startX - currentX;
      const diffY = isTouchMove ? startY - currentY : 0;
      const dragSpeed = isTouchMove ? 3.2 : 2.0;
      if (
        !hasClearedHighlightInDrag &&
        (Math.abs(diffX) > 4 || Math.abs(diffY) > 4)
      ) {
        clearTouchGalleryHighlightOnScroll();
        hasClearedHighlightInDrag = true;
      }
      targetScrollRef.current += (diffX + diffY) * dragSpeed;
      targetScrollRef.current = Math.max(
        0,
        Math.min(targetScrollRef.current, maxScroll),
      );
      scrollX.set(targetScrollRef.current);
      startX = currentX;
      startY = currentY;
    };
    const handleEnd = () => {
      isDragging = false;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [activeDetail, isDetailClosing, maxScroll, scrollX]);

  // Mouse follow event
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (!activeDetail && !isDetailSwitching) {
      setDetailChromeColor(settings.themeColor);
    }
  }, [activeDetail, isDetailSwitching, settings.themeColor]);

  useEffect(() => {
    if (
      highlightedGalleryId !== null &&
      !galleryData.some((item) => item.id === highlightedGalleryId)
    ) {
      setHighlightedGalleryId(null);
    }
  }, [galleryData, highlightedGalleryId]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      if (detailSwitchTimeoutRef.current) {
        window.clearTimeout(detailSwitchTimeoutRef.current);
      }
      if (detailChromeColorTimeoutRef.current) {
        window.clearTimeout(detailChromeColorTimeoutRef.current);
      }
    };
  }, []);

  // Loading sequence
  useEffect(() => {
    const t = setTimeout(() => setIsIntroLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Update progress indicator
  useMotionValueEvent(smoothScrollX, 'change', (latest) => {
    if (isAdminLoading || galleryData.length === 0) return;
    if (maxScroll > 0) {
      const ww = typeof window !== 'undefined' ? window.innerWidth : 1000;
      // The first gallery item is perfectly centered when scroll reaches 400vw.
      const galleryStart = ww * 4.0;
      // The last gallery item is perfectly centered taking into account the 100vw Contact Panel
      const galleryEnd = maxScroll - ww * 1.2;

      if (latest < galleryStart) {
        setCurrentSlide(1);
      } else {
        const galleryScrollLength = Math.max(1, galleryEnd - galleryStart);
        const pct = Math.max(
          0,
          Math.min(1, (latest - galleryStart) / galleryScrollLength),
        );
        const index = Math.round(pct * (galleryData.length - 1));
        setCurrentSlide(Math.min(Math.max(1, index + 1), galleryData.length));
      }
    }
  });

  const progressWidth = useTransform(smoothScrollX, (v) => {
    if (maxScroll <= 0) return '0%';
    const pct = Math.max(0, Math.min(100, (v / maxScroll) * 100));
    return `${pct}%`;
  });

  return (
    <div className="w-full h-screen bg-[#141414] text-[#f0f0f0] font-['Inter'] overflow-hidden overscroll-none selection:bg-[#d4af37] selection:text-[#0c0c0c] relative">
      {/* Loading Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-[#141414] z-[9999] flex items-center justify-center transition-opacity duration-700 pointer-events-none',
          isIntroLoading || isAdminLoading ? 'opacity-100' : 'opacity-0',
        )}
      >
        <LoadingWave isActive={isIntroLoading || isAdminLoading} />
      </div>

      {/* Progress Indicator */}
      <div className="hidden md:flex items-center pointer-events-none fixed bottom-12 left-1/2 -translate-x-1/2 z-40">
        <motion.div
          className="flex gap-[8px] items-center justify-center h-[60px]"
          style={{
            opacity: useTransform(smoothScrollX, (v) => {
              const ww =
                typeof window !== 'undefined' ? window.innerWidth : 1000;
              if (maxScroll <= 0) return 0;
              const inStart = ww * 3.6;
              const inEnd = ww * 4.1;
              const outStart = maxScroll - ww * 1.5;
              const outEnd = maxScroll - ww * 0.8;

              if (v < inStart) return 0;
              if (v >= inStart && v < inEnd)
                return (v - inStart) / (inEnd - inStart);
              if (v >= inEnd && v < outStart) return 1;
              if (v >= outStart && v < outEnd)
                return 1 - (v - outStart) / (outEnd - outStart);
              return 0;
            }),
          }}
        >
          {Array.from({ length: 25 }).map((_, i) => {
            const totalBars = 25;
            // 슬라이드 개수와 무관하게 25개의 바 위를 부드럽게 이동하도록 위치 매핑
            const activeIndex = Math.round(
              ((currentSlide - 1) / Math.max(1, galleryData.length - 1)) *
                (totalBars - 1),
            );
            const distance = Math.abs(i - activeIndex);

            // 곡선이 끊기지 않게 영향을 받는 범위 설정
            const curveFactor = Math.max(0, 1 - distance / 5);
            const height = 16 + curveFactor * 24; // 최소 16px ~ 최대 40px
            const yOffset = (1 - curveFactor) * 12; // 중심은 0, 멀어질수록 아래(또는 위)로 이동하여 아치형태 생성
            const isCenter = distance === 0;

            return (
              <div
                key={i}
                className={cn(
                  'w-[1.5px] shrink-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-full',
                  isCenter
                    ? 'bg-theme-primary shadow-[0_0_10px_var(--theme-primary)] z-10'
                    : 'bg-white',
                )}
                style={{
                  height: `${height}px`,
                  transform: `translateY(${yOffset}px)`,
                  opacity: Math.max(0.15, 1 - distance * 0.15),
                }}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Main Wave Gallery (Book-shelf layout + Wave scroll) */}
      <main className="absolute inset-0 flex items-center bg-[#141414] pointer-events-none select-none overflow-hidden perspective-[1200px]">
        <motion.div
          ref={containerRef}
          className="flex items-center h-full pointer-events-auto"
          style={{ x: useTransform(smoothScrollX, (v) => -v) }}
        >
          {/* 1. Typography Principles Landing Pages */}
          <LandingPages
            smoothScrollX={smoothScrollX}
            setIsHovering={setIsHovering}
          />

          {/* 2. Transition Spacer (allows the first gallery item to be centered) */}
          <div className="w-[75vw] md:w-[30vw] shrink-0 bg-[#141414] h-full" />

          {/* 3. Interactive 3D Wave Gallery */}
          <div className="flex items-center gap-[12px] md:gap-[18px] shrink-0 bg-[#141414]">
            {galleryData.map((data, index) => (
              <GalleryItem
                key={data.id}
                data={data}
                index={index}
                smoothScrollX={smoothScrollX}
                smoothVelocity={smoothVelocity}
                isTouchHighlighted={highlightedGalleryId === data.id}
                onOpenDetail={(d) => {
                  openDetail(d);
                }}
                setIsHovering={setIsHovering}
              />
            ))}
          </div>

          {/* 4. Ending Spacer */}
          <div className="w-[75vw] md:w-[40vw] shrink-0 bg-[#141414] h-full" />

          {/* 5. Contact Panel */}
          <ContactPanel
            setIsHovering={setIsHovering}
            smoothScrollX={smoothScrollX}
            maxScroll={maxScroll}
            ww={typeof window !== 'undefined' ? window.innerWidth : 1000}
          />
        </motion.div>
      </main>

      {/* Detailed Page Overlay (Image 1 Style) */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          activeDetail
            ? 'opacity-100 scale-100'
            : 'opacity-0 pointer-events-none scale-105',
        )}
        style={{
          pointerEvents: isDetailChromeOpen ? 'auto' : 'none',
          ...(activeDetail?.textColor
            ? ({
                '--theme-primary': activeDetail.textColor,
              } as React.CSSProperties)
            : {}),
        }}
      >
        <div
          className={cn(
            'absolute inset-0 z-0 transition-[opacity,background-color] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isDetailSurfaceOpen ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            backgroundColor: activeDetail?.bgColor || '#fcfcfc',
            transitionDuration: isDetailSurfaceOpen ? '1200ms' : '700ms',
            transitionDelay: isDetailSurfaceOpen ? '0ms' : '350ms',
          }}
        />

        {/* Large BG Text (Staggered elegant entry) */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-[5]">
          <div
            key={activeDetail?.id}
            className="w-[120vw] text-center leading-[0.8] font-['Anton'] uppercase text-theme-primary flex flex-wrap justify-center content-center select-none"
          >
            {activeDetail?.title.split(' ').map((word: string, i: number) => (
              <div
                key={`${activeDetail.id}-${i}-${word}`}
                className={cn(
                  'mx-[1vw] transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu',
                  isDetailOpen
                    ? 'translate-y-0 opacity-100 blur-0 scale-y-[1.2]'
                    : 'translate-y-[20vh] opacity-0 blur-md scale-y-[1.5]',
                )}
                style={{
                  transitionDelay: isDetailOpen
                    ? `${200 + i * 150}ms`
                    : `${500 - Math.min(i, 4) * 100}ms`,
                }}
              >
                <span className="text-[20vw] md:text-[18vw] block">{word}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Image (Cinematic elegant float) */}
        <div
          key={`image-${activeDetail?.id}`}
          className={cn(
            'relative z-10 max-w-[85vw] md:max-w-[60vw] max-h-[70vh] md:max-h-[75vh] shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform',
            isDetailOpen
              ? 'translate-y-0 opacity-100 scale-100 blur-0'
              : 'translate-y-[15vh] opacity-0 scale-90 blur-0',
          )}
          style={{
            transitionDelay: isDetailOpen ? '800ms' : '0ms',
            transitionDuration: isDetailOpen ? '1500ms' : '850ms',
          }}
        >
          {activeDetail && (
            <div
              className="overflow-hidden flex items-center justify-center [backface-visibility:hidden]"
              style={{ backgroundColor: activeDetail.bgColor || '#fcfcfc' }}
            >
              <img
                src={activeDetail.img}
                alt={activeDetail.title}
                className={cn(
                  'block max-w-[85vw] md:max-w-[50vw] max-h-[70vh] md:max-h-[75vh] w-auto h-auto object-contain transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform [backface-visibility:hidden]',
                  isDetailOpen ? 'scale-100' : 'scale-125',
                )}
                decoding="async"
                style={{ transitionDelay: isDetailOpen ? '200ms' : '0ms' }}
              />
            </div>
          )}
        </div>

        {/* Detail Header Text */}
        <div
          className={cn(
            "absolute top-8 left-8 md:top-12 md:left-12 text-theme-primary font-['Anton'] tracking-[4px] text-xl z-20 transition-[opacity,transform,filter] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            isDetailChromeOpen
              ? 'opacity-100 translate-y-0 blur-0'
              : 'opacity-0 translate-y-0 blur-0',
          )}
          style={{
            color: detailChromeColor,
            transitionDelay: isDetailChromeOpen ? '800ms' : '200ms',
          }}
        >
          LIMDONGWOOK
        </div>

        {/* Detail Close Button */}
        <button
          onClick={triggerCloseDetail}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={cn(
            'absolute top-8 right-8 md:top-12 md:right-12 z-30 text-[10px] md:text-xs tracking-[2px] text-theme-primary font-medium cursor-pointer transition-[opacity,transform,filter] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group',
            isDetailChromeOpen
              ? 'opacity-100 translate-y-0 blur-0'
              : 'opacity-0 translate-y-0 blur-0',
          )}
          style={{
            color: detailChromeColor,
            transitionDelay: isDetailChromeOpen ? '900ms' : '100ms',
          }}
        >
          CLOSE
          <div
            className="absolute -bottom-1 left-0 w-full h-[1px] scale-x-100 origin-right transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-0 group-hover:origin-left"
            style={{ backgroundColor: detailChromeColor }}
          />
        </button>

        {/* Detail Navigation Buttons */}
        <button
          type="button"
          aria-label="Previous gallery detail"
          disabled={!canShowPreviousDetail}
          onClick={() => showAdjacentDetail(-1)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={cn(
            'group absolute -left-2.5 md:left-10 top-1/2 -translate-y-1/2 z-30 size-12 md:size-16 text-theme-primary flex items-center justify-center cursor-pointer transition-[opacity,transform,filter] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/60',
            isDetailChromeOpen
              ? 'opacity-100 translate-x-0 blur-0'
              : 'opacity-0 translate-x-0 blur-0',
            !canShowPreviousDetail && 'opacity-20 pointer-events-none',
          )}
          style={{
            color: detailChromeColor,
            transitionDelay: isDetailChromeOpen ? '950ms' : '80ms',
          }}
        >
          <ChevronLeft
            className="size-6 md:size-8 transition-transform duration-150 ease-out group-hover:-translate-x-1 group-hover:scale-110"
            strokeWidth={1.5}
          />
        </button>

        <button
          type="button"
          aria-label="Next gallery detail"
          disabled={!canShowNextDetail}
          onClick={() => showAdjacentDetail(1)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={cn(
            'group absolute -right-2.5 md:right-10 top-1/2 -translate-y-1/2 z-30 size-12 md:size-16 text-theme-primary flex items-center justify-center cursor-pointer transition-[opacity,transform,filter] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/60',
            isDetailChromeOpen
              ? 'opacity-100 translate-x-0 blur-0'
              : 'opacity-0 translate-x-0 blur-0',
            !canShowNextDetail && 'opacity-20 pointer-events-none',
          )}
          style={{
            color: detailChromeColor,
            transitionDelay: isDetailChromeOpen ? '950ms' : '80ms',
          }}
        >
          <ChevronRight
            className="size-6 md:size-8 transition-transform duration-150 ease-out group-hover:translate-x-1 group-hover:scale-110"
            strokeWidth={1.5}
          />
        </button>

        {/* Detail Bottom Info Blocks */}
        <div
          className={cn(
            'absolute bottom-8 left-8 md:bottom-12 md:left-12 z-20 text-[8px] md:text-[10px] tracking-[2px] text-theme-primary uppercase transition-[opacity,transform,filter] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isDetailChromeOpen
              ? 'opacity-100 translate-y-0 blur-0'
              : 'opacity-0 translate-y-0 blur-0',
          )}
          style={{
            color: detailChromeColor,
            transitionDelay: isDetailChromeOpen ? '1000ms' : '50ms',
          }}
        >
          <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-y-2">
            <span className="opacity-60">TITLE</span>
            <span className="font-medium">{activeDetail?.title}</span>
            <span className="opacity-60">LOCATION</span>
            <span className="font-medium">{activeDetail?.location}</span>
            <span className="opacity-60">DATE</span>
            <span className="font-medium">{activeDetail?.date || '2026'}</span>
          </div>
        </div>

        <div
          className={cn(
            'hidden md:block absolute bottom-8 right-8 md:bottom-12 md:right-12 z-20 text-[8px] md:text-[10px] tracking-[2px] text-theme-primary uppercase transition-[opacity,transform,filter] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] text-right',
            isDetailChromeOpen
              ? 'opacity-100 translate-y-0 blur-0'
              : 'opacity-0 translate-y-0 blur-0',
          )}
          style={{
            color: detailChromeColor,
            transitionDelay: isDetailChromeOpen ? '1100ms' : '0ms',
          }}
        >
          EXPLORE BEHIND-THE-SCENES OF <br />
          THE MAKING OF {activeDetail?.title}.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <RouterProvider router={router} />
    </AdminProvider>
  );
}

import React, { useRef } from 'react';
import { motion, useAnimationFrame, MotionValue } from 'motion/react';

interface GalleryItemProps {
  data: {
    id: number;
    title: string;
    location: string;
    img: string;
  };
  index: number;
  smoothScrollX: MotionValue<number>;
  smoothVelocity: MotionValue<number>;
  onOpenDetail: (data: any) => void;
  setIsHovering: (val: boolean) => void;
}

export function GalleryItem({ data, index, smoothScrollX, smoothVelocity, onOpenDetail, setIsHovering }: GalleryItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isHoveredRef = useRef(false);
  const currentGrayRef = useRef(100);
  const currentTranslateYRef = useRef(0);
  const currentScrollFactorRef = useRef(0);
  
  // Cache layout values to prevent layout thrashing
  const initialXRef = useRef(0);
  const widthRef = useRef(0);

  // Measure initial position once on mount (and on resize)
  React.useEffect(() => {
    const measure = () => {
      if (!itemRef.current) return;
      const rect = itemRef.current.getBoundingClientRect();
      // rect.x is relative to viewport. We add smoothScrollX.get() to get its absolute un-scrolled position.
      initialXRef.current = rect.x + smoothScrollX.get();
      widthRef.current = rect.width;
    };
    
    // Slight delay to ensure DOM is fully painted and fonts loaded
    const timeoutId = setTimeout(measure, 100);
    window.addEventListener('resize', measure);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measure);
    };
  }, [smoothScrollX]);

  // Advanced wave logic based on distance from screen center & scroll velocity
  useAnimationFrame(() => {
    if (!itemRef.current || widthRef.current === 0) return;
    
    const center = window.innerWidth / 2;
    // Calculate current X position purely from cached values and scroll state (ZERO layout reads = 60fps+)
    const currentX = initialXRef.current - smoothScrollX.get();
    const itemCenter = currentX + widthRef.current / 2;
    const dist = itemCenter - center;
    const ratio = dist / center; // -1 to 1 based on screen position

    
    const vel = smoothVelocity.get();
    const absVel = Math.abs(vel);
    
    // 1. 스크롤 상태(0~1) 계산: 위치가 내려가는 속도(Y축)와 색상이 변하는 속도를 완벽하게 일치시키기 위해
    // 멈출 때의 지연(Envelope 여운)을 제거하고 즉각적으로 반응하도록 수정합니다.
    const rawScrollFactor = Math.min(1, absVel / 300);
    if (rawScrollFactor > currentScrollFactorRef.current) {
        currentScrollFactorRef.current += (rawScrollFactor - currentScrollFactorRef.current) * 0.25; 
    } else {
        currentScrollFactorRef.current = rawScrollFactor; // 멈출 땐 즉시 타겟값 적용 (이후 0.3 Lerp로 Y축과 동일하게 보간됨)
    }
    const smoothScrollingFactor = currentScrollFactorRef.current;
    
    // 중앙에 가까울수록 1, 멀어질수록 0이 되는 값
    const centerProximity = Math.pow(Math.max(0, 1 - Math.abs(ratio)), 2);
    
    // 관성 및 탄성으로 인한 회전(비스듬해지는) 효과 (회전 강도: 기존의 2배로 조정)
    let rotateY = vel * 0.04 * centerProximity;
    rotateY = Math.max(-50, Math.min(50, rotateY));
    
    // 중앙에 올 때 약간 팝업되는 효과만 유지하고, 스크롤 시 Z축으로 밀려나며 작아지는 효과 제거
    const z = centerProximity * 50;
    
    // 중앙에서 멀어질수록 투명도 감소
    const opacity = Math.max(0.3, 1 - (Math.abs(ratio) * 0.5));
    
    // Vertical curve: 스크롤 '속도' 자체를 직접적으로 반영하여 솟아오르는 진폭 계산
    // 느린 속도에서는 잔잔하게 유지하되, '중간 속도'에서 조금 더 자연스럽게 솟아오르도록 지수 곡선 적용
    let popUpAmplitude = 0;
    if (absVel < 700) {
        // 느린~중간 스크롤 (속도 0~700): 곡선을 사용하여 아주 느릴땐 억제하고, 중간 속도에서 서서히 최대 24px까지 도달
        const t = absVel / 700;
        popUpAmplitude = Math.pow(t, 1.5) * 24; 
    } else {
        // 강한 스크롤 (속도 700 초과): 초과된 속도에 비례해 확 솟아오름 (최대 120px 제한)
        const overSpeed = absVel - 700;
        popUpAmplitude = Math.min(120, 24 + (overSpeed * 0.1)); 
    }
    
    // 진폭(popUpAmplitude)에 멈춤 감지 팩터(smoothScrollingFactor)를 곱해서, 멈추면 무조건 0으로 스르르 떨어지게 함
    const targetY = -popUpAmplitude * centerProximity * smoothScrollingFactor;
    
    // 자연스러운 움직임을 위해 수동 보간(Lerp) 적용
    // 목표값(targetY) 자체가 이미 부드럽게 변하므로, 여기서는 목표값을 조금 더 충실하게 따라가게 설정
    currentTranslateYRef.current += (targetY - currentTranslateYRef.current) * 0.3;
    
    // Height: 화면 중앙에서 60% 지점까지만 크기가 커지고, 그 외곽은 모두 동일한 기본 크기로 고정
    // 범위를 55% -> 60%로 아주 살짝만 더 넓혀 경사도를 낮추고 더 완만하게 떨어지도록 유도
    const heightProximity = Math.max(0, 1 - Math.abs(ratio) / 0.6); 
    // 최고급 애니메이션에 쓰이는 Smootherstep (Ken Perlin) 곡선 적용: 가속도(2차 미분)까지 부드럽게 연결되어 이질감이 전혀 없음
    const smoothFactor = heightProximity * heightProximity * heightProximity * (heightProximity * (heightProximity * 6 - 15) + 10);
    const heightPercent = 80 + (40 * smoothFactor); // 80% ~ 120% 사이 조절
    
    // Z-index: center item should be on top
    const zIndex = Math.round(100 - Math.abs(ratio) * 100);
    
    itemRef.current.style.transform = `perspective(1200px) translateZ(${z}px) rotateY(${rotateY}deg) translateY(${currentTranslateYRef.current}px)`;
    itemRef.current.style.height = `${heightPercent}%`;
    itemRef.current.style.opacity = `${opacity}`;
    itemRef.current.style.zIndex = `${zIndex}`;

    // Dynamic grayscale & contrast for center proximity, hover, and scroll velocity
    // 거리에 따른 기본 흑백값 계산
    const baseGray = Math.max(0, Math.min(100, (Math.abs(ratio) - 0.1) * 500));
    
    // 스크롤이 멈춰있으면 무조건 100(흑백), 스크롤 중이면 거리에 따른 색상 적용 (smoothScrollingFactor는 이제 최대 1임)
    let targetGray = 100 - ((100 - baseGray) * smoothScrollingFactor);
    
    // 호버 시에도 여전히 컬러를 보고 싶다면 아래 로직 유지, 원치 않으면 삭제 가능
    // 현재�� 사용자가 '스크롤 멈추면 흑백으로' 요청했으므로, 우선 위치와 스크롤에 기반한 로직을 주로 반영
    if (isHoveredRef.current) {
        targetGray = 0;
    }
    
    // 부드러운 전환 효과를 위해 수동 보간(Lerp) 적용 (색상 전환 속도를 위치 변화 보간 속도인 0.3과 완벽하게 동일하게 맞춥니다)
    currentGrayRef.current += (targetGray - currentGrayRef.current) * 0.3;
    const currentContrast = 1 + (currentGrayRef.current / 100) * 0.15; // 1 to 1.15
    const currentBrightness = 1 - (currentGrayRef.current / 100) * 0.5; // 1 to 0.5 (흑백일 때 50% 더 어둡게)

    if (imgRef.current) {
        imgRef.current.style.filter = `grayscale(${currentGrayRef.current}%) contrast(${currentContrast}) brightness(${currentBrightness})`;
    }
  });

  return (
    <div 
      className="relative shrink-0 flex items-end justify-center cursor-pointer group w-[55px] md:w-[85px] h-[220px] md:h-[340px] transition-all duration-300 ease-out"
      onClick={() => onOpenDetail(data)}
      onMouseEnter={() => { setIsHovering(true); isHoveredRef.current = true; }}
      onMouseLeave={() => { setIsHovering(false); isHoveredRef.current = false; }}
    >
      <div 
        ref={itemRef} 
        className="absolute bottom-0 w-full h-full will-change-transform overflow-hidden rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-shadow duration-300" 
        style={{ transformStyle: 'preserve-3d' }}
      >
        <img 
          ref={imgRef}
          src={data.img} 
          alt={data.title} 
          className="w-full h-full object-cover bg-zinc-900" 
          draggable={false}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop";
          }}
        />
        
        {/* Hover Overlay & Vertical Text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
           {/* absolute와 origin-left를 활용해 텍스트를 하단에 고정하고 위로 뻗어나가게 세로로 배치합니다. bottom-2에서 bottom-0으로 수정해 아주 조금 더 아래로 내렸습니다. */}
           <div className="absolute bottom-0 left-1/2 origin-left -rotate-90 flex flex-col items-center translate-y-6 group-hover:translate-y-0 transition-transform duration-300 ease-out">
             <span className="text-white font-['Anton'] text-xl md:text-2xl tracking-[4px] uppercase whitespace-nowrap drop-shadow-md">{data.title}</span>
             <span className="text-[#d4af37] text-[8px] md:text-[10px] font-medium tracking-[3px] uppercase whitespace-nowrap mt-1 drop-shadow-md">{data.location}</span>
           </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { motion, useSpring, useTransform, MotionValue } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router';
import { useAdmin } from '../context/AdminContext';
import contactMe1Img from '../../imports/contact_me_1.jpg';
import contactMe2Img from '../../imports/contact_me_2.jpg';
import contactMe3Img from '../../imports/contact_me_3.jpeg';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const wordGroups = [
  { chars: ['C', 'O', 'N'], img: contactMe1Img, meaning: '= TOGETHER' },
  { chars: ['T', 'A', 'C', 'T'], img: contactMe2Img, meaning: '= TOUCH (YOUR PROJECT)' },
  { chars: ['\u00A0'], img: '' },
  { chars: ['M', 'E'], img: contactMe3Img, meaning: '= (WITH) LIMDONGWOOK' },
];

interface ContactPanelProps {
  setIsHovering: (val: boolean) => void;
  smoothScrollX: MotionValue<number>;
  maxScroll: number;
  ww: number;
}

export function ContactPanel({ setIsHovering, smoothScrollX, maxScroll, ww }: ContactPanelProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { settings } = useAdmin();

  const mouseX = useSpring(0, { damping: 50, stiffness: 400 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
  };

  const textX = useTransform(smoothScrollX, (v) => {
    if (maxScroll <= 0) return 0;
    const start = maxScroll - ww;
    const end = maxScroll;
    if (v < start) return ww * 0.2;
    if (v > end) return 0;
    const progress = (v - start) / (end - start);
    return ww * 0.2 * (1 - progress);
  });

  return (
    <section
      ref={containerRef}
      className="w-[100vw] h-full shrink-0 bg-[#e5e5e5] flex flex-col items-center justify-start relative overflow-hidden z-40 ring-2 ring-[#e5e5e5]"
      onMouseMove={handleMouseMove}
    >
      {/* Floating Images Container (Below Text) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {wordGroups.map((group, i) => {
          if (!group.img) return null;
          const isHovered = hoveredIndex === i;
          return (
            <motion.img
              key={i}
              src={group.img}
              alt=""
              className={cn(
                "absolute bottom-[2vh] md:bottom-[10vh] left-0 h-auto rounded-sm shadow-[0_30px_60px_rgba(0,0,0,0.3)] origin-bottom",
                i === 3 ? "w-[30vw] md:w-[21vw]" : "w-[40vw] md:w-[30vw]"
              )}
              style={{
                x: mouseX,
                translateX: '-50%',
              }}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{
                scale: isHovered ? 1 : 0.8,
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 50,
                rotate: isHovered ? (i % 2 === 0 ? 3 : -3) : 0
              }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            />
          );
        })}
      </div>

      {/* Typography */}
      <motion.div
        className="relative z-20 flex items-center justify-center w-full pt-[16vh] md:pt-[20vh] pointer-events-none"
        style={{ x: textX }}
      >
        <div className="flex justify-center items-center -mt-[2vh] md:-mt-[7vh]">
          {wordGroups.map((group, i) => {
            const isHovered = hoveredIndex === i;
            const isSpace = group.chars[0] === '\u00A0';
            return (
              <div key={i} className="relative flex justify-center">
                {/* Meaning Text (Appears when hovered) */}
                {group.meaning && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      y: isHovered ? 0 : 20,
                      scale: isHovered ? 1 : 0.95
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <span className="text-[#111] font-['Inter'] text-xs md:text-sm tracking-[2px] opacity-60 uppercase whitespace-nowrap">
                      {group.meaning}
                    </span>
                  </motion.div>
                )}

                {/* Main Letters (Drops down when hovered) */}
                <motion.div
                  className="flex cursor-pointer pointer-events-auto relative z-10"
                  onMouseEnter={() => { if (!isSpace) { setHoveredIndex(i); setIsHovering(true); } }}
                  onMouseLeave={() => { if (!isSpace) { setHoveredIndex(null); setIsHovering(false); } }}
                  animate={{
                    y: isHovered && !isSpace ? '10vw' : 0,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                >
                  {group.chars.map((char, charIdx) => (
                    <span
                      key={charIdx}
                      className={cn(
                        "text-[12vw] md:text-[14vw] leading-[1]",
                        isSpace ? "w-[4vw]" : "mx-[0.2vw]"
                      )}
                      style={{
                        fontFamily: '"Playfair Display", serif',
                        color: '#111',
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Header / Contact Details */}
      <motion.div
        className="absolute top-8 left-8 right-8 md:top-12 md:left-12 md:right-12 z-20 flex justify-between items-start pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex gap-16 md:gap-32 items-start">
          {/* SAY HI */}
          <div className="flex flex-col gap-2">
            <span className="text-[#111] font-['Inter'] text-[10px] md:text-xs tracking-[1px] opacity-50 uppercase">SAY HI!</span>
            <a href={`mailto:${settings.contactEmail}`} className="text-[#111] font-['Inter'] text-[10px] md:text-sm font-medium tracking-[1px] uppercase pointer-events-auto hover:text-theme-primary transition-colors">{settings.contactEmail}</a>
          </div>

          {/* FOLLOW US */}
          <div className="hidden md:flex flex-col gap-2">
            <span className="text-[#111] font-['Inter'] text-[10px] md:text-xs tracking-[1px] opacity-50 uppercase">FOLLOW ME:</span>
            <div className="flex gap-4 lg:gap-6 text-[#111] font-['Inter'] text-[10px] md:text-sm font-medium tracking-[1px] uppercase pointer-events-auto">
              <a href="#" className="hover:text-theme-primary transition-colors">INSTAGRAM</a>
              <a href="#" className="hover:text-theme-primary transition-colors">KAKAOTALK</a>
              <a href="#" className="hover:text-theme-primary transition-colors">GITHUB</a>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="flex flex-col gap-2 text-right md:text-left">
          <span className="text-[#111] font-['Inter'] text-[10px] md:text-xs tracking-[1px] opacity-50 uppercase">COPYRIGHT:</span>
          <span
            className="text-[#111] font-['Inter'] text-[10px] md:text-sm font-medium tracking-[1px] uppercase pointer-events-auto whitespace-nowrap"
            onClick={() => navigate('/admin')}
          >
            {settings.contactCopyright}
          </span>
        </div>
      </motion.div>
    </section>
  );
}

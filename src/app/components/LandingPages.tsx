import React, { useEffect, useState } from 'react';
import { motion, MotionValue, useTransform } from 'motion/react';
import intro1Img from '../../imports/intro_1.jpg';
import intro2Img from '../../imports/intro_2.jpg';
import aboutMeImg from '../../imports/about_me.jpeg';
import gallery1Img from '../../imports/gallery_1.jpg';
import gallery2Img from '../../imports/gallery_2.jpg';

interface LandingPagesProps {
  smoothScrollX: MotionValue<number>;
  setIsHovering: (val: boolean) => void;
}

export function LandingPages({
  smoothScrollX,
  setIsHovering,
}: LandingPagesProps) {
  const [ww, setWw] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1000,
  );

  useEffect(() => {
    setWw(window.innerWidth);
    const handleResize = () => setWw(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Panel 1 Parallax
  const p1TextX = useTransform(smoothScrollX, [0, ww], [0, ww * 0.2]);
  const p1SubTextX = useTransform(smoothScrollX, [0, ww], [0, ww * -0.2]);
  const p1ImgX = useTransform(smoothScrollX, [0, ww], [0, ww * -0.1]);

  // Combined Panel 2 & 3 Parallax (Span across 200vw)
  // Background text now has a longer range to seamlessly parallax across the joined panel
  const p2Title1X = useTransform(
    smoothScrollX,
    [0, ww, ww * 3],
    [ww * -0.2, 0, ww * 0.2],
  );
  const p2Title2X = useTransform(
    smoothScrollX,
    [0, ww, ww * 3],
    [ww * -0.4, 0, ww * 0.4],
  );

  // Elements in the first half (0 ~ 100vw)
  const p2TextX = useTransform(
    smoothScrollX,
    [0, ww, ww * 2],
    [ww * 0.3, 0, ww * -0.3],
  );
  const p2ImgX = useTransform(
    smoothScrollX,
    [0, ww, ww * 2],
    [ww * -0.05, 0, ww * 0.05],
  );

  // Curved image trajectory
  const curveImgY = useTransform(
    smoothScrollX,
    [0, ww, ww * 2, ww * 3],
    ['70vh', '15vh', '-20vh', '-60vh'],
  );
  const curveImgX = useTransform(
    smoothScrollX,
    [0, ww, ww * 2, ww * 3],
    ['-10vw', '15vw', '5vw', '-15vw'],
  );
  const curveImgRotate = useTransform(
    smoothScrollX,
    [0, ww, ww * 2, ww * 3],
    [-15, 5, -5, -15],
  );

  // Elements in the second half (100vw ~ 200vw)
  const p3Text1X = useTransform(
    smoothScrollX,
    [ww, ww * 2, ww * 3],
    [ww * 0.1, 0, ww * -0.1],
  );
  const p3Text2X = useTransform(
    smoothScrollX,
    [ww, ww * 2, ww * 3],
    [ww * -0.1, 0, ww * 0.1],
  );
  const p3HugeX = useTransform(
    smoothScrollX,
    [ww, ww * 2, ww * 3],
    [ww * -0.5, 0, ww * 0.5],
  );

  // Panel 4 Parallax (Now starts at ww * 3 because previous panel takes 200vw)
  const p4SectionY = useTransform(
    smoothScrollX,
    [ww * 2, ww * 3],
    ['100vh', '0vh'],
  );
  const p4SectionX = useTransform(smoothScrollX, [ww * 2, ww * 3], [-ww, 0]);
  const p23SectionX = useTransform(smoothScrollX, [ww * 2, ww * 3], [0, ww]);
  const p4Img1X = useTransform(
    smoothScrollX,
    [ww * 3, ww * 4, ww * 5],
    [ww * 0.2, 0, ww * -0.2],
  );
  const p4Img2X = useTransform(
    smoothScrollX,
    [ww * 3, ww * 4, ww * 5],
    [ww * -0.2, 0, ww * 0.2],
  );

  return (
    <div className="flex h-full shrink-0 items-center">
      {/* Panel 1 */}
      <section className="w-[100vw] h-full relative flex items-center justify-center shrink-0 bg-[#000000] text-white overflow-hidden">
        {/* Top Text - Slides down from top */}
        <motion.h1
          className="uppercase text-[clamp(4rem,17vw,25rem)] leading-[0.85] tracking-[-0.03em] absolute top-[10%] md:top-[8%] left-[4vw] z-10 pointer-events-none"
          style={{ x: p1TextX, fontFamily: '"Anton", sans-serif' }}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.3 }}
        >
          WEB DEVELOPER
        </motion.h1>

        {/* Left Image Box - Slides in from left */}
        <motion.div
          className="absolute left-[5vw] md:left-[3vw] top-[19%] md:top-[max(32%,8vh_+_15vw)] z-20"
          style={{ x: p1ImgX }}
        >
          <motion.div
            className="w-[70vw] md:w-[26vw] overflow-hidden"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.5 }}
          >
            <img
              src={intro1Img}
              className="w-full h-auto shadow-2xl"
              alt="Book Mockup"
            />
          </motion.div>
        </motion.div>

        {/* Middle Texts - Slides up from bottom */}
        <motion.div
          className="absolute left-[4vw] md:left-[32vw] top-[45%] md:top-[max(32%,8vh_+_15vw)] w-[90vw] md:w-[20vw] z-20 font-['Inter'] text-xs md:text-[14px] leading-[1.4] text-[#e0e0e0] pointer-events-none"
          style={{ x: p1SubTextX }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.7 }}
        >
          <p className="mb-6">
            Like film photography,
            <br />
            this space captures moments
            <br />
            as you move through it.
            <br />
            Each scroll reveals a new frame,
            <br />
            shaped by timing, motion, and detail.
          </p>
          <p>
            Like memories, these moments
            <br />
            don’t just appear, but stay —<br />
            where design and code come together
            <br />
            to linger in your memory
          </p>
        </motion.div>

        {/* Bottom Chapters List - Slides up from bottom */}
        <motion.div
          className="absolute left-[4vw] md:left-[32vw] top-[80%] md:top-[max(65%,8vh_+_15vw_+_20vh)] z-20 font-['Inter'] text-xs md:text-[14px] leading-[1.4] text-[#e0e0e0] pointer-events-none"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.8 }}
        >
          <p className="text-[#888] mb-1">Chapters:</p>
          <ul className="flex flex-col">
            <li>Intro.</li>
            <li>About me</li>
            <li>Gallery</li>
            <li>Contact me</li>
          </ul>
        </motion.div>

        {/* Right Scroll Indicator - Slides in from right */}
        <motion.div
          className="absolute right-[4vw] bottom-[8%] flex items-center gap-2 z-20"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.9 }}
        >
          <div className="w-[35px] h-[35px] md:w-[60px] md:h-[60px] rounded-full bg-theme-primary flex items-center justify-center -mr-2 translate-y-2 md:translate-y-4">
            <motion.svg
              className="w-[16px] h-[16px] md:w-[20px] md:h-[20px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ x: [0, 5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'easeInOut',
              }}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </motion.svg>
          </div>
          <span
            className="font-['Inter'] text-[50px] md:text-[90px] tracking-[-0.05em] leading-none lowercase"
            style={{ fontFamily: '"Oswald", sans-serif' }}
          >
            scroll
          </span>
        </motion.div>

        {/* Right Edge Image - Slides in from right */}
        <motion.div
          className="absolute right-[-5vw] top-[73%] md:top-[max(60%,12vh_+_16vw)] z-10"
          style={{ x: p1ImgX }}
        >
          <motion.img
            src={intro2Img}
            alt=""
            className="w-[35vw] md:w-[18vw] h-auto object-cover shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] cursor-pointer"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 2.0 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          />
        </motion.div>
      </section>

      {/* Combined Panel 2 & 3 (Width: 200vw) */}
      <motion.section
        className="w-[200vw] h-full relative shrink-0 bg-[#e5e5e5] text-[#111] overflow-hidden"
        style={{ x: p23SectionX }}
      >
        {/* Background Huge Text - Spanning seamlessly across the 200vw boundary */}
        <div className="absolute inset-0 flex flex-col justify-center items-start pl-[10vw] z-10 pointer-events-none">
          <motion.h2
            className="text-[clamp(6rem,15vw,25rem)] leading-[0.9] tracking-[-0.05em] whitespace-nowrap"
            style={{ x: p2Title1X, fontFamily: '"Playfair Display", serif' }}
          >
            LIM,
          </motion.h2>
          <motion.h2
            className="text-[clamp(6rem,15vw,25rem)] leading-[0.9] tracking-[-0.05em] ml-[20vw] md:ml-[30vw] whitespace-nowrap"
            style={{ x: p2Title2X, fontFamily: '"Playfair Display", serif' }}
          >
            DONGWOOK
          </motion.h2>
        </div>

        {/* Curved Animation Image */}
        <motion.img
          src={aboutMeImg}
          alt="Curved scroll image"
          className="absolute left-[35vw] md:left-[45vw] top-0 w-[45vw] md:w-[19vw] aspect-[3/4] object-cover shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-20 cursor-pointer"
          style={{ x: curveImgX, y: curveImgY, rotate: curveImgRotate }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        />

        {/* Elements from Original Panel 2 (Positioned 0vw ~ 100vw) */}
        <motion.div
          className="absolute left-[64vw] md:left-[75vw] top-[20%] md:top-[30%] size-[clamp(180px,40vw,240px)] md:size-[clamp(232px,21vw,312px)] xl:size-[clamp(190px,16vw,260px)] z-30 font-['Inter'] text-[10.5px] sm:text-[11.5px] md:text-xs leading-tight md:leading-relaxed text-center bg-white rounded-full px-7 py-8 md:p-8 flex flex-col justify-center cursor-pointer shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2)]"
          style={{ x: p2TextX }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <span className="font-bold mb-2 block text-center">(01)</span>I am a
          web developer with a background in architecture, where I developed a
          strong sense of structure, space, and visual balance.
        </motion.div>

        {/* Elements from Original Panel 3 (Positioned 100vw ~ 200vw) */}
        <motion.div
          className="absolute top-[20%] left-[110vw] w-[35vw] md:w-[20vw] z-20 font-['Inter'] text-[10px] md:text-sm leading-relaxed"
          style={{ x: p3Text1X }}
        >
          <span className="font-bold mb-1 block">(02)</span>I enjoy creating
          interactive web experiences that invite users to move through
          typography, motion, and visual details as if they were exploring a
          carefully designed space.
        </motion.div>

        <motion.div
          className="absolute top-[35%] md:top-[20%] right-[10vw] md:right-[15vw] w-[35vw] md:w-[20vw] z-20 font-['Inter'] text-[10px] md:text-sm leading-relaxed"
          style={{ x: p3Text2X }}
        >
          <span className="font-bold mb-1 block">(03)</span>
          My work focuses on connecting design and code to build digital moments
          that feel intentional, memorable, and quietly immersive beyond the
          surface of the screen.
        </motion.div>

        <motion.div
          className="absolute bottom-13 left-[90vw] w-full whitespace-nowrap z-10 pointer-events-none"
          style={{ x: p3HugeX }}
        >
          <h2
            className="text-[clamp(4rem,13vw,20rem)] leading-[0.8] tracking-[-0.02em] translate-x-[-10vw] md:translate-x-[-30vw]"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            MARCH 29, 1993 &mdash;
          </h2>
        </motion.div>
      </motion.section>

      {/* Panel 4 */}
      <motion.section
        className="w-[100vw] h-full relative flex items-center justify-center shrink-0 text-white overflow-hidden bg-[#0c0c0c] z-30 ring-2 ring-[#0c0c0c]"
        style={{ x: p4SectionX, y: p4SectionY }}
      >
        <h1
          className="uppercase text-[clamp(8rem,20vw,30rem)] leading-[0.8] tracking-[-0.02em] absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-20 mix-blend-difference pointer-events-none"
          style={{ fontFamily: '"Anton", sans-serif' }}
        >
          Gallery
        </h1>

        <motion.img
          src={gallery1Img}
          alt=""
          className="absolute w-[35vw] md:w-[15vw] left-[10%] md:left-[15%] top-[20%] z-10 object-cover shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] cursor-pointer"
          style={{ x: p4Img1X }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        />

        <motion.img
          src={gallery2Img}
          alt=""
          className="absolute w-[40vw] md:w-[23vw] right-[5%] md:right-[10%] bottom-[20%] z-10 object-cover shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] cursor-pointer"
          style={{ x: p4Img2X }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        />
      </motion.section>

      {/* End of Exhibition -> Bridging to Gallery */}
    </div>
  );
}

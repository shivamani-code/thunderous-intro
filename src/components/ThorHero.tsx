import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ThorHero = () => {
  const [revealed, setRevealed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thorRef = useRef<HTMLImageElement>(null);
  const textLayerRef = useRef<HTMLImageElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSummon = useCallback(() => {
    if (revealed) return;
    setRevealed(true);

    // Play audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    const tl = gsap.timeline();

    // Flash
    tl.set(flashRef.current, { opacity: 1 })
      .to(flashRef.current, { opacity: 0, duration: 0.15, ease: "power2.out" });

    // Shake
    tl.to(containerRef.current, {
      keyframes: [
        { x: -8, y: 4, duration: 0.05 },
        { x: 6, y: -6, duration: 0.05 },
        { x: -4, y: 8, duration: 0.05 },
        { x: 8, y: -4, duration: 0.05 },
        { x: -6, y: -6, duration: 0.05 },
        { x: 4, y: 6, duration: 0.05 },
        { x: -8, y: -4, duration: 0.05 },
        { x: 6, y: 8, duration: 0.05 },
        { x: 0, y: 0, duration: 0.05 },
      ],
      ease: "none",
    }, 0);

    // Reveal — fade overlay, scale in Thor, fade text
    tl.to(overlayRef.current, { opacity: 0, duration: 0.8, ease: "power2.out" }, 0.15)
      .fromTo(thorRef.current, { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "power3.out" }, 0.2)
      .fromTo(textLayerRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 0.12, duration: 1.2, ease: "power2.out" }, 0.3)
      .fromTo(uiRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.6);

    // Setup scroll parallax after reveal
    tl.call(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        animation: gsap.timeline()
          .to(thorRef.current, { y: -200, ease: "none" }, 0)
          .to(textLayerRef.current, { y: 100, ease: "none" }, 0),
      });
    });
  }, [revealed]);

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[200vh]">
      {/* Audio */}
      <video ref={audioRef as any} src="/assets/thunder.mp4" className="hidden" playsInline preload="auto" />

      {/* Flash overlay */}
      <div
        ref={flashRef}
        className="fixed inset-0 z-[100] pointer-events-none opacity-0"
        style={{ background: "radial-gradient(circle, hsl(210 100% 95%), hsl(210 80% 70%))" }}
      />

      {/* Black overlay / summon screen */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[90] flex items-center justify-center cursor-pointer"
        style={{ background: "hsl(0 0% 0%)" }}
        onClick={handleSummon}
      >
        <p
          className="text-xs md:text-sm uppercase tracking-[0.3em] text-foreground select-none"
          style={{ animation: "pulse-summon 2s ease-in-out infinite" }}
        >
          Click to Summon the God of Thunder
        </p>
      </div>

      {/* Hero section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center sticky top-0">
        {/* BG gradient */}
        <div className="absolute inset-0 z-0" style={{
          background: "radial-gradient(ellipse at 50% 80%, hsl(210 60% 8%) 0%, hsl(220 20% 4%) 60%, hsl(0 0% 0%) 100%)"
        }} />

        {/* Layer 1: Background text */}
        <img
          ref={textLayerRef}
          src="/assets/text_layer.png"
          alt=""
          className="absolute z-10 w-[90vw] max-w-[1200px] opacity-0 select-none pointer-events-none object-contain"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />

        {/* Layer 2: Thor character */}
        <img
          ref={thorRef}
          src="/assets/thor.png"
          alt="Thor - God of Thunder"
          className="absolute z-20 h-[70vh] md:h-[85vh] object-contain opacity-0 thunder-glow select-none"
          style={{ bottom: "0", left: "50%", transform: "translateX(-50%)" }}
        />

        {/* Layer 3: UI Elements */}
        <div ref={uiRef} className="absolute inset-0 z-30 pointer-events-none opacity-0">
          {/* Logo */}
          <div className="absolute top-8 left-8 md:top-12 md:left-12">
            <span className="text-foreground text-lg md:text-xl font-light tracking-[0.2em] uppercase">
              Cine <span className="font-bold">Daily</span>
            </span>
          </div>

          {/* Movie info */}
          <div className="absolute bottom-12 left-8 md:bottom-16 md:left-12 max-w-xs">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] mb-2">Marvel Studios</p>
            <h1 className="text-foreground text-2xl md:text-4xl font-bold leading-tight mb-4">
              God of Thunder<br />
              <span className="font-light text-lg md:text-2xl">Part A</span>
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-6">
              Witness the most powerful Avenger rise. A cinematic journey across the nine realms.
            </p>
            <button className="pointer-events-auto px-8 py-3 bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
              Book Now
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 right-8 md:bottom-16 md:right-12 flex flex-col items-center gap-2">
            <span className="text-muted-foreground text-xs uppercase tracking-widest" style={{ writingMode: "vertical-rl" }}>
              Scroll
            </span>
            <div className="w-px h-12 bg-muted-foreground/30 relative overflow-hidden">
              <div className="w-full h-4 bg-foreground absolute animate-[slide-down_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for scroll */}
      <section className="h-screen" />
    </div>
  );
};

export default ThorHero;

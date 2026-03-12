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
  const audioRef = useRef<HTMLVideoElement>(null);

  const handleSummon = useCallback(() => {
    if (revealed) return;
    setRevealed(true);

    const tl = gsap.timeline();

    // === PHASE 1: THE STRIKE ===
    // Show the lightning overlay immediately
    tl.set(flashRef.current, { display: "block", opacity: 0 });

    // Strobe: 0 -> 1 -> 0.3 -> 1 -> 0 over ~400ms
    // Audio fires at the exact moment first strobe hits opacity: 1
    tl.to(flashRef.current, {
      opacity: 1,
      duration: 0.06,
      ease: "power2.in",
      onComplete: () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      },
    })
      .to(flashRef.current, { opacity: 0.3, duration: 0.08, ease: "none" })
      .to(flashRef.current, { opacity: 1, duration: 0.06, ease: "none" })
      .to(flashRef.current, { opacity: 0, duration: 0.2, ease: "power2.out" });

    // Violent shake on the root container — concurrent with strobes
    tl.to(
      containerRef.current,
      {
        x: "random(-20, 20)",
        y: "random(-20, 20)",
        duration: 0.05,
        repeat: 10,
        yoyo: true,
        ease: "none",
      },
      0
    );
    // Reset position after shake
    tl.set(containerRef.current, { x: 0, y: 0 });

    // === PHASE 2: SEQUENTIAL REVEAL (after strobe finishes ~0.4s) ===
    // Fade out black overlay
    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    }, 0.35);

    // Text appears FIRST — blur-to-clear at 12% opacity
    tl.fromTo(
      textLayerRef.current,
      { opacity: 0, filter: "blur(24px)", scale: 0.85 },
      { opacity: 0.12, filter: "blur(0px)", scale: 1, duration: 1.2, ease: "power2.out" },
      0.45
    );

    // Thor slides in from bottom AFTER text starts
    tl.fromTo(
      thorRef.current,
      { opacity: 0, y: 120, scale: 0.5 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out" },
      0.7
    );

    // UI elements last
    tl.fromTo(
      uiRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
      1.1
    );

    // === PHASE 3: Parallax scroll ===
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
      <video ref={audioRef} src="/assets/thunder-2.mp4" className="hidden" playsInline preload="auto" />

      {/* Lightning overlay — highest z-index, hidden by default */}
      <div
        ref={flashRef}
        className="fixed inset-0 z-[100] pointer-events-none"
        style={{
          display: "none",
          opacity: 0,
          background: "radial-gradient(circle, hsl(210 100% 95%), hsl(210 80% 70%))",
        }}
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
        <div className="absolute inset-0 z-0" style={{
          background: "radial-gradient(ellipse at 50% 80%, hsl(210 60% 8%) 0%, hsl(220 20% 4%) 60%, hsl(0 0% 0%) 100%)"
        }} />

        {/* Layer 1 (Z-10): Background text */}
        <img
          ref={textLayerRef}
          src="/assets/text_layer.png"
          alt=""
          className="absolute z-10 w-[90vw] max-w-[1200px] opacity-0 select-none pointer-events-none object-contain"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />

        {/* Layer 2 (Z-20): Thor character */}
        <img
          ref={thorRef}
          src="/assets/thor.png"
          alt="Thor - God of Thunder"
          className="absolute z-20 h-[70vh] md:h-[85vh] object-contain opacity-0 thunder-glow select-none"
          style={{ bottom: "0", left: "50%", transform: "translateX(-50%)" }}
        />

        {/* Layer 3 (Z-30): UI Elements */}
        <div ref={uiRef} className="absolute inset-0 z-30 pointer-events-none opacity-0">
          <div className="absolute top-8 left-8 md:top-12 md:left-12">
            <span className="text-foreground text-lg md:text-xl font-light tracking-[0.2em] uppercase">
              Cine <span className="font-bold">Daily</span>
            </span>
          </div>

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

      <section className="h-screen" />
    </div>
  );
};

export default ThorHero;

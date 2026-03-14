import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LightningArcs from "./LightningArcs";

gsap.registerPlugin(ScrollTrigger);

const ThorHero = () => {
  const [revealed, setRevealed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lightningRef = useRef<HTMLDivElement>(null);
  const lightningVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thorRef = useRef<HTMLImageElement>(null);
  const textLayerRef = useRef<HTMLImageElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLVideoElement>(null);

  const hideLightningOverlay = useCallback(() => {
    if (!lightningRef.current) return;

    gsap.to(lightningRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        if (lightningRef.current) lightningRef.current.style.display = "none";
      },
    });
  }, []);

  const handleSummon = useCallback(() => {
    if (revealed) return;
    setRevealed(true);

    const tl = gsap.timeline();

    // Show thunder overlay + play both video and audio simultaneously
    tl.set(lightningRef.current, { display: "block", opacity: 1 });
    tl.call(() => {
      if (lightningVideoRef.current) {
        lightningVideoRef.current.currentTime = 0;
        lightningVideoRef.current.onended = hideLightningOverlay;
        lightningVideoRef.current.play().catch(() => {});
      }
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    });

    // At ~500ms — violent shake (the "impact" moment)
    tl.to(
      containerRef.current,
      {
        x: "random(-20, 20)",
        y: "random(-20, 20)",
        duration: 0.05,
        repeat: 12,
        yoyo: true,
        ease: "none",
      },
      0.5
    );
    tl.set(containerRef.current, { x: 0, y: 0 }, 1.2);

    // Fade out black summon overlay immediately so thunder video is visible
    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
      },
      0
    );

    // Fade thunder video out before character reveal
    tl.to(
      lightningRef.current,
      {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      },
      1.2
    );

    // === REVEAL — right as thunder starts fading ===
    tl.fromTo(
      textLayerRef.current,
      { opacity: 0, filter: "blur(24px)", scale: 0.85 },
      { opacity: 0.12, filter: "blur(0px)", scale: 1, duration: 1.2, ease: "power2.out" },
      1.2
    );

    tl.fromTo(
      thorRef.current,
      { opacity: 0, scale: 1.2, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power4.out" },
      1.3
    );

    tl.fromTo(
      uiRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
      1.75
    );

    // Safety cleanup if video end event doesn't fire in a browser
    tl.call(() => hideLightningOverlay(), [], 2.2);

    // Setup parallax scroll
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
  }, [hideLightningOverlay, revealed]);

  useEffect(() => {
    return () => {
      if (lightningVideoRef.current) lightningVideoRef.current.onended = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[200vh]">
      {/* Thunder audio */}
      <video ref={audioRef} src="/assets/thunder-2.mp4" className="hidden" playsInline preload="auto" />

      {/* Thunder video overlay — highest z-index, hidden until triggered */}
      <div
        ref={lightningRef}
        className="fixed inset-0 z-[100] pointer-events-none overflow-hidden bg-background"
        style={{ display: "none", opacity: 0 }}
      >
        <video
          ref={lightningVideoRef}
          src="/assets/thunder.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-screen w-screen object-cover"
          style={{ minWidth: "100vw", minHeight: "100vh" }}
        />
      </div>

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
        <video
          src="/assets/thunder.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 z-0 bg-background/45" />
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(ellipse at 50% 80%, hsl(210 60% 8% / 0.25) 0%, hsl(220 20% 4% / 0.65) 60%, hsl(0 0% 0% / 0.85) 100%)",
          }}
        />

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

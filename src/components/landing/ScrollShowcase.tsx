import { useEffect, useRef, useState, type ReactNode } from "react";

export type ShowcasePanel = {
  key: string;
  chromeTitle: string;
  label: string;
  description: string;
  node: ReactNode;
};

function PanelCard({ chromeTitle, children }: { chromeTitle: string; children: ReactNode }) {
  return (
    <div className="w-full max-w-[600px] rounded-xl bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-dd-fog/70">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground tracking-wide truncate">
          {chromeTitle}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function PanelText({ label, description }: { label: string; description: string }) {
  return (
    <div className="max-w-md">
      <div className="text-sm font-bold tracking-[0.15em] uppercase text-brand-500">{label}</div>
      <h3 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
        {description}
      </h3>
    </div>
  );
}

export function ScrollShowcase({ panels }: { panels: ShowcasePanel[] }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const progressRef = useRef(0);
  const panelWrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const containerTop = window.scrollY + rect.top;
        const segmentHeight = el.offsetHeight / panels.length;
        const rawProgress = (window.scrollY - containerTop) / Math.max(segmentHeight, 1);
        const nextIndex = Math.min(Math.max(Math.floor(rawProgress), 0), panels.length - 1);
        progressRef.current = rawProgress;
        setActiveIndex(nextIndex);

        panelWrapRefs.current.forEach((ref, i) => {
          if (!ref) return;
          const panelProgress = Math.max(0, Math.min(1, rawProgress - i));
          const scale = 0.95 + panelProgress * 0.1;
          ref.style.transform = `scale(${scale})`;
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isDesktop, panels.length]);

  const scrollToPanel = (index: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const containerTop = window.scrollY + rect.top;
    const segmentHeight = el.offsetHeight / panels.length;
    window.scrollTo({
      top: containerTop + segmentHeight * index + 1,
      behavior: "smooth",
    });
  };

  if (!isDesktop) {
    return (
      <div className="px-6 pt-20 pb-16">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-sm font-bold tracking-[0.15em] uppercase text-brand-500">See It In Action</span>
          <h2 className="mt-4 text-3xl font-black tracking-tight">
            The interfaces your team will live in.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Seven workspaces — from executive command to field-coach visit logs — engineered for daily operational use.
          </p>
        </div>
        <div className="space-y-20">
          {panels.map((p) => (
            <MobilePanel key={p.key} panel={p} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      style={{ height: `${panels.length * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden pt-[60px] pb-10">
        <header className="max-w-3xl mx-auto px-6 text-center mb-8">
          <span className="text-sm font-bold tracking-[0.15em] uppercase text-brand-500">See It In Action</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            The interfaces your team will live in.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Seven workspaces — from executive command to field-coach visit logs — engineered for daily operational use.
          </p>
        </header>

        <div className="relative flex-1 w-full max-w-[1200px] mx-auto px-12">
          {panels.map((p, i) => {
            const panelOnRight = i % 2 === 0;
            const isActive = activeIndex === i;

            return (
              <div
                key={p.key}
                className="absolute inset-0 grid grid-cols-12 items-center gap-16 transition-opacity duration-300 ease-out"
                style={{
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? "auto" : "none",
                  willChange: "opacity",
                }}
                aria-hidden={!isActive}
              >
                {panelOnRight ? (
                  <>
                    <div className="col-span-5 flex justify-start">
                      <PanelText label={p.label} description={p.description} />
                    </div>
                    <div className="col-span-7 flex justify-end">
                      <div ref={(el) => { panelWrapRefs.current[i] = el; }} style={{ willChange: "transform" }}>
                        <PanelCard chromeTitle={p.chromeTitle}>{p.node}</PanelCard>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-7 flex justify-start">
                      <div ref={(el) => { panelWrapRefs.current[i] = el; }} style={{ willChange: "transform" }}>
                        <PanelCard chromeTitle={p.chromeTitle}>{p.node}</PanelCard>
                      </div>
                    </div>
                    <div className="col-span-5 flex justify-end">
                      <PanelText label={p.label} description={p.description} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2.5">
          {panels.map((_, i) => {
            const isActive = activeIndex === i;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Show panel ${i + 1}`}
                onClick={() => scrollToPanel(i)}
                className="h-2 w-2 rounded-full transition-all duration-300"
                style={{
                  background: isActive ? "hsl(var(--brand-500))" : "rgba(15,23,42,0.18)",
                  transform: isActive ? "scale(1.8)" : "scale(1)",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobilePanel({ panel }: { panel: ShowcasePanel }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 600ms ease-out, transform 600ms ease-out",
      }}
    >
      <div className="text-center max-w-xl">
        <div className="text-sm font-bold tracking-[0.15em] uppercase text-brand-500">{panel.label}</div>
        <h3 className="mt-2 text-xl font-black tracking-tight text-foreground">{panel.description}</h3>
      </div>
      <PanelCard chromeTitle={panel.chromeTitle}>{panel.node}</PanelCard>
    </div>
  );
}

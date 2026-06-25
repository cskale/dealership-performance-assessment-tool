import { useEffect, useRef, useState, type ReactNode } from "react";

export interface ShowcasePanel {
  label: string;
  title: string;
  description: string;
  content: ReactNode;
}

export function ScrollShowcase({ panels }: { panels: ShowcasePanel[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const containerHeight = container.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / containerHeight));
      const index = Math.min(
        panels.length - 1,
        Math.floor(progress * panels.length),
      );
      setActiveIndex(index);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [panels.length]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${panels.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text stack */}
            <div className="space-y-8">
              {/* Progress dots */}
              <div className="flex gap-2">
                {panels.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const container = containerRef.current;
                      if (!container) return;
                      const rect = container.getBoundingClientRect();
                      const containerTop = window.scrollY + rect.top;
                      const scrollTarget =
                        containerTop +
                        (i / panels.length) *
                          (container.scrollHeight - window.innerHeight);
                      window.scrollTo({ top: scrollTarget, behavior: "smooth" });
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? "w-8 bg-brand-500"
                        : "w-1.5 bg-neutral-300"
                    }`}
                    aria-label={`Go to panel ${i + 1}`}
                  />
                ))}
              </div>

              {/* Active panel text */}
              <div className="min-h-[180px]">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
                  {panels[activeIndex]?.label}
                </p>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {panels[activeIndex]?.title}
                </h3>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-md">
                  {panels[activeIndex]?.description}
                </p>
              </div>

              {/* Panel list */}
              <div className="hidden lg:flex flex-col gap-1">
                {panels.map((panel, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const container = containerRef.current;
                      if (!container) return;
                      const rect = container.getBoundingClientRect();
                      const containerTop = window.scrollY + rect.top;
                      const scrollTarget =
                        containerTop +
                        (i / panels.length) *
                          (container.scrollHeight - window.innerHeight);
                      window.scrollTo({ top: scrollTarget, behavior: "smooth" });
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      i === activeIndex
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {panel.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — Panel preview */}
            <div className="relative">
              <div className="bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
                <div className="transition-opacity duration-300">
                  {panels[activeIndex]?.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

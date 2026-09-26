import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Crosshair, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { questionnaire, getTranslatedSection } from "@/data/questionnaire";
import { TOTAL_QUESTIONS } from "@/lib/constants";
import { sectionToModuleCode, type ModuleBenchmark } from "@/lib/benchmarkUtils";
import { detectSystemicPatterns, getScoredQuestions } from "@/lib/scoringEngine";
import { generateSignals } from "@/lib/signalEngine";
import { buildExecutiveNarrative, type PrimarySignalCode } from "@/lib/narrativeTemplates";
import { getMaturityLevel, type MaturityLevel } from "@/lib/maturityConfig";
import { DEPT_LABEL_TO_SECTION_ID } from "@/lib/coachVisitUtils";
import { cn } from "@/lib/utils";

export interface HeroAction {
  id: string;
  department: string;
  priority: string;
  status: string | null;
  action_title: string;
}

interface ResultsHeroBandProps {
  overallScore: number;
  scores: Record<string, number>;
  answers: Record<string, number>;
  benchmarks: Record<string, ModuleBenchmark>;
  actions: HeroAction[];
  dealerName: string;
  onOpenAction: (actionId: string) => void;
}

const MATURITY_STEPS: MaturityLevel[] = ["foundational", "developing", "performing", "advanced"];
const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_STYLES: Record<MaturityLevel, { text: string; bg: string; stroke: string }> = {
  foundational: { text: "text-destructive", bg: "bg-destructive", stroke: "hsl(var(--destructive))" },
  developing: { text: "text-warning-foreground", bg: "bg-warning", stroke: "hsl(var(--warning))" },
  performing: { text: "text-info", bg: "bg-info", stroke: "hsl(var(--info))" },
  advanced: { text: "text-success", bg: "bg-success", stroke: "hsl(var(--success))" },
};

function ScoreRing({ score, maturity }: { score: number; maturity: MaturityLevel }) {
  const [displayScore, setDisplayScore] = useState(score);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, displayScore));
  const style = STATUS_STYLES[maturity];

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplayScore(score);
      return;
    }
    const startedAt = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const elapsed = Math.min((now - startedAt) / 650, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplayScore(score * eased);
      if (elapsed < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative h-[120px] w-[120px] shrink-0" role="img" aria-label={`${Math.round(score)} / 100`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="results-score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={style.stroke} stopOpacity="0.65" />
            <stop offset="100%" stopColor={style.stroke} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--neutral-200))" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#results-score-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress / 100)}
        />
        {[46, 70, 85, 100].map((boundary) => {
          const angle = (boundary / 100) * Math.PI * 2;
          const x1 = 60 + Math.sin(angle) * 41;
          const y1 = 60 - Math.cos(angle) * 41;
          const x2 = 60 + Math.sin(angle) * 45;
          const y2 = 60 - Math.cos(angle) * 45;
          return <line key={boundary} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--card))" strokeWidth="2" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-mono text-3xl font-bold tabular-nums", style.text)}>{Math.round(displayScore)}</span>
        <span className="text-caption text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function ResultsHeroBand({ overallScore, scores, answers, benchmarks, actions, dealerName, onOpenAction }: ResultsHeroBandProps) {
  const { t, language } = useLanguage();
  const [narrativeExpanded, setNarrativeExpanded] = useState(false);
  const maturity = useMemo(() => getMaturityLevel(overallScore), [overallScore]);
  const statusStyle = STATUS_STYLES[maturity];

  const departmentNames = useMemo(() => Object.fromEntries(
    questionnaire.sections.map((section) => [section.id, getTranslatedSection(section, language).title])
  ), [language]);

  const biggestLever = useMemo(() => Object.entries(scores)
    .map(([departmentId, score]) => {
      const benchmark = benchmarks[sectionToModuleCode(departmentId)];
      return benchmark ? { departmentId, score, gap: score - benchmark.meanScore } : null;
    })
    .filter((item): item is { departmentId: string; score: number; gap: number } => item !== null && item.gap < 0)
    .sort((a, b) => a.gap - b.gap)[0] ?? null, [scores, benchmarks]);

  const leverAction = useMemo(() => {
    if (!biggestLever) return null;
    return actions
      .filter((action) => action.status !== "Completed" && (
        action.department === biggestLever.departmentId ||
        DEPT_LABEL_TO_SECTION_ID[action.department] === biggestLever.departmentId
      ))
      .sort((a, b) => (PRIORITY_ORDER[a.priority.toLowerCase()] ?? 99) - (PRIORITY_ORDER[b.priority.toLowerCase()] ?? 99))[0] ?? null;
  }, [actions, biggestLever]);

  const narrative = useMemo(() => {
    const questionWeights: Record<string, number> = {};
    questionnaire.sections.forEach((section) => getScoredQuestions(section.questions).forEach((question) => {
      questionWeights[question.id] = question.weight;
    }));
    const signals = generateSignals(answers, questionWeights);
    const systemicPatterns = detectSystemicPatterns(questionnaire.sections, answers);
    const primarySignal = (signals[0]?.signalCode ?? "PROCESS_NOT_STANDARDISED") as PrimarySignalCode;
    const narrativeDepartment = biggestLever ? departmentNames[biggestLever.departmentId] : undefined;
    const benchmark = biggestLever ? benchmarks[sectionToModuleCode(biggestLever.departmentId)]?.meanScore : undefined;
    return buildExecutiveNarrative({
      maturityLevel: maturity,
      primarySignal,
      dealerName,
      department: narrativeDepartment,
      score: overallScore,
      benchmark,
      isSystemic: systemicPatterns.some((pattern) => pattern.severity === "systemic"),
    });
  }, [answers, benchmarks, biggestLever, dealerName, departmentNames, maturity, overallScore]);

  const coverage = useMemo(() => t("results.hero.coverage")
    .replace("{assessed}", String(Object.keys(scores).length))
    .replace("{answered}", String(Object.keys(answers).length))
    .replace("{total}", String(TOTAL_QUESTIONS)), [answers, scores, t]);

  const activeStep = MATURITY_STEPS.indexOf(maturity);

  return (
    <Card className="overflow-hidden border-border shadow-card">
      <CardContent className="grid p-0 lg:grid-cols-[180px_minmax(0,1fr)_minmax(240px,0.72fr)]">
        <div className="flex items-center justify-center border-b border-border p-6 lg:border-b-0 lg:border-r">
          <ScoreRing score={overallScore} maturity={maturity} />
        </div>

        <div className="min-w-0 border-b border-border p-6 lg:border-b-0 lg:border-r">
          <div className="relative grid grid-cols-4 gap-2 pt-5">
            <div className="absolute left-[12.5%] right-[12.5%] top-[27px] h-px bg-border" />
            {MATURITY_STEPS.map((step, index) => {
              const active = step === maturity;
              return (
                <div key={step} className="relative flex min-w-0 flex-col items-center text-center">
                  {active && <MapPin className={cn("absolute -top-5 h-4 w-4", statusStyle.text)} aria-hidden="true" />}
                  <span className={cn("z-10 h-3 w-3 rounded-full border-2 border-card", active ? statusStyle.bg : "bg-muted-foreground/30")} />
                  <span className={cn("mt-2 text-caption", active ? cn("font-semibold", statusStyle.text) : "text-muted-foreground")}>
                    {t(`maturity.${step}`)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 space-y-3">
            <p className={cn("text-body-sm leading-relaxed text-muted-foreground", !narrativeExpanded && "line-clamp-2")}>
              {narrative.situation}
            </p>
            {narrativeExpanded && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="text-body-sm leading-relaxed text-muted-foreground">{narrative.diagnosis}</p>
                <p className="border-l-2 border-primary pl-3 text-body-sm font-medium leading-relaxed text-foreground">{narrative.priority}</p>
              </div>
            )}
            <Button variant="link" className="h-auto p-0 text-body-sm" onClick={() => setNarrativeExpanded((expanded) => !expanded)}>
              {t("results.hero.readNarrative")}
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-6 p-6">
          <div>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Crosshair className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="text-caption font-semibold uppercase text-muted-foreground">{t("results.hero.biggestLever")}</p>
            {biggestLever && (
              <p className="mt-2 text-h4 text-foreground">{departmentNames[biggestLever.departmentId] ?? biggestLever.departmentId}</p>
            )}
            {leverAction && (
              <Button variant="link" className="mt-2 h-auto max-w-full justify-start gap-1.5 whitespace-normal p-0 text-left text-body-sm" onClick={() => onOpenAction(leverAction.id)}>
                <span className="line-clamp-2">{leverAction.action_title}</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Button>
            )}
            {biggestLever && !leverAction && (
              <p className="mt-2 text-body-sm text-muted-foreground">
                {Math.abs(Math.round(biggestLever.gap))} pts
              </p>
            )}
          </div>
          <p className="border-t border-border pt-4 text-caption leading-relaxed text-muted-foreground">{coverage}</p>
        </div>
      </CardContent>
    </Card>
  );
}
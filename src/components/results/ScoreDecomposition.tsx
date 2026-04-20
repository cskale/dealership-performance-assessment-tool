import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDepartmentName } from "@/lib/departmentNames";

interface ScoreDecompositionProps {
  scores: Record<string, number>;
  overallScore: number;
}

const WEIGHTS: Record<string, number> = {
  'new-vehicle-sales': 0.25,
  'used-vehicle-sales': 0.20,
  'service-performance': 0.20,
  'financial-operations': 0.20,
  'parts-inventory': 0.15,
};

const COLORS: Record<string, string> = {
  'new-vehicle-sales': 'hsl(217 91% 60%)',
  'used-vehicle-sales': 'hsl(263 70% 63%)',
  'service-performance': 'hsl(160 84% 39%)',
  'financial-operations': 'hsl(38 92% 50%)',
  'parts-inventory': 'hsl(215 16% 47%)',
};

const ORDER: string[] = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'financial-operations',
  'parts-inventory',
];

export function ScoreDecomposition({ scores, overallScore }: ScoreDecompositionProps) {
  const { language } = useLanguage();

  const headerText = language === 'de' ? 'Punkteverteilung' : 'Score Breakdown';
  const totalLabel = language === 'de' ? 'Gesamtpunktzahl' : 'Overall Score';
  const scoreLabel = language === 'de' ? 'Punktzahl' : 'Score';
  const weightLabel = language === 'de' ? 'Gewichtung' : 'Weight';
  const contributionLabel = language === 'de' ? 'Beitrag' : 'Contribution';
  const ptsLabel = language === 'de' ? 'Pkt' : 'pts';

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {headerText}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {totalLabel}: <span className="font-semibold text-foreground">{overallScore.toFixed(1)}/100</span>
          </p>
        </div>

        <TooltipProvider delayDuration={150}>
          <div className="relative h-7 w-full rounded-[6px] bg-muted overflow-hidden flex">
            {ORDER.map((dept, idx) => {
              const score = scores[dept] ?? 0;
              const weight = WEIGHTS[dept];
              const widthPct = score * weight;
              const contribution = (score * weight) / 1;
              if (widthPct <= 0) return null;
              return (
                <Tooltip key={dept}>
                  <TooltipTrigger asChild>
                    <div
                      className={idx > 0 ? "border-l border-white cursor-pointer" : "cursor-pointer"}
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: COLORS[dept],
                      }}
                      aria-label={`${getDepartmentName(dept, language)} contribution`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold">{getDepartmentName(dept, language)}</p>
                      <p>{scoreLabel}: {score.toFixed(0)} · {weightLabel}: {(weight * 100).toFixed(0)}%</p>
                      <p>{contributionLabel}: {contribution.toFixed(1)} {ptsLabel}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[12px]">
          {ORDER.map((dept) => {
            const score = scores[dept] ?? 0;
            const weight = WEIGHTS[dept];
            const contribution = (score * weight);
            return (
              <div key={dept} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[dept] }}
                />
                <span className="text-foreground font-medium">
                  {getDepartmentName(dept, language)}
                </span>
                <span className="text-muted-foreground">
                  {score.toFixed(0)} ×{(weight * 100).toFixed(0)}% = {contribution.toFixed(1)} {ptsLabel}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

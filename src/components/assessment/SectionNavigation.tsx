import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, AlertCircle } from "lucide-react";
import { Section } from "@/data/questionnaire";

interface SectionNavigationProps {
  sections: Section[];
  currentSection: number;
  currentQuestion: number;
  answers: Record<string, number>;
  onNavigate: (sectionIndex: number, questionIndex: number) => void;
  getSectionIcon: (title: string) => React.ComponentType<any>;
  getSectionColor: (index: number) => string;
}

export function SectionNavigation({
  sections,
  currentSection,
  currentQuestion,
  answers,
  onNavigate,
  getSectionIcon,
  getSectionColor
}: SectionNavigationProps) {
  const getSectionProgress = (section: Section) => {
    const sectionQuestions = section.questions;
    const answeredInSection = sectionQuestions.filter(q => q.id in answers).length;
    return (answeredInSection / sectionQuestions.length) * 100;
  };

  const getSectionStatus = (sectionIndex: number, section: Section) => {
    const progress = getSectionProgress(section);
    
    if (sectionIndex === currentSection) {
      return { icon: Clock, color: "text-primary", bg: "bg-background" };
    } else if (progress === 100) {
      return { icon: Check, color: "text-muted-foreground", bg: "bg-background" };
    } else if (progress > 0) {
      return { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-background" };
    } else {
      return { icon: Clock, color: "text-muted-foreground", bg: "bg-background" };
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-foreground px-1">Assessment Sections</h2>
      
      {sections.map((section, sectionIndex) => {
        const progress = getSectionProgress(section);
        const status = getSectionStatus(sectionIndex, section);
        const Icon = getSectionIcon(section.title);
        const StatusIcon = status.icon;
        const isCurrentSection = sectionIndex === currentSection;
        
        return (
          <Card
            key={section.id}
            className={`transition-all duration-200 cursor-pointer hover:scale-[1.02] border bg-white ${
              isCurrentSection 
                ? "border-l-4 border-l-primary shadow-sm" 
                : "hover:shadow-sm"
            }`}
            onClick={() => onNavigate(sectionIndex, 0)}
          >
            <CardContent className="p-3">
              {/* Section Header */}
              <div className="flex items-start gap-2.5 mb-2.5">
                <div className="p-1.5">
                  <Icon className="h-4 w-4 text-muted-foreground stroke-[1.5]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm leading-tight ${
                    isCurrentSection ? 'font-medium text-foreground' : 'font-normal text-muted-foreground'
                  }`}>
                    {section.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} strokeWidth={1.5} />
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {section.questions.filter(q => q.id in answers).length} of {section.questions.length}
                  </span>
                  <Badge 
                    variant={progress === 100 ? "default" : "outline"}
                    className="text-xs h-5 px-1.5 font-normal"
                  >
                    {Math.round(progress)}%
                  </Badge>
                </div>
                <Progress 
                  value={progress} 
                  className="h-1.5" 
                />
              </div>

              {/* Questions List - Only show for current section */}
              {isCurrentSection && section.questions.length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-1">
                  {section.questions.map((question, qIndex) => {
                    const isAnswered = question.id in answers;
                    const isCurrentQuestion = qIndex === currentQuestion;
                    
                    return (
                      <button
                        key={question.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(sectionIndex, qIndex);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                          isCurrentQuestion
                            ? "bg-primary/10 text-primary font-medium"
                            : isAnswered
                            ? "text-muted-foreground hover:bg-muted/30"
                            : "text-muted-foreground/60 hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isAnswered ? (
                            <Check className="h-3 w-3 text-primary flex-shrink-0" strokeWidth={2} />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                          )}
                          <span className="line-clamp-1 flex-1">Q{qIndex + 1}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Overall Progress Card */}
      <Card className="border bg-muted/20">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-foreground">Overall Progress</span>
              <Badge variant="outline" className="text-xs h-5 font-normal">
                {Math.round(
                  (Object.keys(answers).length / 
                    sections.reduce((acc, s) => acc + s.questions.length, 0)) * 100
                )}%
              </Badge>
            </div>
            <Progress
              value={
                (Object.keys(answers).length / 
                  sections.reduce((acc, s) => acc + s.questions.length, 0)) * 100
              }
              className="h-1.5"
            />
            <p className="text-xs text-muted-foreground">
              {Object.keys(answers).length} of{" "}
              {sections.reduce((acc, s) => acc + s.questions.length, 0)} questions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
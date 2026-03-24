import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Lightbulb, TrendingUp, BarChart } from 'lucide-react';
import { Question, Section } from '@/data/questionnaire';

interface SmartAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestion?: Question;
  currentSection?: Section;
  answers?: Record<string, number>;
  scores?: Record<string, number>;
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({
  open,
  onOpenChange,
  currentQuestion,
  currentSection,
  answers = {},
  scores = {}
}) => {
  const [guidance, setGuidance] = useState<string>('');
  const [tips, setTips] = useState<string[]>([]);

  useEffect(() => {
    if (currentQuestion && open) {
      generateContextualGuidance();
    }
  }, [currentQuestion, open]);

  const generateContextualGuidance = () => {
    if (!currentQuestion) return;

    let newGuidance = '';
    let newTips: string[] = [];

    if (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'rating') {
      newGuidance = "Select the option that best reflects your current situation. Be honest in your assessment for accurate results.";
      
      if (currentQuestion.text.toLowerCase().includes('training')) {
        newTips = [
          "Consider both formal training programs and on-the-job learning",
          "Regular training updates are crucial in automotive industry",
          "Track training completion rates and effectiveness"
        ];
      } else if (currentQuestion.text.toLowerCase().includes('customer')) {
        newTips = [
          "Customer satisfaction directly impacts business success",
          "Monitor both sales and service customer feedback",
          "Consider implementing customer journey mapping"
        ];
      } else if (currentQuestion.text.toLowerCase().includes('inventory')) {
        newTips = [
          "Optimal inventory management reduces carrying costs",
          "Balance stock levels with customer demand",
          "Consider seasonal variations in your assessment"
        ];
      }
    } else if (currentQuestion.type === 'scale') {
      newGuidance = "Rate on the scale provided. Consider your current performance honestly for accurate results.";
      newTips = [
        "Use recent performance data for accuracy",
        "Consider trends over the past 6 months",
        "Compare with industry standards if known"
      ];
    }

    if (currentQuestion.text.toLowerCase().includes('sales')) {
      if (!newTips.length) {
        newTips = [
          "Focus on conversion rates and customer experience",
          "Consider digital marketing effectiveness",
          "Evaluate sales team performance metrics"
        ];
      }
    } else if (currentQuestion.text.toLowerCase().includes('service')) {
      if (!newTips.length) {
        newTips = [
          "Service quality directly impacts customer retention",
          "Consider both efficiency and customer satisfaction",
          "Evaluate technician productivity and skills"
        ];
      }
    }

    setGuidance(newGuidance);
    setTips(newTips);
  };

  const getSectionProgress = () => {
    if (!currentSection) return 0;
    const sectionAnswers = currentSection.questions.filter(q => answers[q.id] !== undefined).length;
    return (sectionAnswers / currentSection.questions.length) * 100;
  };

  const getProgressMessage = () => {
    const progress = getSectionProgress();
    if (progress < 25) {
      return "You're just getting started! Take your time to provide accurate responses.";
    } else if (progress < 50) {
      return "Great progress! Your responses are building a comprehensive assessment.";
    } else if (progress < 75) {
      return "You're more than halfway through this section. Keep up the good work!";
    } else {
      return "Almost done with this section! Your detailed responses will generate better insights.";
    }
  };

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Assessment Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Scores */}
          {Object.keys(scores).length > 0 && (
            <div className="bg-muted/50 p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="h-4 w-4 text-primary" />
                <span className="text-h5">Current Scores</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(scores).map(([section, score]) => (
                  <div key={section} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{section.replace('_', ' ')}:</span>
                    <span className="font-medium">{score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Message */}
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {getProgressMessage()}
            </p>
          </div>

          {/* Contextual Guidance */}
          {guidance && (
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{guidance}</p>
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Tips:</span>
              </div>
              <ul className="space-y-1 ml-6">
                {tips.map((tip, index) => (
                  <li key={index} className="text-xs text-muted-foreground list-disc">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Current Answer Feedback */}
          {currentAnswer !== undefined && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Answer recorded. This helps build your dealership profile for accurate recommendations.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

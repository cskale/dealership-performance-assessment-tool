import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function AchievementsSection() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "What You'll Achieve",
      subtitle: 'Our assessment provides insights and tools to transform performance',
      achievements: [
        'Identify performance gaps and improvement opportunities',
        'Benchmark against industry leaders and peer dealerships',
        'Receive actionable recommendations for growth',
        'Track progress with detailed analytics and reporting',
        'Access professional-grade consulting insights',
        'Export comprehensive reports for stakeholder presentations',
      ],
      mockupTitle: 'Assessment Complete',
      mockupScore: '87%',
      mockupLabel: 'Performance Score',
    },
    de: {
      title: 'Was Sie erreichen werden',
      subtitle: 'Unsere Bewertung liefert Erkenntnisse und Werkzeuge zur Leistungssteigerung',
      achievements: [
        'Leistungslücken und Verbesserungsmöglichkeiten identifizieren',
        'Vergleich mit Branchenführern und anderen Händlern',
        'Umsetzbare Empfehlungen für Wachstum erhalten',
        'Fortschritt mit detaillierten Analysen verfolgen',
        'Zugang zu professionellen Beratungseinblicken',
        'Umfassende Berichte für Stakeholder exportieren',
      ],
      mockupTitle: 'Bewertung abgeschlossen',
      mockupScore: '87%',
      mockupLabel: 'Leistungspunktzahl',
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Achievements */}
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {t.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t.subtitle}
            </p>
            
            <div className="space-y-4">
              {t.achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Mockup Preview */}
          <div className="relative">
            <Card className="shadow-2xl border-0 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6">
                  <div className="text-white/80 text-sm font-medium mb-2">
                    {t.mockupTitle}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold text-white">{t.mockupScore}</span>
                  </div>
                  <div className="text-white/70 text-sm mt-1">{t.mockupLabel}</div>
                </div>
                <div className="p-6 bg-white">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">New Vehicle Sales</span>
                      <div className="w-32 h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Service Performance</span>
                      <div className="w-32 h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Parts & Inventory</span>
                      <div className="w-32 h-2 bg-yellow-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Decorative elements */}
            <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-purple-200 rounded-2xl opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
}

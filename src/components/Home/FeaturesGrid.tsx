import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Target, TrendingUp, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function FeaturesGrid() {
  const { language } = useLanguage();

  const features = [
    {
      icon: BarChart3,
      title: { en: 'Comprehensive Assessment', de: 'Umfassende Bewertung' },
      description: { 
        en: 'Evaluate all aspects with scientifically-designed questionnaire', 
        de: 'Bewerten Sie alle Aspekte mit wissenschaftlich gestalteten Fragebögen' 
      },
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Target,
      title: { en: 'AI-Powered Insights', de: 'KI-gestützte Erkenntnisse' },
      description: { 
        en: 'Get personalized recommendations from advanced machine learning', 
        de: 'Erhalten Sie personalisierte Empfehlungen durch fortschrittliches maschinelles Lernen' 
      },
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: TrendingUp,
      title: { en: 'Industry Benchmarking', de: 'Branchen-Benchmarking' },
      description: { 
        en: 'Compare performance against peers with relevant data', 
        de: 'Vergleichen Sie Ihre Leistung mit Branchenkollegen anhand relevanter Daten' 
      },
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Shield,
      title: { en: 'Secure & Confidential', de: 'Sicher & Vertraulich' },
      description: { 
        en: 'Your data encrypted and never shared publicly', 
        de: 'Ihre Daten werden verschlüsselt und niemals öffentlich geteilt' 
      },
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const sectionTitle = {
    en: 'Why Choose Our Assessment',
    de: 'Warum unsere Bewertung wählen'
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">
          {sectionTitle[language as keyof typeof sectionTitle] || sectionTitle.en}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title[language as keyof typeof feature.title] || feature.title.en}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description[language as keyof typeof feature.description] || feature.description.en}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

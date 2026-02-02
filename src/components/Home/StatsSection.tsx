import { Card, CardContent } from '@/components/ui/card';
import { Building2, Target, Clock, Globe } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { useLanguage } from '@/contexts/LanguageContext';

export function StatsSection() {
  const { language } = useLanguage();

  const stats = [
    {
      icon: Building2,
      value: 10000,
      suffix: '+',
      label: { en: 'Dealerships Assessed', de: 'Bewertete Autohäuser' },
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Target,
      value: 95,
      suffix: '%',
      label: { en: 'Accuracy Rate', de: 'Genauigkeitsrate' },
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Clock,
      value: 15,
      suffix: ' min',
      label: { en: 'Average Completion', de: 'Durchschn. Bearbeitungszeit' },
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Globe,
      value: 50,
      suffix: '+',
      label: { en: 'Countries Served', de: 'Länder bedient' },
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.label[language as keyof typeof stat.label] || stat.label.en}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

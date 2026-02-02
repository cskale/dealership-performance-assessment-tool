import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function CTASection() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Ready to Transform Your Dealership?',
      subtitle: 'Join thousands who discovered their potential. Start comprehensive assessment and unlock insights in just 15 minutes.',
      button: 'Begin Assessment',
      timeLabel: 'Takes only 15 minutes',
    },
    de: {
      title: 'Bereit, Ihr Autohaus zu transformieren?',
      subtitle: 'Schließen Sie sich Tausenden an, die ihr Potenzial entdeckt haben. Starten Sie die umfassende Bewertung und gewinnen Sie Erkenntnisse in nur 15 Minuten.',
      button: 'Bewertung beginnen',
      timeLabel: 'Dauert nur 15 Minuten',
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          {t.title}
        </h2>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
        
        <div className="flex flex-col items-center gap-4">
          <Link to="/app/assessment">
            <Button 
              size="lg" 
              className="h-16 px-10 text-lg font-semibold bg-white text-purple-700 hover:bg-white/90 hover:scale-105 transition-all duration-200 shadow-xl"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              {t.button}
            </Button>
          </Link>
          
          <div className="flex items-center gap-2 text-white/70">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{t.timeLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

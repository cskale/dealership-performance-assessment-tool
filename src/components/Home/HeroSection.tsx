import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroSectionProps {
  hasCompletedAssessment: boolean;
}

export function HeroSection({ hasCompletedAssessment }: HeroSectionProps) {
  const { language } = useLanguage();

  const content = {
    en: {
      badge: '🔬 AI-Powered Dealership Analytics',
      headline: "Unlock Your Dealership's True Potential",
      subheadline: 'Get comprehensive insights into your dealership\'s performance with our advanced assessment tool. Compare against industry benchmarks and receive personalized recommendations for growth.',
      startButton: 'Start Assessment',
      learnMore: 'Learn More',
      viewResults: 'View Results',
    },
    de: {
      badge: '🔬 KI-gestützte Händleranalyse',
      headline: 'Erschließen Sie das wahre Potenzial Ihres Autohauses',
      subheadline: 'Erhalten Sie umfassende Einblicke in die Leistung Ihres Autohauses mit unserem fortschrittlichen Bewertungstool. Vergleichen Sie mit Branchen-Benchmarks und erhalten Sie personalisierte Wachstumsempfehlungen.',
      startButton: 'Bewertung starten',
      learnMore: 'Mehr erfahren',
      viewResults: 'Ergebnisse anzeigen',
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center animate-fade-in">
        {/* Badge */}
        <Badge className="mb-6 px-4 py-2 text-sm font-medium bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
          {t.badge}
        </Badge>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
          {t.headline}
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t.subheadline}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/app/assessment">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg font-semibold bg-white text-purple-700 hover:bg-white/90 hover:scale-105 transition-all duration-200 shadow-xl"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              {t.startButton}
            </Button>
          </Link>
          
          <Link to="/methodology">
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg font-semibold border-2 border-white/50 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-200"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              {t.learnMore}
            </Button>
          </Link>

          {hasCompletedAssessment && (
            <Link to="/app/results">
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg font-semibold border-2 border-white/50 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-200"
              >
                {t.viewResults}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center">
          <div className="w-1.5 h-3 bg-white/80 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

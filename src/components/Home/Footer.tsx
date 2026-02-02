import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { language } = useLanguage();

  const content = {
    en: {
      tagline: 'Professional-grade analytics for automotive dealerships',
      quickLinks: 'Quick Links',
      support: 'Support',
      startAssessment: 'Start Assessment',
      resources: 'Resources',
      methodology: 'Methodology',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      privacy: 'Privacy Policy',
      copyright: '© 2026 Dealership Assessment. All rights reserved.',
    },
    de: {
      tagline: 'Professionelle Analysen für Autohäuser',
      quickLinks: 'Schnelllinks',
      support: 'Support',
      startAssessment: 'Bewertung starten',
      resources: 'Ressourcen',
      methodology: 'Methodik',
      helpCenter: 'Hilfezentrum',
      contactUs: 'Kontakt',
      privacy: 'Datenschutzrichtlinie',
      copyright: '© 2026 Dealership Assessment. Alle Rechte vorbehalten.',
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <footer className="bg-slate-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">Dealership Assessment</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.quickLinks}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/app/assessment" className="text-slate-400 hover:text-white transition-colors text-sm">
                  {t.startAssessment}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-slate-400 hover:text-white transition-colors text-sm">
                  {t.resources}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-slate-400 hover:text-white transition-colors text-sm">
                  {t.methodology}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{t.support}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/resources" className="text-slate-400 hover:text-white transition-colors text-sm">
                  {t.helpCenter}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-slate-400 hover:text-white transition-colors text-sm">
                  {t.contactUs}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-slate-400 hover:text-white transition-colors text-sm">
                  {t.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <p className="text-slate-500 text-sm text-center">
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

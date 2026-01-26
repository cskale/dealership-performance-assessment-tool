import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// UI Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    'nav.dashboard': 'Dashboard',
    'nav.assessment': 'Assessment',
    'nav.results': 'Results',
    'nav.actions': 'Actions',
    'nav.account': 'Account',
    'nav.backToDashboard': 'Back to Dashboard',
    
    // Assessment Page
    'assessment.title': 'Dealership Assessment',
    'assessment.sections': 'Sections',
    'assessment.questions': 'questions',
    'assessment.completed': 'completed',
    'assessment.complete': 'Complete',
    'assessment.overallProgress': 'Overall Progress',
    'assessment.of': 'of',
    'assessment.rateFrom': 'Rate from',
    'assessment.lowest': 'lowest',
    'assessment.to': 'to',
    'assessment.highest': 'highest',
    'assessment.selected': 'Selected',
    'assessment.whyThisMatters': 'Why This Question Matters',
    'assessment.assessmentPurpose': 'Assessment Purpose',
    'assessment.situationAnalysis': 'Situation Analysis',
    'assessment.linkedKPIs': 'Linked KPIs',
    'assessment.businessBenefits': 'Business Benefits',
    'assessment.additionalNotes': 'Additional Notes & Insights',
    'assessment.saved': 'Saved',
    'assessment.autoSaves': 'Auto-saves as you type',
    'assessment.placeholder.notes': 'Add your observations, context, or improvement ideas for this question...',
    'assessment.sectionComplete': 'Section Complete!',
    'assessment.questionsAnswered': 'Questions Answered',
    'assessment.readyToView': 'Ready to view your comprehensive results',
    'assessment.continueToNext': 'Continue to the next assessment category',
    'assessment.pleaseAnswer': 'Please answer all questions to continue',
    'assessment.viewResults': 'View Results',
    'assessment.saveAndContinue': 'Save & Continue',
    'assessment.previousSection': 'Previous Section',
    'assessment.nextSection': 'Next Section',
    'assessment.section': 'Section',
    'assessment.finish': 'Finish',
    'assessment.answerSaved': 'Answer Saved',
    'assessment.responseRecorded': 'Your response has been recorded.',
    'assessment.incomplete': 'Assessment Incomplete',
    'assessment.pleaseAnswerAll': 'Please answer all questions.',
    'assessment.assessmentComplete': 'Assessment Complete!',
    'assessment.resultsReady': 'Your results are ready for review.',
    
    // Index/Landing Page
    'index.hero.title1': 'Optimize Your Dealership\'s',
    'index.hero.title2': 'Performance & Profitability',
    'index.hero.description': 'Comprehensive AI-powered assessment that analyzes your dealership operations, identifies growth opportunities, and provides actionable insights to boost performance across all departments.',
    'index.hero.cta': 'Start Your Assessment',
    'index.stats.questions': 'Comprehensive Questions',
    'index.stats.areas': 'Key Performance Areas',
    'index.stats.ai': 'Powered Insights',
    'index.problem.title': 'Is Your Dealership Leaving Money on the Table?',
    'index.problem.description': 'Most dealerships struggle with fragmented processes, inconsistent performance metrics, and lack of actionable insights. Without a comprehensive view of your operations, it\'s impossible to identify the opportunities that could dramatically improve your bottom line.',
    'index.solution.title': 'How It Works: Simple, Fast, Effective',
    'index.solution.subtitle': 'Get actionable insights in three straightforward steps',
    'index.solution.step1.title': 'Complete Assessment',
    'index.solution.step1.description': 'Answer 50+ targeted questions about your dealership operations, covering sales, service, inventory, and customer experience.',
    'index.solution.step2.title': 'AI Analysis',
    'index.solution.step2.description': 'Our AI engine analyzes your responses against industry benchmarks and identifies specific areas for improvement.',
    'index.solution.step3.title': 'Get Actionable Insights',
    'index.solution.step3.description': 'Receive a comprehensive report with prioritized recommendations and implementation strategies.',
    'index.features.title': 'Powerful Features for Maximum Impact',
    'index.features.benchmarking.title': 'Performance Benchmarking',
    'index.features.benchmarking.description': 'Compare your dealership against industry standards and top performers in your region.',
    'index.features.department.title': 'Department Analysis',
    'index.features.department.description': 'Deep dive into sales, service, parts, and F&I departments with specific recommendations.',
    'index.features.ai.title': 'AI-Powered Recommendations',
    'index.features.ai.description': 'Get prioritized action items with clear implementation strategies and expected ROI.',
    'index.features.dashboard.title': 'Interactive Dashboard',
    'index.features.dashboard.description': 'Visualize your performance with charts, graphs, and detailed analytics.',
    'index.features.security.title': 'Secure & Confidential',
    'index.features.security.description': 'Your data is protected with enterprise-grade security and remains completely confidential.',
    'index.features.reports.title': 'Comprehensive Reports',
    'index.features.reports.description': 'Export detailed reports for management presentations and team discussions.',
    'index.cta.title': 'Ready to Unlock Your Dealership\'s Potential?',
    'index.cta.description': 'Start your comprehensive assessment now and discover the opportunities waiting in your business.',
    'index.cta.button': 'Begin Assessment',
    
    // Section Titles
    'section.newVehicleSales': 'New Vehicle Sales Performance',
    'section.usedVehicleSales': 'Used Vehicle Sales Performance',
    'section.servicePerformance': 'Service Performance',
    'section.partsInventory': 'Parts and Inventory Performance',
    'section.financialOperations': 'Financial Operations & Overall Performance',
    
    // Section Descriptions
    'section.newVehicleSales.desc': 'Evaluate your new vehicle sales processes, performance metrics, and customer satisfaction',
    'section.usedVehicleSales.desc': 'Assess your used vehicle operations, pricing strategies, and market positioning',
    'section.servicePerformance.desc': 'Evaluate your service department efficiency, customer satisfaction, and profitability',
    'section.partsInventory.desc': 'Analyze your parts department efficiency, inventory management, and profitability',
    'section.financialOperations.desc': 'Evaluate overall financial health, operational efficiency, and business management',
    
    // Common
    'common.note': 'note',
    'common.notes': 'notes',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.loading': 'Loading...',
    'common.language': 'Language',
    'common.english': 'English',
    'common.german': 'German',
  },
  de: {
    // Header & Navigation
    'nav.dashboard': 'Dashboard',
    'nav.assessment': 'Bewertung',
    'nav.results': 'Ergebnisse',
    'nav.actions': 'Maßnahmen',
    'nav.account': 'Konto',
    'nav.backToDashboard': 'Zurück zum Dashboard',
    
    // Assessment Page
    'assessment.title': 'Händlerbewertung',
    'assessment.sections': 'Abschnitte',
    'assessment.questions': 'Fragen',
    'assessment.completed': 'abgeschlossen',
    'assessment.complete': 'Vollständig',
    'assessment.overallProgress': 'Gesamtfortschritt',
    'assessment.of': 'von',
    'assessment.rateFrom': 'Bewerten Sie von',
    'assessment.lowest': 'niedrigste',
    'assessment.to': 'bis',
    'assessment.highest': 'höchste',
    'assessment.selected': 'Ausgewählt',
    'assessment.whyThisMatters': 'Warum diese Frage wichtig ist',
    'assessment.assessmentPurpose': 'Bewertungszweck',
    'assessment.situationAnalysis': 'Situationsanalyse',
    'assessment.linkedKPIs': 'Verknüpfte KPIs',
    'assessment.businessBenefits': 'Geschäftsvorteile',
    'assessment.additionalNotes': 'Zusätzliche Notizen & Erkenntnisse',
    'assessment.saved': 'Gespeichert',
    'assessment.autoSaves': 'Automatisches Speichern während der Eingabe',
    'assessment.placeholder.notes': 'Fügen Sie Ihre Beobachtungen, Kontext oder Verbesserungsideen für diese Frage hinzu...',
    'assessment.sectionComplete': 'Abschnitt abgeschlossen!',
    'assessment.questionsAnswered': 'Fragen beantwortet',
    'assessment.readyToView': 'Bereit zur Anzeige Ihrer umfassenden Ergebnisse',
    'assessment.continueToNext': 'Weiter zur nächsten Bewertungskategorie',
    'assessment.pleaseAnswer': 'Bitte beantworten Sie alle Fragen, um fortzufahren',
    'assessment.viewResults': 'Ergebnisse anzeigen',
    'assessment.saveAndContinue': 'Speichern & Weiter',
    'assessment.previousSection': 'Vorheriger Abschnitt',
    'assessment.nextSection': 'Nächster Abschnitt',
    'assessment.section': 'Abschnitt',
    'assessment.finish': 'Beenden',
    'assessment.answerSaved': 'Antwort gespeichert',
    'assessment.responseRecorded': 'Ihre Antwort wurde aufgezeichnet.',
    'assessment.incomplete': 'Bewertung unvollständig',
    'assessment.pleaseAnswerAll': 'Bitte beantworten Sie alle Fragen.',
    'assessment.assessmentComplete': 'Bewertung abgeschlossen!',
    'assessment.resultsReady': 'Ihre Ergebnisse sind zur Überprüfung bereit.',
    
    // Index/Landing Page
    'index.hero.title1': 'Optimieren Sie die Leistung',
    'index.hero.title2': 'und Rentabilität Ihres Autohauses',
    'index.hero.description': 'Umfassende KI-gestützte Bewertung, die Ihre Autohaus-Betriebsabläufe analysiert, Wachstumschancen identifiziert und umsetzbare Erkenntnisse zur Leistungssteigerung in allen Abteilungen liefert.',
    'index.hero.cta': 'Bewertung starten',
    'index.stats.questions': 'Umfassende Fragen',
    'index.stats.areas': 'Wichtige Leistungsbereiche',
    'index.stats.ai': 'KI-gestützte Einblicke',
    'index.problem.title': 'Verschenkt Ihr Autohaus bares Geld?',
    'index.problem.description': 'Die meisten Autohäuser kämpfen mit fragmentierten Prozessen, inkonsistenten Leistungskennzahlen und mangelnden umsetzbaren Erkenntnissen. Ohne einen umfassenden Überblick über Ihre Abläufe ist es unmöglich, die Chancen zu identifizieren, die Ihr Ergebnis erheblich verbessern könnten.',
    'index.solution.title': 'So funktioniert es: Einfach, Schnell, Effektiv',
    'index.solution.subtitle': 'Erhalten Sie umsetzbare Erkenntnisse in drei einfachen Schritten',
    'index.solution.step1.title': 'Bewertung ausfüllen',
    'index.solution.step1.description': 'Beantworten Sie 50+ gezielte Fragen zu Ihren Autohaus-Betriebsabläufen, die Vertrieb, Service, Lagerbestand und Kundenerfahrung abdecken.',
    'index.solution.step2.title': 'KI-Analyse',
    'index.solution.step2.description': 'Unsere KI-Engine analysiert Ihre Antworten im Vergleich zu Branchenbenchmarks und identifiziert spezifische Verbesserungsbereiche.',
    'index.solution.step3.title': 'Umsetzbare Erkenntnisse erhalten',
    'index.solution.step3.description': 'Erhalten Sie einen umfassenden Bericht mit priorisierten Empfehlungen und Umsetzungsstrategien.',
    'index.features.title': 'Leistungsstarke Funktionen für maximale Wirkung',
    'index.features.benchmarking.title': 'Leistungs-Benchmarking',
    'index.features.benchmarking.description': 'Vergleichen Sie Ihr Autohaus mit Branchenstandards und Top-Performern in Ihrer Region.',
    'index.features.department.title': 'Abteilungsanalyse',
    'index.features.department.description': 'Vertiefen Sie sich in Verkauf, Service, Teile und F&I-Abteilungen mit spezifischen Empfehlungen.',
    'index.features.ai.title': 'KI-gestützte Empfehlungen',
    'index.features.ai.description': 'Erhalten Sie priorisierte Handlungsempfehlungen mit klaren Umsetzungsstrategien und erwartetem ROI.',
    'index.features.dashboard.title': 'Interaktives Dashboard',
    'index.features.dashboard.description': 'Visualisieren Sie Ihre Leistung mit Diagrammen, Grafiken und detaillierten Analysen.',
    'index.features.security.title': 'Sicher & Vertraulich',
    'index.features.security.description': 'Ihre Daten sind mit Sicherheit auf Unternehmensniveau geschützt und bleiben vollständig vertraulich.',
    'index.features.reports.title': 'Umfassende Berichte',
    'index.features.reports.description': 'Exportieren Sie detaillierte Berichte für Management-Präsentationen und Teamdiskussionen.',
    'index.cta.title': 'Bereit, das Potenzial Ihres Autohauses freizusetzen?',
    'index.cta.description': 'Starten Sie jetzt Ihre umfassende Bewertung und entdecken Sie die Chancen, die in Ihrem Unternehmen warten.',
    'index.cta.button': 'Bewertung beginnen',
    
    // Section Titles
    'section.newVehicleSales': 'Neuwagenverkaufsleistung',
    'section.usedVehicleSales': 'Gebrauchtwagenverkaufsleistung',
    'section.servicePerformance': 'Serviceleistung',
    'section.partsInventory': 'Teile- und Lagerleistung',
    'section.financialOperations': 'Finanzielle Abläufe & Gesamtleistung',
    
    // Section Descriptions
    'section.newVehicleSales.desc': 'Bewerten Sie Ihre Neuwagenverkaufsprozesse, Leistungskennzahlen und Kundenzufriedenheit',
    'section.usedVehicleSales.desc': 'Beurteilen Sie Ihre Gebrauchtwagenoperationen, Preisstrategien und Marktpositionierung',
    'section.servicePerformance.desc': 'Bewerten Sie die Effizienz Ihrer Serviceabteilung, Kundenzufriedenheit und Rentabilität',
    'section.partsInventory.desc': 'Analysieren Sie die Effizienz Ihrer Teileabteilung, Lagerverwaltung und Rentabilität',
    'section.financialOperations.desc': 'Bewerten Sie die allgemeine finanzielle Gesundheit, betriebliche Effizienz und Unternehmensführung',
    
    // Common
    'common.note': 'Notiz',
    'common.notes': 'Notizen',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.loading': 'Laden...',
    'common.language': 'Sprache',
    'common.english': 'Englisch',
    'common.german': 'Deutsch',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

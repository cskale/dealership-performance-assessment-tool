import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
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
    'assessment.noteSaved': 'Note Saved',
    'assessment.noteAutoSaved': 'Your note has been automatically saved.',
    
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
    
    // Results Page
    'results.title': 'Industrial Assessment Results',
    'results.loading': 'Loading your results...',
    'results.noResults': 'No Results Found',
    'results.completeFirst': 'Please complete the assessment first.',
    'results.completedOn': 'Comprehensive analysis completed on',
    'results.overallScore': 'Overall Performance Score',
    'results.excellent': 'Excellent',
    'results.good': 'Good',
    'results.needsImprovement': 'Needs Improvement',
    'results.retakeAssessment': 'Retake Assessment',
    'results.exportPDF': 'Export PDF',
    'results.exporting': 'Exporting...',
    'results.pdfExported': 'PDF Exported',
    'results.pdfSuccess': 'Your results have been downloaded successfully.',
    'results.exportFailed': 'Export Failed',
    'results.exportError': 'Unable to export PDF. Please try again.',
    'results.assessmentReset': 'Assessment Reset',
    'results.startingFresh': 'Starting fresh assessment...',
    
    // Results Tabs
    'results.tab.executive': 'Executive Summary',
    'results.tab.kpi': 'KPI Analytics',
    'results.tab.maturity': 'Maturity',
    'results.tab.actionPlan': 'Action Plan',
    'results.tab.resources': 'Useful Resources',
    
    // Executive Summary
    'executive.excellentPerformance': 'Excellent Performance',
    'executive.excellentDesc': 'Your dealership demonstrates exceptional operational excellence across key performance areas.',
    'executive.goodPerformance': 'Good Performance',
    'executive.goodDesc': 'Your dealership shows strong performance with opportunities for strategic improvements.',
    'executive.concerningAreas': 'Concerning Areas',
    'executive.concerningDesc': 'Your dealership has notable performance gaps that require focused attention and improvement initiatives.',
    'executive.criticalIssues': 'Critical Issues',
    'executive.criticalDesc': 'Your dealership faces significant operational challenges requiring immediate strategic intervention.',
    'executive.overallScore': 'Overall Score',
    'executive.areasAssessed': 'Areas Assessed',
    'executive.strongAreas': 'Strong Areas',
    'executive.keyStrengths': 'Key Strengths',
    'executive.areasForImprovement': 'Areas for Improvement',
    'executive.noWeaknesses': 'No critical weaknesses identified. Focus on maintaining current performance levels.',
    'executive.strategicActions': 'Strategic Actions',
    'executive.assessmentDetails': 'Assessment Details',
    'executive.completionDate': 'Completion Date',
    'executive.totalQuestions': 'Total Questions',
    'executive.performanceLevel': 'Performance Level',
    'executive.industryComparison': 'Industry Comparison',
    'executive.aboveAverage': 'Above Average',
    'executive.average': 'Average',
    'executive.belowAverage': 'Below Average',
    
    // Executive Summary - Strengths
    'executive.strength.newVehicle': 'New vehicle sales excellence',
    'executive.strength.usedVehicle': 'Strong used vehicle operations',
    'executive.strength.service': 'Service department efficiency',
    'executive.strength.parts': 'Parts inventory optimization',
    'executive.strength.financial': 'Financial process management',
    'executive.strength.relative': 'Relative strength in',
    
    // Executive Summary - Weaknesses
    'executive.weakness.newVehicle': 'New vehicle sales processes',
    'executive.weakness.usedVehicle': 'Used vehicle inventory management',
    'executive.weakness.service': 'Service department operations',
    'executive.weakness.parts': 'Parts procurement and availability',
    'executive.weakness.financial': 'Financial operational efficiency',
    
    // Executive Summary - Recommendations
    'executive.rec.critical1': 'Implement immediate operational restructuring focusing on the lowest-scoring departments',
    'executive.rec.critical2': 'Establish weekly performance review meetings with department heads',
    'executive.rec.critical3': 'Consider bringing in external consultants for rapid improvement initiatives',
    'executive.rec.concerning1': 'Develop 90-day improvement plans for underperforming departments',
    'executive.rec.concerning2': 'Invest in staff training and process optimization',
    'executive.rec.concerning3': 'Implement performance monitoring systems for better visibility',
    'executive.rec.good1': 'Focus on achieving consistency across all departments',
    'executive.rec.good2': 'Implement best practice sharing between high and low performing areas',
    'executive.rec.good3': 'Consider technology upgrades to drive further efficiency gains',
    'executive.rec.excellent1': 'Maintain current excellence while exploring innovative growth opportunities',
    'executive.rec.excellent2': 'Share best practices with industry peers and consider mentoring programs',
    'executive.rec.excellent3': 'Invest in advanced analytics and AI-driven optimization',
    
    // Maturity Scoring
    'maturity.title': 'Overall Maturity Level',
    'maturity.basic': 'Basic',
    'maturity.developing': 'Developing',
    'maturity.mature': 'Mature',
    'maturity.advanced': 'Advanced',
    'maturity.basicDesc': 'Foundational processes in place with significant gaps',
    'maturity.developingDesc': 'Some optimization and standardization implemented',
    'maturity.matureDesc': 'Well-established processes with consistent optimization',
    'maturity.advancedDesc': 'Industry-leading practices with innovation focus',
    'maturity.currentCharacteristics': 'Current Characteristics',
    'maturity.maturityDistribution': 'Maturity Distribution',
    'maturity.currentScore': 'Current Score',
    'maturity.progressTo': 'Progress to',
    'maturity.nextMilestone': 'Next milestone',
    'maturity.level': 'Level',
    'maturity.keyDevelopmentAreas': 'Key Development Areas',
    'maturity.developmentRoadmap': 'Maturity Development Roadmap',
    'maturity.departments': 'departments',
    
    // Maturity Characteristics
    'maturity.char.basic1': 'Manual processes dominate',
    'maturity.char.basic2': 'Limited data-driven decisions',
    'maturity.char.basic3': 'Reactive approach to problems',
    'maturity.char.basic4': 'Inconsistent customer experience',
    'maturity.char.developing1': 'Basic automation in key areas',
    'maturity.char.developing2': 'Some performance metrics tracked',
    'maturity.char.developing3': 'Proactive problem-solving emerging',
    'maturity.char.developing4': 'Customer experience improving',
    'maturity.char.mature1': 'Integrated systems and workflows',
    'maturity.char.mature2': 'Regular performance monitoring',
    'maturity.char.mature3': 'Continuous improvement culture',
    'maturity.char.mature4': 'Strong customer satisfaction',
    'maturity.char.advanced1': 'AI and advanced analytics',
    'maturity.char.advanced2': 'Predictive insights and modeling',
    'maturity.char.advanced3': 'Innovation and experimentation',
    'maturity.char.advanced4': 'Exceptional customer experience',
    
    // KPI Dashboard
    'kpi.title': 'Industrial KPI Analytics Dashboard',
    'kpi.subtitle': 'Real-time performance metrics with European market benchmarks',
    'kpi.performanceScore': 'Performance Score',
    'kpi.benchmark': 'Benchmark',
    'kpi.excellent': 'Excellent',
    'kpi.good': 'Good',
    'kpi.needsFocus': 'Needs Focus',
    'kpi.overallPerformance': 'Overall Dealership Performance',
    'kpi.overallScore': 'Overall Score',
    'kpi.strongAreas': 'Strong Areas',
    'kpi.improvementAreas': 'Improvement Areas',
    'kpi.strategicRecommendations': 'Strategic Recommendations',
    'kpi.focusOnImproving': 'Focus on improving',
    'kpi.throughTraining': 'through targeted training and process optimization',
    'kpi.excellentAcross': 'Excellent performance across all areas! Focus on maintaining excellence and exploring new growth opportunities.',
    
    // KPI Section Titles
    'kpi.section.newVehicle': 'New Vehicle Sales KPIs',
    'kpi.section.usedVehicle': 'Used Vehicle Sales KPIs',
    'kpi.section.service': 'Service Department KPIs',
    'kpi.section.parts': 'Parts & Inventory KPIs',
    'kpi.section.financial': 'Financial Operations KPIs',
    
    // KPI Metrics
    'kpi.monthlyRevenue': 'Monthly Revenue',
    'kpi.averageMargin': 'Average Margin',
    'kpi.customerSatisfaction': 'Customer Satisfaction',
    'kpi.leadConversion': 'Lead Conversion',
    'kpi.turnoverRate': 'Turnover Rate',
    'kpi.laborEfficiency': 'Labor Efficiency',
    'kpi.customerRetention': 'Customer Retention',
    'kpi.averageRO': 'Average RO',
    'kpi.days': 'days',
    'kpi.perYear': '/year',
    
    // Dashboard Page
    'dashboard.title': 'Performance Dashboard',
    'dashboard.subtitle': 'Real-time analytics and insights for your dealership operations',
    'dashboard.exportPDF': 'Export PDF',
    'dashboard.exportExcel': 'Export Excel',
    'dashboard.thisPeriod': 'This Month',
    'dashboard.thisQuarter': 'This Quarter',
    'dashboard.thisYear': 'This Year',
    'dashboard.mainDealership': 'Main Dealership',
    'dashboard.northBranch': 'North Branch',
    'dashboard.southBranch': 'South Branch',
    'dashboard.onTrack': 'On Track',
    'dashboard.needsAttention': 'Needs Attention',
    'dashboard.monthlyOpportunity': 'Monthly Opportunity',
    'dashboard.viewAllRecommendations': 'View All Recommendations',
    
    // Dashboard - AI Insights
    'dashboard.aiInsights': 'AI-Powered Insights & Recommendations',
    'dashboard.insight1.title': 'Optimize Test Drive Conversion',
    'dashboard.insight1.desc': 'Your lead conversion rate is strong, but test drive follow-up speed could improve by 30%. Implement automated SMS reminders within 2 hours of test drives.',
    'dashboard.insight1.impact': 'Expected Impact: +€45k monthly',
    'dashboard.insight2.title': 'Used Vehicle Inventory Optimization',
    'dashboard.insight2.desc': 'Stock turnover is below benchmark. Consider reducing aged inventory (90+ days) by 15% and focusing on high-demand models with faster turnover rates.',
    'dashboard.insight2.impact': 'Expected Impact: +€28k monthly',
    'dashboard.insight3.title': 'Service Department Excellence',
    'dashboard.insight3.desc': 'Your service department is performing excellently. Consider expanding capacity by 20% to capture additional demand and reduce wait times from 3 to 2 days.',
    'dashboard.insight3.impact': 'Expected Impact: +€18k monthly',
    
    // Action Plan
    'actionPlan.title': 'Action Plan',
    'actionPlan.subtitle': 'Strategic initiatives to improve your dealership performance',
    'actionPlan.generateAI': 'Generate AI Actions',
    'actionPlan.generating': 'Generating...',
    'actionPlan.addManual': 'Add Manual Action',
    'actionPlan.addNewAction': 'Add New Action',
    'actionPlan.department': 'Department',
    'actionPlan.priority': 'Priority',
    'actionPlan.actionTitle': 'Action Title',
    'actionPlan.actionDescription': 'Description',
    'actionPlan.responsiblePerson': 'Responsible Person',
    'actionPlan.targetDate': 'Target Completion Date',
    'actionPlan.supportRequired': 'Support Required From',
    'actionPlan.linkedKPIs': 'Linked KPIs',
    'actionPlan.addAction': 'Add Action',
    'actionPlan.cancel': 'Cancel',
    'actionPlan.filterByStatus': 'Filter by status',
    'actionPlan.filterByPriority': 'Filter by priority',
    'actionPlan.allStatus': 'All Status',
    'actionPlan.allPriority': 'All Priority',
    'actionPlan.open': 'Open',
    'actionPlan.inProgress': 'In Progress',
    'actionPlan.completed': 'Completed',
    'actionPlan.critical': 'Critical',
    'actionPlan.high': 'High',
    'actionPlan.medium': 'Medium',
    'actionPlan.low': 'Low',
    'actionPlan.noActions': 'No actions found. Generate AI actions or add manually.',
    'actionPlan.responsible': 'Responsible',
    'actionPlan.targetDateLabel': 'Target Date',
    
    // Useful Resources
    'resources.title': 'Useful Resources & Learning Materials',
    'resources.description': 'Comprehensive guides, metrics, and learning resources tailored to your assessment results. Each section provides implementation guides, key performance metrics, and curated learning materials.',
    'resources.noResources': 'Great job! All departments are performing above 75%. No additional resources needed at this time.',
    'resources.implementationGuide': 'Implementation Guide',
    'resources.keyMetrics': 'Key Performance Metrics',
    'resources.learningResources': 'Learning Resources',
    'resources.phase': 'Phase',
    'resources.activities': 'Activities',
    'resources.deliverables': 'Deliverables',
    'resources.score': 'Score',
    
    // Resource Types
    'resources.type.course': 'Course',
    'resources.type.video': 'Video',
    'resources.type.article': 'Article',
    'resources.type.webinar': 'Webinar',
    
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
    'assessment.noteSaved': 'Notiz gespeichert',
    'assessment.noteAutoSaved': 'Ihre Notiz wurde automatisch gespeichert.',
    
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
    
    // Results Page
    'results.title': 'Industrielle Bewertungsergebnisse',
    'results.loading': 'Laden Ihrer Ergebnisse...',
    'results.noResults': 'Keine Ergebnisse gefunden',
    'results.completeFirst': 'Bitte schließen Sie zuerst die Bewertung ab.',
    'results.completedOn': 'Umfassende Analyse abgeschlossen am',
    'results.overallScore': 'Gesamtleistungsbewertung',
    'results.excellent': 'Ausgezeichnet',
    'results.good': 'Gut',
    'results.needsImprovement': 'Verbesserungsbedarf',
    'results.retakeAssessment': 'Bewertung wiederholen',
    'results.exportPDF': 'PDF exportieren',
    'results.exporting': 'Exportiere...',
    'results.pdfExported': 'PDF exportiert',
    'results.pdfSuccess': 'Ihre Ergebnisse wurden erfolgreich heruntergeladen.',
    'results.exportFailed': 'Export fehlgeschlagen',
    'results.exportError': 'PDF konnte nicht exportiert werden. Bitte versuchen Sie es erneut.',
    'results.assessmentReset': 'Bewertung zurückgesetzt',
    'results.startingFresh': 'Starte neue Bewertung...',
    
    // Results Tabs
    'results.tab.executive': 'Zusammenfassung',
    'results.tab.kpi': 'KPI-Analytik',
    'results.tab.maturity': 'Reifegrad',
    'results.tab.actionPlan': 'Aktionsplan',
    'results.tab.resources': 'Nützliche Ressourcen',
    
    // Executive Summary
    'executive.excellentPerformance': 'Ausgezeichnete Leistung',
    'executive.excellentDesc': 'Ihr Autohaus zeigt außergewöhnliche operative Exzellenz in allen wichtigen Leistungsbereichen.',
    'executive.goodPerformance': 'Gute Leistung',
    'executive.goodDesc': 'Ihr Autohaus zeigt starke Leistung mit Möglichkeiten für strategische Verbesserungen.',
    'executive.concerningAreas': 'Besorgniserregende Bereiche',
    'executive.concerningDesc': 'Ihr Autohaus hat bemerkenswerte Leistungslücken, die fokussierte Aufmerksamkeit und Verbesserungsinitiativen erfordern.',
    'executive.criticalIssues': 'Kritische Probleme',
    'executive.criticalDesc': 'Ihr Autohaus steht vor erheblichen operativen Herausforderungen, die sofortige strategische Intervention erfordern.',
    'executive.overallScore': 'Gesamtbewertung',
    'executive.areasAssessed': 'Bewertete Bereiche',
    'executive.strongAreas': 'Starke Bereiche',
    'executive.keyStrengths': 'Hauptstärken',
    'executive.areasForImprovement': 'Verbesserungsbereiche',
    'executive.noWeaknesses': 'Keine kritischen Schwächen identifiziert. Konzentrieren Sie sich auf die Aufrechterhaltung des aktuellen Leistungsniveaus.',
    'executive.strategicActions': 'Strategische Maßnahmen',
    'executive.assessmentDetails': 'Bewertungsdetails',
    'executive.completionDate': 'Abschlussdatum',
    'executive.totalQuestions': 'Gesamtfragen',
    'executive.performanceLevel': 'Leistungsniveau',
    'executive.industryComparison': 'Branchenvergleich',
    'executive.aboveAverage': 'Überdurchschnittlich',
    'executive.average': 'Durchschnittlich',
    'executive.belowAverage': 'Unterdurchschnittlich',
    
    // Executive Summary - Strengths
    'executive.strength.newVehicle': 'Exzellenz im Neuwagenverkauf',
    'executive.strength.usedVehicle': 'Starke Gebrauchtwagenoperationen',
    'executive.strength.service': 'Effizienz der Serviceabteilung',
    'executive.strength.parts': 'Teilebestandsoptimierung',
    'executive.strength.financial': 'Finanzprozessmanagement',
    'executive.strength.relative': 'Relative Stärke in',
    
    // Executive Summary - Weaknesses
    'executive.weakness.newVehicle': 'Neuwagenverkaufsprozesse',
    'executive.weakness.usedVehicle': 'Gebrauchtwagenbestandsmanagement',
    'executive.weakness.service': 'Serviceabteilungsoperationen',
    'executive.weakness.parts': 'Teilebeschaffung und Verfügbarkeit',
    'executive.weakness.financial': 'Finanzielle Betriebseffizienz',
    
    // Executive Summary - Recommendations
    'executive.rec.critical1': 'Sofortige operative Umstrukturierung mit Fokus auf die am niedrigsten bewerteten Abteilungen implementieren',
    'executive.rec.critical2': 'Wöchentliche Leistungsüberprüfungsmeetings mit Abteilungsleitern etablieren',
    'executive.rec.critical3': 'Externe Berater für schnelle Verbesserungsinitiativen in Betracht ziehen',
    'executive.rec.concerning1': '90-Tage-Verbesserungspläne für unterperformende Abteilungen entwickeln',
    'executive.rec.concerning2': 'In Mitarbeiterschulung und Prozessoptimierung investieren',
    'executive.rec.concerning3': 'Leistungsüberwachungssysteme für bessere Transparenz implementieren',
    'executive.rec.good1': 'Auf Konsistenz in allen Abteilungen fokussieren',
    'executive.rec.good2': 'Best-Practice-Austausch zwischen hoch- und niedrigperformenden Bereichen implementieren',
    'executive.rec.good3': 'Technologie-Upgrades für weitere Effizienzgewinne in Betracht ziehen',
    'executive.rec.excellent1': 'Aktuelle Exzellenz beibehalten und innovative Wachstumsmöglichkeiten erkunden',
    'executive.rec.excellent2': 'Best Practices mit Branchenkollegen teilen und Mentoring-Programme in Betracht ziehen',
    'executive.rec.excellent3': 'In fortgeschrittene Analytik und KI-gesteuerte Optimierung investieren',
    
    // Maturity Scoring
    'maturity.title': 'Gesamtreifegradniveau',
    'maturity.basic': 'Grundlegend',
    'maturity.developing': 'Entwickelnd',
    'maturity.mature': 'Ausgereift',
    'maturity.advanced': 'Fortgeschritten',
    'maturity.basicDesc': 'Grundlegende Prozesse vorhanden mit erheblichen Lücken',
    'maturity.developingDesc': 'Einige Optimierung und Standardisierung implementiert',
    'maturity.matureDesc': 'Gut etablierte Prozesse mit konsistenter Optimierung',
    'maturity.advancedDesc': 'Branchenführende Praktiken mit Innovationsfokus',
    'maturity.currentCharacteristics': 'Aktuelle Merkmale',
    'maturity.maturityDistribution': 'Reifegradverteilung',
    'maturity.currentScore': 'Aktuelle Bewertung',
    'maturity.progressTo': 'Fortschritt zu',
    'maturity.nextMilestone': 'Nächster Meilenstein',
    'maturity.level': 'Niveau',
    'maturity.keyDevelopmentAreas': 'Wichtige Entwicklungsbereiche',
    'maturity.developmentRoadmap': 'Reifegrad-Entwicklungsfahrplan',
    'maturity.departments': 'Abteilungen',
    
    // Maturity Characteristics
    'maturity.char.basic1': 'Manuelle Prozesse dominieren',
    'maturity.char.basic2': 'Begrenzte datengesteuerte Entscheidungen',
    'maturity.char.basic3': 'Reaktiver Ansatz bei Problemen',
    'maturity.char.basic4': 'Inkonsistente Kundenerfahrung',
    'maturity.char.developing1': 'Grundlegende Automatisierung in Schlüsselbereichen',
    'maturity.char.developing2': 'Einige Leistungskennzahlen werden verfolgt',
    'maturity.char.developing3': 'Proaktive Problemlösung entsteht',
    'maturity.char.developing4': 'Kundenerfahrung verbessert sich',
    'maturity.char.mature1': 'Integrierte Systeme und Workflows',
    'maturity.char.mature2': 'Regelmäßige Leistungsüberwachung',
    'maturity.char.mature3': 'Kultur der kontinuierlichen Verbesserung',
    'maturity.char.mature4': 'Hohe Kundenzufriedenheit',
    'maturity.char.advanced1': 'KI und fortgeschrittene Analytik',
    'maturity.char.advanced2': 'Prädiktive Erkenntnisse und Modellierung',
    'maturity.char.advanced3': 'Innovation und Experimentierung',
    'maturity.char.advanced4': 'Außergewöhnliche Kundenerfahrung',
    
    // KPI Dashboard
    'kpi.title': 'Industrielles KPI-Analyse-Dashboard',
    'kpi.subtitle': 'Echtzeit-Leistungskennzahlen mit europäischen Marktbenchmarks',
    'kpi.performanceScore': 'Leistungsbewertung',
    'kpi.benchmark': 'Benchmark',
    'kpi.excellent': 'Ausgezeichnet',
    'kpi.good': 'Gut',
    'kpi.needsFocus': 'Fokus erforderlich',
    'kpi.overallPerformance': 'Gesamtleistung des Autohauses',
    'kpi.overallScore': 'Gesamtbewertung',
    'kpi.strongAreas': 'Starke Bereiche',
    'kpi.improvementAreas': 'Verbesserungsbereiche',
    'kpi.strategicRecommendations': 'Strategische Empfehlungen',
    'kpi.focusOnImproving': 'Fokus auf Verbesserung',
    'kpi.throughTraining': 'durch gezieltes Training und Prozessoptimierung',
    'kpi.excellentAcross': 'Ausgezeichnete Leistung in allen Bereichen! Fokus auf Aufrechterhaltung der Exzellenz und Erkundung neuer Wachstumsmöglichkeiten.',
    
    // KPI Section Titles
    'kpi.section.newVehicle': 'Neuwagen-KPIs',
    'kpi.section.usedVehicle': 'Gebrauchtwagen-KPIs',
    'kpi.section.service': 'Service-KPIs',
    'kpi.section.parts': 'Teile & Lager-KPIs',
    'kpi.section.financial': 'Finanz-KPIs',
    
    // KPI Metrics
    'kpi.monthlyRevenue': 'Monatsumsatz',
    'kpi.averageMargin': 'Durchschnittliche Marge',
    'kpi.customerSatisfaction': 'Kundenzufriedenheit',
    'kpi.leadConversion': 'Lead-Konvertierung',
    'kpi.turnoverRate': 'Umschlagsrate',
    'kpi.laborEfficiency': 'Arbeitseffizienz',
    'kpi.customerRetention': 'Kundenbindung',
    'kpi.averageRO': 'Durchschnittlicher RO',
    'kpi.days': 'Tage',
    'kpi.perYear': '/Jahr',
    
    // Dashboard Page
    'dashboard.title': 'Leistungs-Dashboard',
    'dashboard.subtitle': 'Echtzeit-Analytik und Einblicke für Ihre Autohaus-Operationen',
    'dashboard.exportPDF': 'PDF exportieren',
    'dashboard.exportExcel': 'Excel exportieren',
    'dashboard.thisPeriod': 'Dieser Monat',
    'dashboard.thisQuarter': 'Dieses Quartal',
    'dashboard.thisYear': 'Dieses Jahr',
    'dashboard.mainDealership': 'Hauptautohaus',
    'dashboard.northBranch': 'Niederlassung Nord',
    'dashboard.southBranch': 'Niederlassung Süd',
    'dashboard.onTrack': 'Auf Kurs',
    'dashboard.needsAttention': 'Erfordert Aufmerksamkeit',
    'dashboard.monthlyOpportunity': 'Monatliche Chance',
    'dashboard.viewAllRecommendations': 'Alle Empfehlungen anzeigen',
    
    // Dashboard - AI Insights
    'dashboard.aiInsights': 'KI-gestützte Einblicke & Empfehlungen',
    'dashboard.insight1.title': 'Probefahrt-Konvertierung optimieren',
    'dashboard.insight1.desc': 'Ihre Lead-Konvertierungsrate ist stark, aber die Geschwindigkeit der Probefahrt-Nachverfolgung könnte um 30% verbessert werden. Implementieren Sie automatisierte SMS-Erinnerungen innerhalb von 2 Stunden nach Probefahrten.',
    'dashboard.insight1.impact': 'Erwartete Auswirkung: +45.000€ monatlich',
    'dashboard.insight2.title': 'Gebrauchtwagen-Bestandsoptimierung',
    'dashboard.insight2.desc': 'Der Lagerumschlag liegt unter dem Benchmark. Erwägen Sie, den gealterten Bestand (90+ Tage) um 15% zu reduzieren und sich auf stark nachgefragte Modelle mit schnelleren Umschlagsraten zu konzentrieren.',
    'dashboard.insight2.impact': 'Erwartete Auswirkung: +28.000€ monatlich',
    'dashboard.insight3.title': 'Exzellenz der Serviceabteilung',
    'dashboard.insight3.desc': 'Ihre Serviceabteilung erbringt ausgezeichnete Leistungen. Erwägen Sie, die Kapazität um 20% zu erweitern, um zusätzliche Nachfrage zu erfassen und die Wartezeiten von 3 auf 2 Tage zu reduzieren.',
    'dashboard.insight3.impact': 'Erwartete Auswirkung: +18.000€ monatlich',
    
    // Action Plan
    'actionPlan.title': 'Aktionsplan',
    'actionPlan.subtitle': 'Strategische Initiativen zur Verbesserung der Leistung Ihres Autohauses',
    'actionPlan.generateAI': 'KI-Aktionen generieren',
    'actionPlan.generating': 'Generiere...',
    'actionPlan.addManual': 'Manuelle Aktion hinzufügen',
    'actionPlan.addNewAction': 'Neue Aktion hinzufügen',
    'actionPlan.department': 'Abteilung',
    'actionPlan.priority': 'Priorität',
    'actionPlan.actionTitle': 'Aktionstitel',
    'actionPlan.actionDescription': 'Beschreibung',
    'actionPlan.responsiblePerson': 'Verantwortliche Person',
    'actionPlan.targetDate': 'Zielabschlussdatum',
    'actionPlan.supportRequired': 'Unterstützung erforderlich von',
    'actionPlan.linkedKPIs': 'Verknüpfte KPIs',
    'actionPlan.addAction': 'Aktion hinzufügen',
    'actionPlan.cancel': 'Abbrechen',
    'actionPlan.filterByStatus': 'Nach Status filtern',
    'actionPlan.filterByPriority': 'Nach Priorität filtern',
    'actionPlan.allStatus': 'Alle Status',
    'actionPlan.allPriority': 'Alle Prioritäten',
    'actionPlan.open': 'Offen',
    'actionPlan.inProgress': 'In Bearbeitung',
    'actionPlan.completed': 'Abgeschlossen',
    'actionPlan.critical': 'Kritisch',
    'actionPlan.high': 'Hoch',
    'actionPlan.medium': 'Mittel',
    'actionPlan.low': 'Niedrig',
    'actionPlan.noActions': 'Keine Aktionen gefunden. Generieren Sie KI-Aktionen oder fügen Sie manuell hinzu.',
    'actionPlan.responsible': 'Verantwortlich',
    'actionPlan.targetDateLabel': 'Zieldatum',
    
    // Useful Resources
    'resources.title': 'Nützliche Ressourcen & Lernmaterialien',
    'resources.description': 'Umfassende Leitfäden, Kennzahlen und Lernressourcen, die auf Ihre Bewertungsergebnisse zugeschnitten sind. Jeder Abschnitt bietet Implementierungsleitfäden, wichtige Leistungskennzahlen und kuratierte Lernmaterialien.',
    'resources.noResources': 'Großartig! Alle Abteilungen liegen über 75%. Derzeit sind keine zusätzlichen Ressourcen erforderlich.',
    'resources.implementationGuide': 'Implementierungsleitfaden',
    'resources.keyMetrics': 'Wichtige Leistungskennzahlen',
    'resources.learningResources': 'Lernressourcen',
    'resources.phase': 'Phase',
    'resources.activities': 'Aktivitäten',
    'resources.deliverables': 'Ergebnisse',
    'resources.score': 'Bewertung',
    
    // Resource Types
    'resources.type.course': 'Kurs',
    'resources.type.video': 'Video',
    'resources.type.article': 'Artikel',
    'resources.type.webinar': 'Webinar',
    
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
    // Initial: check localStorage first
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'en';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load language from user profile on auth state change
  useEffect(() => {
    const loadLanguageFromProfile = async (uid: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('user_id', uid)
          .maybeSingle();

        if (!error && profile?.preferred_language) {
          const profileLang = profile.preferred_language as Language;
          if (profileLang === 'en' || profileLang === 'de') {
            setLanguageState(profileLang);
            localStorage.setItem('app_language', profileLang);
          }
        }
      } catch (err) {
        console.error('Error loading language preference:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        loadLanguageFromProfile(session.user.id);
      } else {
        setUserId(null);
        setIsLoading(false);
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        loadLanguageFromProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);

    // Save to user profile if logged in
    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({ preferred_language: lang })
          .eq('user_id', userId);
      } catch (err) {
        console.error('Error saving language preference:', err);
      }
    }
  }, [userId]);

  const t = useCallback((key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
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

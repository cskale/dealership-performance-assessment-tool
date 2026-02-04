import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, Shield, Lock, CheckCircle, Sparkles, BarChart3, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { CATEGORY_WEIGHTS } from "@/lib/scoringEngine";

export default function Methodology() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Assessment Methodology",
      subtitle: "How we measure and score your dealership performance",
      executiveSummary: "This assessment evaluates dealership performance across predefined operational areas using a structured, question-based framework. Results are based on user-provided inputs and predefined scoring logic.",
      overview: {
        title: "What the Assessment Measures",
        paragraphs: [
          "This assessment evaluates your dealership across five core business areas: New Vehicle Sales, Used Vehicle Sales, Service Performance, Parts & Inventory, and Financial Operations.",
          "Each area contains 10 carefully designed questions that assess operational excellence, customer satisfaction, and efficiency metrics relevant to that department."
        ]
      },
      scoring: {
        title: "How Scoring Works",
        categoryWeights: "Category Weights",
        categoryIntro: "Your responses are converted into scores (0-100) and weighted by business impact to produce an overall performance rating:",
        exampleTitle: "Example Calculation",
        categories: {
          newVehicleSales: "New Vehicle Sales",
          usedVehicleSales: "Used Vehicle Sales",
          servicePerformance: "Service Performance",
          financialOperations: "Financial Operations",
          partsInventory: "Parts & Inventory"
        }
      },
      interpretation: {
        title: "How to Interpret Results",
        levels: [
          { range: "85-100%", level: "Advanced", description: "Industry-leading performance with optimized processes and excellent results" },
          { range: "70-84%", level: "Mature", description: "Strong performance with room for targeted improvements" },
          { range: "50-69%", level: "Developing", description: "Foundational processes in place but significant improvement opportunities exist" },
          { range: "0-49%", level: "Basic", description: "Immediate attention required to address operational challenges" }
        ]
      },
      context: {
        title: "Dealer Context",
        intro: "To provide relevant feedback, we collect basic information about your dealership:",
        items: [
          "Brand represented (e.g., BMW, Audi, Toyota)",
          "Market type (urban, suburban, or rural)",
          "Annual unit sales volume",
          "Optional: financial metrics for personalization"
        ],
        privacy: "This data is stored securely and used only to personalize your results. We do not share individual dealer data with third parties."
      },
      security: {
        title: "Data Privacy & Security",
        protected: {
          title: "Your Data is Protected",
          items: ["End-to-end encryption", "GDPR compliant", "Secure database (Supabase)", "Row-level security enabled"]
        },
        control: {
          title: "You Control Access",
          items: ["Only you see your results", "No data sold to third parties", "Delete your data anytime", "Export your results"]
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        items: [
          {
            question: "How is the assessment scored?",
            answer: "Your dealership performance is evaluated across five weighted business areas: New Vehicle Sales (25%), Used Vehicle Sales (20%), Service Performance (20%), Financial Operations (20%), and Parts & Inventory (15%). Each area contains 10 questions scored 0-100, with responses converted to a weighted score. Your overall score is the sum of all weighted area scores."
          },
          {
            question: "How long does the assessment take?",
            answer: "The assessment typically takes 15-20 minutes to complete. You can save your progress and return later if needed. All 50 questions are designed to be answered based on readily available information about your dealership operations."
          },
          {
            question: "Who should complete the assessment?",
            answer: "The assessment is designed for dealer principals, general managers, department heads, or performance coaches who have comprehensive knowledge of dealership operations across all departments. For the most accurate results, involve relevant department managers in gathering the necessary information."
          },
          {
            question: "How should dealerships use the results?",
            answer: "Results provide a baseline performance snapshot and identify priority areas for improvement. Use the Executive Summary for strategic planning, KPI Analytics for operational insights, and the Action Plan to track improvement initiatives. We recommend sharing relevant sections with department heads to align improvement efforts."
          },
          {
            question: "Can results be compared across time?",
            answer: "Yes. We recommend quarterly assessments to track improvement over time. Your historical scores are saved for comparison, allowing you to measure progress and identify trends in your dealership's performance evolution."
          },
          {
            question: "Are results stored securely?",
            answer: "Yes. All assessment data is encrypted at rest and in transit. We use Supabase with row-level security, ensuring only you can access your results. We are GDPR compliant and do not share individual dealer data with any third parties."
          },
          {
            question: "What do the maturity levels mean?",
            answer: "Maturity levels categorize your overall operational sophistication: Basic (0-49%) indicates foundational processes needing attention, Developing (50-69%) shows established processes with improvement opportunities, Mature (70-84%) reflects strong performance, and Advanced (85-100%) represents industry-leading excellence."
          },
          {
            question: "How often should assessments be completed?",
            answer: "We recommend completing the assessment quarterly to track progress and identify emerging issues. Major organizational changes (new management, acquisitions, brand changes) warrant an immediate reassessment to establish a new baseline."
          },
          {
            question: "Can I retake the assessment?",
            answer: "Yes. You can retake the assessment at any time. We retain your previous results for comparison, allowing you to track improvement over multiple assessment cycles."
          },
          {
            question: "What if I disagree with my score?",
            answer: "Scores are calculated algorithmically based on your responses. If you believe there's an error, first review your answers to ensure accuracy. Remember that results are based on user-provided inputs and predefined scoring logic. Contact support if you need assistance interpreting your results."
          }
        ]
      },
      cta: {
        title: "Ready to assess your dealership?",
        button: "Start Assessment"
      }
    },
    de: {
      title: "Bewertungsmethodik",
      subtitle: "Wie wir die Leistung Ihres Autohauses messen und bewerten",
      executiveSummary: "Diese Bewertung evaluiert die Autohausleistung in vordefinierten Betriebsbereichen unter Verwendung eines strukturierten, fragenbasierten Rahmens. Die Ergebnisse basieren auf vom Benutzer bereitgestellten Eingaben und vordefinierter Bewertungslogik.",
      overview: {
        title: "Was die Bewertung misst",
        paragraphs: [
          "Diese Bewertung evaluiert Ihr Autohaus in fünf Kerngeschäftsbereichen: Neuwagenverkauf, Gebrauchtwagenverkauf, Serviceleistung, Teile & Lager und Finanzoperationen.",
          "Jeder Bereich enthält 10 sorgfältig gestaltete Fragen, die operationelle Exzellenz, Kundenzufriedenheit und Effizienzkennzahlen für diese Abteilung bewerten."
        ]
      },
      scoring: {
        title: "Wie die Bewertung funktioniert",
        categoryWeights: "Kategoriegewichtungen",
        categoryIntro: "Ihre Antworten werden in Punkte (0-100) umgewandelt und nach Geschäftsauswirkung gewichtet, um eine Gesamtleistungsbewertung zu erstellen:",
        exampleTitle: "Berechnungsbeispiel",
        categories: {
          newVehicleSales: "Neuwagenverkauf",
          usedVehicleSales: "Gebrauchtwagenverkauf",
          servicePerformance: "Serviceleistung",
          financialOperations: "Finanzoperationen",
          partsInventory: "Teile & Lager"
        }
      },
      interpretation: {
        title: "Wie Ergebnisse zu interpretieren sind",
        levels: [
          { range: "85-100%", level: "Fortgeschritten", description: "Branchenführende Leistung mit optimierten Prozessen und ausgezeichneten Ergebnissen" },
          { range: "70-84%", level: "Ausgereift", description: "Starke Leistung mit Raum für gezielte Verbesserungen" },
          { range: "50-69%", level: "Entwickelnd", description: "Grundprozesse vorhanden, aber signifikante Verbesserungsmöglichkeiten" },
          { range: "0-49%", level: "Basis", description: "Sofortige Aufmerksamkeit erforderlich zur Behebung operativer Herausforderungen" }
        ]
      },
      context: {
        title: "Händlerkontext",
        intro: "Um relevantes Feedback zu geben, erfassen wir grundlegende Informationen über Ihr Autohaus:",
        items: [
          "Vertretene Marke (z.B. BMW, Audi, Toyota)",
          "Markttyp (städtisch, vorstädtisch oder ländlich)",
          "Jährliches Verkaufsvolumen",
          "Optional: Finanzkennzahlen für Personalisierung"
        ],
        privacy: "Diese Daten werden sicher gespeichert und nur zur Personalisierung Ihrer Ergebnisse verwendet. Wir geben keine individuellen Händlerdaten an Dritte weiter."
      },
      security: {
        title: "Datenschutz & Sicherheit",
        protected: {
          title: "Ihre Daten sind geschützt",
          items: ["Ende-zu-Ende-Verschlüsselung", "DSGVO-konform", "Sichere Datenbank (Supabase)", "Zugriffssteuerung auf Zeilenebene"]
        },
        control: {
          title: "Sie kontrollieren den Zugang",
          items: ["Nur Sie sehen Ihre Ergebnisse", "Keine Daten an Dritte verkauft", "Löschen Sie Ihre Daten jederzeit", "Exportieren Sie Ihre Ergebnisse"]
        }
      },
      faq: {
        title: "Häufig gestellte Fragen",
        items: [
          {
            question: "Wie wird die Bewertung berechnet?",
            answer: "Ihre Autohausleistung wird in fünf gewichteten Geschäftsbereichen bewertet: Neuwagenverkauf (25%), Gebrauchtwagenverkauf (20%), Serviceleistung (20%), Finanzoperationen (20%) und Teile & Lager (15%). Jeder Bereich enthält 10 Fragen mit 0-100 Punkten. Ihre Gesamtpunktzahl ist die Summe aller gewichteten Bereichspunkte."
          },
          {
            question: "Wie lange dauert die Bewertung?",
            answer: "Die Bewertung dauert in der Regel 15-20 Minuten. Sie können Ihren Fortschritt speichern und später fortfahren. Alle 50 Fragen sind so gestaltet, dass sie anhand leicht verfügbarer Informationen über Ihren Autohausbetrieb beantwortet werden können."
          },
          {
            question: "Wer sollte die Bewertung durchführen?",
            answer: "Die Bewertung ist für Händlerprinzipale, Geschäftsführer, Abteilungsleiter oder Leistungscoaches konzipiert, die umfassende Kenntnisse über den Autohausbetrieb in allen Abteilungen haben. Für die genauesten Ergebnisse beziehen Sie relevante Abteilungsleiter in die Informationssammlung ein."
          },
          {
            question: "Wie sollten Autohäuser die Ergebnisse nutzen?",
            answer: "Die Ergebnisse bieten eine Leistungsgrundlage und identifizieren Prioritätsbereiche für Verbesserungen. Nutzen Sie die Executive Summary für die strategische Planung, die KPI-Analytik für operative Einblicke und den Aktionsplan zur Verfolgung von Verbesserungsinitiativen."
          },
          {
            question: "Können Ergebnisse über die Zeit verglichen werden?",
            answer: "Ja. Wir empfehlen vierteljährliche Bewertungen zur Fortschrittsverfolgung. Ihre historischen Ergebnisse werden zum Vergleich gespeichert, sodass Sie den Fortschritt messen und Trends in der Leistungsentwicklung Ihres Autohauses erkennen können."
          },
          {
            question: "Werden Ergebnisse sicher gespeichert?",
            answer: "Ja. Alle Bewertungsdaten sind im Ruhezustand und bei der Übertragung verschlüsselt. Wir verwenden Supabase mit Sicherheit auf Zeilenebene, sodass nur Sie auf Ihre Ergebnisse zugreifen können. Wir sind DSGVO-konform und geben keine individuellen Händlerdaten an Dritte weiter."
          },
          {
            question: "Was bedeuten die Reifestufen?",
            answer: "Reifestufen kategorisieren Ihre operative Raffinesse: Basis (0-49%) zeigt grundlegende Prozesse an, Entwickelnd (50-69%) zeigt etablierte Prozesse mit Verbesserungsmöglichkeiten, Ausgereift (70-84%) reflektiert starke Leistung, und Fortgeschritten (85-100%) repräsentiert branchenführende Exzellenz."
          },
          {
            question: "Wie oft sollten Bewertungen durchgeführt werden?",
            answer: "Wir empfehlen vierteljährliche Bewertungen zur Fortschrittsverfolgung. Größere organisatorische Änderungen (neues Management, Übernahmen, Markenwechsel) erfordern eine sofortige Neubewertung zur Etablierung einer neuen Basislinie."
          },
          {
            question: "Kann ich die Bewertung wiederholen?",
            answer: "Ja. Sie können die Bewertung jederzeit wiederholen. Wir behalten Ihre vorherigen Ergebnisse zum Vergleich, sodass Sie Verbesserungen über mehrere Bewertungszyklen verfolgen können."
          },
          {
            question: "Was wenn ich mit meiner Punktzahl nicht einverstanden bin?",
            answer: "Punktzahlen werden algorithmisch basierend auf Ihren Antworten berechnet. Wenn Sie einen Fehler vermuten, überprüfen Sie zuerst Ihre Antworten. Denken Sie daran, dass die Ergebnisse auf Benutzereingaben und vordefinierter Bewertungslogik basieren. Kontaktieren Sie den Support, wenn Sie Hilfe bei der Interpretation benötigen."
          }
        ]
      },
      cta: {
        title: "Bereit, Ihr Autohaus zu bewerten?",
        button: "Bewertung starten"
      }
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  // Example calculation
  const exampleScores = {
    newVehicleSales: { score: 65, weight: CATEGORY_WEIGHTS.newVehicleSales },
    usedVehicleSales: { score: 70, weight: CATEGORY_WEIGHTS.usedVehicleSales },
    servicePerformance: { score: 78, weight: CATEGORY_WEIGHTS.servicePerformance },
    financialOperations: { score: 58, weight: CATEGORY_WEIGHTS.financialOperations },
    partsInventory: { score: 52, weight: CATEGORY_WEIGHTS.partsInventory }
  };

  const overallExample = Object.values(exampleScores).reduce((sum, cat) => sum + (cat.score * cat.weight), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Minimal Header - Only Back to Home button */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
          </Button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section - Matching Home Page Style */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">
            <Sparkles className="h-3 w-3 mr-1 inline" />
            {language === 'de' ? 'Transparente Methodik' : 'Transparent Methodology'}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Executive Summary Block */}
        <Card className="mb-8 shadow-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <p className="text-lg text-foreground leading-relaxed font-medium">
              {t.executiveSummary}
            </p>
          </CardContent>
        </Card>

        {/* What the Assessment Measures */}
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              {t.overview.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {t.overview.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>

        {/* How Scoring Works */}
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              {t.scoring.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Category Weights */}
            <div>
              <h3 className="text-lg font-semibold mb-2">{t.scoring.categoryWeights}</h3>
              <p className="text-muted-foreground mb-4">{t.scoring.categoryIntro}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(CATEGORY_WEIGHTS).map(([key, weight]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border">
                    <span className="font-medium">
                      {t.scoring.categories[key as keyof typeof t.scoring.categories]}
                    </span>
                    <Badge variant="secondary" className="text-base px-3 py-1 font-bold">
                      {Math.round(weight * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Calculation */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">{t.scoring.exampleTitle}</h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 font-mono text-sm space-y-2 border">
                {Object.entries(exampleScores).map(([key, data]) => (
                  <p key={key} className="text-muted-foreground">
                    {t.scoring.categories[key as keyof typeof t.scoring.categories]}: {data.score} × {data.weight} = <span className="text-foreground font-semibold">{(data.score * data.weight).toFixed(1)}</span>
                  </p>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <p className="font-bold text-foreground text-lg">
                    {language === 'de' ? 'Gesamtpunktzahl' : 'Overall Score'}: {Math.round(overallExample)}/100
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Interpret Results */}
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              {t.interpretation.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.interpretation.levels.map((level, index) => {
                const colors = [
                  'bg-green-50 border-green-200 dark:bg-green-950/20',
                  'bg-blue-50 border-blue-200 dark:bg-blue-950/20',
                  'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20',
                  'bg-red-50 border-red-200 dark:bg-red-950/20'
                ];
                const badgeColors = [
                  'bg-green-600',
                  'bg-blue-600',
                  'bg-yellow-600',
                  'bg-red-600'
                ];
                return (
                  <div key={index} className={`p-4 rounded-xl border ${colors[index]}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${badgeColors[index]} text-white`}>
                        {level.range}
                      </Badge>
                      <span className="font-semibold">{level.level}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dealer Context */}
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="text-2xl">{t.context.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground">{t.context.intro}</p>
            <ul className="space-y-3">
              {t.context.items.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-4 bg-muted/50 rounded-xl border">
              <p className="text-sm text-muted-foreground italic">
                ⚠️ {t.context.privacy}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Privacy & Security */}
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              {t.security.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-5 border border-green-200">
                <h4 className="font-semibold flex items-center gap-2 mb-4 text-green-800 dark:text-green-300">
                  <Lock className="h-5 w-5" />
                  {t.security.protected.title}
                </h4>
                <ul className="space-y-3">
                  {t.security.protected.items.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-5 border border-blue-200">
                <h4 className="font-semibold flex items-center gap-2 mb-4 text-blue-800 dark:text-blue-300">
                  <Shield className="h-5 w-5" />
                  {t.security.control.title}
                </h4>
                <ul className="space-y-3">
                  {t.security.control.items.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ - 10 Questions */}
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="text-2xl">{t.faq.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'de' ? '10 Fragen beantwortet' : '10 questions answered'}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {t.faq.items.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border rounded-lg px-4 bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 pl-9">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground shadow-xl border-0">
          <CardContent className="p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">{t.cta.title}</h2>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/app/assessment')}
              className="font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              {t.cta.button}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, Shield, Lock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppHeader } from "@/components/AppHeader";
import { CATEGORY_WEIGHTS } from "@/lib/scoringEngine";

export default function Methodology() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Assessment Methodology",
      subtitle: "How we measure and score your dealership performance",
      overview: {
        title: "Overview",
        paragraphs: [
          "This assessment evaluates your dealership across five core business areas. Your responses are converted into scores (0-100) and weighted by business impact to produce an overall performance rating.",
          "The tool is designed for dealer principals, sales managers, and coaches to identify improvement opportunities and track progress over time."
        ]
      },
      scoring: {
        title: "How Scoring Works",
        categoryWeights: "Category Weights",
        categoryIntro: "Not all business areas contribute equally to overall performance:",
        exampleTitle: "Example Calculation",
        categories: {
          newVehicleSales: "New Vehicle Sales",
          usedVehicleSales: "Used Vehicle Sales",
          servicePerformance: "Service Performance",
          financialOperations: "Financial Operations",
          partsInventory: "Parts & Inventory"
        }
      },
      context: {
        title: "Dealer Context",
        intro: "To provide relevant feedback, we collect basic information about your dealership:",
        items: [
          "Brand represented (e.g., BMW, Audi, Toyota)",
          "Market type (urban, suburban, or rural)",
          "Annual unit sales volume",
          "Optional: financial metrics for benchmarking"
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
            question: "How long does the assessment take?",
            answer: "The assessment typically takes 15-20 minutes to complete. You can save your progress and return later if needed."
          },
          {
            question: "Can I retake the assessment?",
            answer: "Yes. We recommend quarterly assessments to track improvement over time. Your historical scores are saved for comparison."
          },
          {
            question: "Who can see my results?",
            answer: "Only you can see your individual results. If you're part of an organization, administrators may see aggregated data, but not tied to your specific dealership."
          },
          {
            question: "How is my score calculated?",
            answer: "Your responses are converted to scores (0-100) per category. These are then weighted by business impact (see \"How Scoring Works\" above) to produce your overall score."
          },
          {
            question: "What if I disagree with my score?",
            answer: "Scores are calculated algorithmically based on your responses. If you believe there's an error, review your answers or contact support for a manual review."
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
      overview: {
        title: "Übersicht",
        paragraphs: [
          "Diese Bewertung evaluiert Ihr Autohaus in fünf Kerngeschäftsbereichen. Ihre Antworten werden in Punkte (0-100) umgewandelt und nach Geschäftsauswirkung gewichtet, um eine Gesamtleistungsbewertung zu erstellen.",
          "Das Tool ist für Händlerprinzipale, Vertriebsleiter und Coaches konzipiert, um Verbesserungsmöglichkeiten zu identifizieren und Fortschritte im Laufe der Zeit zu verfolgen."
        ]
      },
      scoring: {
        title: "Wie die Bewertung funktioniert",
        categoryWeights: "Kategoriegewichtungen",
        categoryIntro: "Nicht alle Geschäftsbereiche tragen gleichermaßen zur Gesamtleistung bei:",
        exampleTitle: "Berechnungsbeispiel",
        categories: {
          newVehicleSales: "Neuwagenverkauf",
          usedVehicleSales: "Gebrauchtwagenverkauf",
          servicePerformance: "Serviceleistung",
          financialOperations: "Finanzoperationen",
          partsInventory: "Teile & Lager"
        }
      },
      context: {
        title: "Händlerkontext",
        intro: "Um relevantes Feedback zu geben, erfassen wir grundlegende Informationen über Ihr Autohaus:",
        items: [
          "Vertretene Marke (z.B. BMW, Audi, Toyota)",
          "Markttyp (städtisch, vorstädtisch oder ländlich)",
          "Jährliches Verkaufsvolumen",
          "Optional: Finanzkennzahlen für Benchmarking"
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
            question: "Wie lange dauert die Bewertung?",
            answer: "Die Bewertung dauert in der Regel 15-20 Minuten. Sie können Ihren Fortschritt speichern und später fortfahren."
          },
          {
            question: "Kann ich die Bewertung wiederholen?",
            answer: "Ja. Wir empfehlen vierteljährliche Bewertungen, um Verbesserungen zu verfolgen. Ihre historischen Ergebnisse werden zum Vergleich gespeichert."
          },
          {
            question: "Wer kann meine Ergebnisse sehen?",
            answer: "Nur Sie können Ihre individuellen Ergebnisse sehen. Wenn Sie Teil einer Organisation sind, können Administratoren aggregierte Daten sehen, aber nicht Ihrem spezifischen Autohaus zugeordnet."
          },
          {
            question: "Wie wird meine Punktzahl berechnet?",
            answer: "Ihre Antworten werden in Punkte (0-100) pro Kategorie umgewandelt. Diese werden dann nach Geschäftsauswirkung gewichtet, um Ihre Gesamtpunktzahl zu ermitteln."
          },
          {
            question: "Was wenn ich mit meiner Punktzahl nicht einverstanden bin?",
            answer: "Punktzahlen werden algorithmisch basierend auf Ihren Antworten berechnet. Wenn Sie einen Fehler vermuten, überprüfen Sie Ihre Antworten oder kontaktieren Sie den Support."
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
        </Button>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{t.overview.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {t.overview.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>

        {/* How Scoring Works */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{t.scoring.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Weights */}
            <div>
              <h3 className="text-lg font-semibold mb-2">{t.scoring.categoryWeights}</h3>
              <p className="text-muted-foreground mb-4">{t.scoring.categoryIntro}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(CATEGORY_WEIGHTS).map(([key, weight]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">
                      {t.scoring.categories[key as keyof typeof t.scoring.categories]}
                    </span>
                    <Badge variant="secondary" className="text-base">
                      {Math.round(weight * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Calculation */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">{t.scoring.exampleTitle}</h3>
              <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm space-y-2">
                {Object.entries(exampleScores).map(([key, data]) => (
                  <p key={key} className="text-muted-foreground">
                    {t.scoring.categories[key as keyof typeof t.scoring.categories]}: {data.score} × {data.weight} = {(data.score * data.weight).toFixed(2)}
                  </p>
                ))}
                <p className="font-bold text-foreground border-t pt-2 mt-2">
                  {language === 'de' ? 'Gesamtpunktzahl' : 'Overall Score'}: {Math.round(overallExample)}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealer Context */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{t.context.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t.context.intro}</p>
            <ul className="space-y-2">
              {t.context.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground/80 italic mt-4">
              {t.context.privacy}
            </p>
          </CardContent>
        </Card>

        {/* Data Privacy & Security */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              {t.security.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Lock className="h-4 w-4 text-green-600" />
                  {t.security.protected.title}
                </h4>
                <ul className="space-y-2">
                  {t.security.protected.items.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-blue-600" />
                  {t.security.control.title}
                </h4>
                <ul className="space-y-2">
                  {t.security.control.items.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{t.faq.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {t.faq.items.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t.cta.title}</h2>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/app/assessment')}
              className="font-semibold"
            >
              {t.cta.button}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Video, FileText, Globe, Target, TrendingUp, Wrench, DollarSign, CheckCircle, BarChart, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface UsefulResourcesProps {
  scores: Record<string, number>;
}

interface DepartmentResource {
  department: string;
  score: number;
  implementationGuide: {
    phase: string;
    duration: string;
    activities: string[];
    deliverables: string[];
  }[];
  keyMetrics: string[];
  learningResources: {
    title: string;
    type: 'Article' | 'Video' | 'Course' | 'Webinar';
  }[];
}

export function UsefulResources({ scores }: UsefulResourcesProps) {
  const { t, language } = useLanguage();

  const generateDepartmentResources = (): DepartmentResource[] => {
    const resources: DepartmentResource[] = [];

    const resourcesData = {
      'new-vehicle-sales': {
        en: {
          department: 'New Vehicle Sales',
          implementationGuide: [
            {
              phase: 'Assessment & Planning',
              duration: '2 weeks',
              activities: ['Evaluate current sales performance', 'Identify skill gaps', 'Design training curriculum'],
              deliverables: ['Skills assessment report', 'Training plan', 'Resource list']
            },
            {
              phase: 'Training Implementation',
              duration: '4 weeks',
              activities: ['Conduct training sessions', 'Practice scenarios', 'Implement coaching'],
              deliverables: ['Trained sales team', 'Performance benchmarks', 'Coaching framework']
            },
            {
              phase: 'Monitoring & Optimization',
              duration: '2 weeks',
              activities: ['Track performance metrics', 'Gather feedback', 'Make adjustments'],
              deliverables: ['Performance reports', 'Optimization plan', 'Ongoing support structure']
            }
          ],
          keyMetrics: ['Closing ratio improvement', 'Customer satisfaction scores', 'Average deal size', 'Lead conversion rate'],
          learningResources: [
            { title: 'Modern Sales Techniques in Automotive Industry', type: 'Course' as const },
            { title: 'Customer Psychology and Buying Behavior', type: 'Article' as const },
            { title: 'Closing Techniques That Work', type: 'Video' as const },
            { title: 'Building Long-term Customer Relationships', type: 'Webinar' as const }
          ]
        },
        de: {
          department: 'Neuwagenverkauf',
          implementationGuide: [
            {
              phase: 'Bewertung & Planung',
              duration: '2 Wochen',
              activities: ['Aktuelle Verkaufsleistung bewerten', 'Qualifikationslücken identifizieren', 'Schulungslehrplan erstellen'],
              deliverables: ['Qualifikationsbewertungsbericht', 'Schulungsplan', 'Ressourcenliste']
            },
            {
              phase: 'Schulungsdurchführung',
              duration: '4 Wochen',
              activities: ['Schulungen durchführen', 'Szenarien üben', 'Coaching implementieren'],
              deliverables: ['Geschultes Verkaufsteam', 'Leistungsbenchmarks', 'Coaching-Rahmen']
            },
            {
              phase: 'Überwachung & Optimierung',
              duration: '2 Wochen',
              activities: ['Leistungskennzahlen verfolgen', 'Feedback sammeln', 'Anpassungen vornehmen'],
              deliverables: ['Leistungsberichte', 'Optimierungsplan', 'Laufende Unterstützungsstruktur']
            }
          ],
          keyMetrics: ['Abschlussquotenverbesserung', 'Kundenzufriedenheitswerte', 'Durchschnittliche Dealgröße', 'Lead-Konvertierungsrate'],
          learningResources: [
            { title: 'Moderne Verkaufstechniken in der Automobilindustrie', type: 'Course' as const },
            { title: 'Kundenpsychologie und Kaufverhalten', type: 'Article' as const },
            { title: 'Erfolgreiche Abschlusstechniken', type: 'Video' as const },
            { title: 'Langfristige Kundenbeziehungen aufbauen', type: 'Webinar' as const }
          ]
        }
      },
      'used-vehicle-sales': {
        en: {
          department: 'Used Vehicle Sales',
          implementationGuide: [
            {
              phase: 'System Selection & Planning',
              duration: '3 weeks',
              activities: ['Evaluate current processes', 'Research solutions', 'Plan implementation'],
              deliverables: ['Vendor selection', 'Implementation timeline', 'Training plan']
            },
            {
              phase: 'Implementation & Integration',
              duration: '6 weeks',
              activities: ['Install software', 'Integrate systems', 'Configure workflows'],
              deliverables: ['Functional system', 'Integrated processes', 'Trained team']
            },
            {
              phase: 'Optimization & Monitoring',
              duration: '3 weeks',
              activities: ['Monitor performance', 'Fine-tune settings', 'Measure results'],
              deliverables: ['Performance reports', 'Optimization recommendations', 'ROI analysis']
            }
          ],
          keyMetrics: ['Inventory turnover rate', 'Days in inventory', 'Gross profit per unit', 'Market pricing accuracy'],
          learningResources: [
            { title: 'Used Vehicle Inventory Best Practices', type: 'Course' as const },
            { title: 'Market-Based Pricing Strategies', type: 'Article' as const },
            { title: 'Technology Solutions for Dealers', type: 'Video' as const },
            { title: 'Inventory Optimization Workshop', type: 'Webinar' as const }
          ]
        },
        de: {
          department: 'Gebrauchtwagenverkauf',
          implementationGuide: [
            {
              phase: 'Systemauswahl & Planung',
              duration: '3 Wochen',
              activities: ['Aktuelle Prozesse bewerten', 'Lösungen recherchieren', 'Implementierung planen'],
              deliverables: ['Anbieterauswahl', 'Implementierungszeitplan', 'Schulungsplan']
            },
            {
              phase: 'Implementierung & Integration',
              duration: '6 Wochen',
              activities: ['Software installieren', 'Systeme integrieren', 'Workflows konfigurieren'],
              deliverables: ['Funktionales System', 'Integrierte Prozesse', 'Geschultes Team']
            },
            {
              phase: 'Optimierung & Überwachung',
              duration: '3 Wochen',
              activities: ['Leistung überwachen', 'Einstellungen optimieren', 'Ergebnisse messen'],
              deliverables: ['Leistungsberichte', 'Optimierungsempfehlungen', 'ROI-Analyse']
            }
          ],
          keyMetrics: ['Lagerumschlagsrate', 'Lagertage', 'Bruttogewinn pro Einheit', 'Marktpreisgenauigkeit'],
          learningResources: [
            { title: 'Best Practices für Gebrauchtwagenbestand', type: 'Course' as const },
            { title: 'Marktbasierte Preisstrategien', type: 'Article' as const },
            { title: 'Technologielösungen für Händler', type: 'Video' as const },
            { title: 'Workshop zur Bestandsoptimierung', type: 'Webinar' as const }
          ]
        }
      },
      'service-performance': {
        en: {
          department: 'Service Performance',
          implementationGuide: [
            {
              phase: 'Process Analysis & Planning',
              duration: '4 weeks',
              activities: ['Map current processes', 'Identify improvement areas', 'Select technology solutions'],
              deliverables: ['Process map', 'Technology roadmap', 'Implementation plan']
            },
            {
              phase: 'Technology Implementation',
              duration: '8 weeks',
              activities: ['Install systems', 'Configure workflows', 'Train staff'],
              deliverables: ['Deployed technology', 'Trained workforce', 'Updated processes']
            },
            {
              phase: 'Performance Monitoring',
              duration: '2 weeks',
              activities: ['Track KPIs', 'Gather feedback', 'Make adjustments'],
              deliverables: ['Performance dashboard', 'Feedback reports', 'Continuous improvement plan']
            }
          ],
          keyMetrics: ['Labor efficiency rate', 'Customer satisfaction scores', 'Technician productivity', 'Service retention rate'],
          learningResources: [
            { title: 'Digital Service Management', type: 'Course' as const },
            { title: 'Customer Experience in Service', type: 'Article' as const },
            { title: 'Technician Productivity Tools', type: 'Video' as const },
            { title: 'Service Department Innovation', type: 'Webinar' as const }
          ]
        },
        de: {
          department: 'Serviceleistung',
          implementationGuide: [
            {
              phase: 'Prozessanalyse & Planung',
              duration: '4 Wochen',
              activities: ['Aktuelle Prozesse abbilden', 'Verbesserungsbereiche identifizieren', 'Technologielösungen auswählen'],
              deliverables: ['Prozesslandkarte', 'Technologie-Roadmap', 'Implementierungsplan']
            },
            {
              phase: 'Technologieimplementierung',
              duration: '8 Wochen',
              activities: ['Systeme installieren', 'Workflows konfigurieren', 'Personal schulen'],
              deliverables: ['Eingesetzte Technologie', 'Geschulte Belegschaft', 'Aktualisierte Prozesse']
            },
            {
              phase: 'Leistungsüberwachung',
              duration: '2 Wochen',
              activities: ['KPIs verfolgen', 'Feedback sammeln', 'Anpassungen vornehmen'],
              deliverables: ['Leistungs-Dashboard', 'Feedback-Berichte', 'Kontinuierlicher Verbesserungsplan']
            }
          ],
          keyMetrics: ['Arbeitseffizienzrate', 'Kundenzufriedenheitswerte', 'Technikerproduktivität', 'Servicebindungsrate'],
          learningResources: [
            { title: 'Digitales Servicemanagement', type: 'Course' as const },
            { title: 'Kundenerfahrung im Service', type: 'Article' as const },
            { title: 'Werkzeuge für Technikerproduktivität', type: 'Video' as const },
            { title: 'Innovation in der Serviceabteilung', type: 'Webinar' as const }
          ]
        }
      },
      'parts-inventory': {
        en: {
          department: 'Parts & Inventory',
          implementationGuide: [
            {
              phase: 'Data Analysis & Planning',
              duration: '2 weeks',
              activities: ['Analyze inventory data', 'Identify patterns', 'Select technology'],
              deliverables: ['Data analysis report', 'Technology selection', 'Implementation plan']
            },
            {
              phase: 'System Implementation',
              duration: '6 weeks',
              activities: ['Deploy analytics platform', 'Configure forecasting', 'Train team'],
              deliverables: ['Operational system', 'Trained staff', 'Optimized processes']
            },
            {
              phase: 'Monitoring & Optimization',
              duration: '2 weeks',
              activities: ['Track performance', 'Fine-tune models', 'Measure ROI'],
              deliverables: ['Performance metrics', 'Optimized models', 'ROI report']
            }
          ],
          keyMetrics: ['Inventory turnover rate', 'Fill rate percentage', 'Carrying cost reduction', 'Obsolete parts percentage'],
          learningResources: [
            { title: 'Parts Inventory Management Best Practices', type: 'Course' as const },
            { title: 'Predictive Analytics in Automotive', type: 'Article' as const },
            { title: 'Inventory Optimization Techniques', type: 'Video' as const },
            { title: 'Parts Department Efficiency', type: 'Webinar' as const }
          ]
        },
        de: {
          department: 'Teile & Lager',
          implementationGuide: [
            {
              phase: 'Datenanalyse & Planung',
              duration: '2 Wochen',
              activities: ['Bestandsdaten analysieren', 'Muster identifizieren', 'Technologie auswählen'],
              deliverables: ['Datenanalysebericht', 'Technologieauswahl', 'Implementierungsplan']
            },
            {
              phase: 'Systemimplementierung',
              duration: '6 Wochen',
              activities: ['Analyseplattform bereitstellen', 'Prognosen konfigurieren', 'Team schulen'],
              deliverables: ['Betriebsfähiges System', 'Geschultes Personal', 'Optimierte Prozesse']
            },
            {
              phase: 'Überwachung & Optimierung',
              duration: '2 Wochen',
              activities: ['Leistung verfolgen', 'Modelle optimieren', 'ROI messen'],
              deliverables: ['Leistungskennzahlen', 'Optimierte Modelle', 'ROI-Bericht']
            }
          ],
          keyMetrics: ['Lagerumschlagsrate', 'Erfüllungsrate', 'Lagerkostenreduzierung', 'Prozentsatz veralteter Teile'],
          learningResources: [
            { title: 'Best Practices für Teilebestandsmanagement', type: 'Course' as const },
            { title: 'Prädiktive Analytik in der Automobilbranche', type: 'Article' as const },
            { title: 'Techniken zur Bestandsoptimierung', type: 'Video' as const },
            { title: 'Effizienz der Teileabteilung', type: 'Webinar' as const }
          ]
        }
      },
      'financial-operations': {
        en: {
          department: 'Financial Operations',
          implementationGuide: [
            {
              phase: 'Process Mapping & Analysis',
              duration: '3 weeks',
              activities: ['Document current processes', 'Identify bottlenecks', 'Plan automation'],
              deliverables: ['Process documentation', 'Automation roadmap', 'Platform selection']
            },
            {
              phase: 'Automation Implementation',
              duration: '7 weeks',
              activities: ['Deploy platform', 'Configure workflows', 'Test processes'],
              deliverables: ['Automated processes', 'Trained team', 'Quality assurance']
            },
            {
              phase: 'Monitoring & Expansion',
              duration: '2 weeks',
              activities: ['Monitor performance', 'Identify additional opportunities', 'Plan expansion'],
              deliverables: ['Performance reports', 'Expansion plan', 'ROI analysis']
            }
          ],
          keyMetrics: ['Process automation rate', 'Error reduction percentage', 'Time savings', 'Cost efficiency improvement'],
          learningResources: [
            { title: 'Financial Process Automation', type: 'Course' as const },
            { title: 'Dealership Financial Management', type: 'Article' as const },
            { title: 'Automation Tools Overview', type: 'Video' as const },
            { title: 'Financial Efficiency Strategies', type: 'Webinar' as const }
          ]
        },
        de: {
          department: 'Finanzoperationen',
          implementationGuide: [
            {
              phase: 'Prozessabbildung & Analyse',
              duration: '3 Wochen',
              activities: ['Aktuelle Prozesse dokumentieren', 'Engpässe identifizieren', 'Automatisierung planen'],
              deliverables: ['Prozessdokumentation', 'Automatisierungs-Roadmap', 'Plattformauswahl']
            },
            {
              phase: 'Automatisierungsimplementierung',
              duration: '7 Wochen',
              activities: ['Plattform bereitstellen', 'Workflows konfigurieren', 'Prozesse testen'],
              deliverables: ['Automatisierte Prozesse', 'Geschultes Team', 'Qualitätssicherung']
            },
            {
              phase: 'Überwachung & Erweiterung',
              duration: '2 Wochen',
              activities: ['Leistung überwachen', 'Zusätzliche Möglichkeiten identifizieren', 'Erweiterung planen'],
              deliverables: ['Leistungsberichte', 'Erweiterungsplan', 'ROI-Analyse']
            }
          ],
          keyMetrics: ['Prozessautomatisierungsrate', 'Fehlerreduzierung', 'Zeitersparnis', 'Kosteneffizienzverbesserung'],
          learningResources: [
            { title: 'Finanzprozessautomatisierung', type: 'Course' as const },
            { title: 'Finanzmanagement für Autohäuser', type: 'Article' as const },
            { title: 'Überblick über Automatisierungswerkzeuge', type: 'Video' as const },
            { title: 'Strategien für finanzielle Effizienz', type: 'Webinar' as const }
          ]
        }
      }
    };

    Object.entries(scores).forEach(([department, score]) => {
      if (score < 75) {
        const data = resourcesData[department as keyof typeof resourcesData];
        if (data) {
          const langData = data[language as 'en' | 'de'] || data.en;
          resources.push({
            ...langData,
            score
          });
        }
      }
    });

    return resources;
  };

  const departmentResources = generateDepartmentResources();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'Course': return BookOpen;
      case 'Video': return Video;
      case 'Article': return FileText;
      case 'Webinar': return Globe;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Course': return 'bg-blue-500';
      case 'Video': return 'bg-purple-500';
      case 'Article': return 'bg-green-500';
      case 'Webinar': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      'Course': { en: 'Course', de: 'Kurs' },
      'Video': { en: 'Video', de: 'Video' },
      'Article': { en: 'Article', de: 'Artikel' },
      'Webinar': { en: 'Webinar', de: 'Webinar' }
    };
    return labels[type]?.[language] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            {t('resources.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            {t('resources.description')}
          </p>
        </CardContent>
      </Card>

      {/* Department Resources */}
      {departmentResources.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {t('resources.noResources')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {departmentResources.map((resource, index) => (
            <Card key={index} className="border-2 shadow-lg bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{resource.department}</CardTitle>
                  <Badge variant={resource.score < 50 ? "destructive" : resource.score < 65 ? "default" : "secondary"} className="text-base px-3 py-1">
                    {t('resources.score')}: {resource.score}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Implementation Guide - Now Accordion */}
                <Accordion type="single" collapsible defaultValue="implementation">
                  <AccordionItem value="implementation" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {t('resources.implementationGuide')}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3 pt-2">
                        {resource.implementationGuide.map((phase, phaseIndex) => (
                          <Card key={phaseIndex} className="border-primary/20">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">{phase.phase}</h4>
                                <Badge variant="outline" className="ml-auto">{phase.duration}</Badge>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h5 className="text-sm font-medium mb-1">{t('resources.activities')}:</h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {phase.activities.map((activity, actIndex) => (
                                      <li key={actIndex} className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        {activity}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium mb-1">{t('resources.deliverables')}:</h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {phase.deliverables.map((deliverable, delIndex) => (
                                      <li key={delIndex} className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        {deliverable}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Key Performance Metrics - Now Accordion */}
                <Accordion type="single" collapsible defaultValue="metrics">
                  <AccordionItem value="metrics" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-primary" />
                        {t('resources.keyMetrics')}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {resource.keyMetrics.map((metric, metricIndex) => (
                          <Card key={metricIndex} className="border-primary/20 bg-primary/5">
                            <CardContent className="p-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-sm font-medium">{metric}</span>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Learning Resources - Now Accordion */}
                <Accordion type="single" collapsible defaultValue="resources">
                  <AccordionItem value="resources" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        {t('resources.learningResources')}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="grid grid-cols-1 gap-2 pt-2">
                        {resource.learningResources.map((learningResource, lrIndex) => {
                          const Icon = getIcon(learningResource.type);
                          return (
                            <Card key={lrIndex} className="border hover:border-primary/50 transition-colors cursor-pointer">
                              <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={cn("p-2 rounded-lg", getTypeColor(learningResource.type))}>
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="font-medium">{learningResource.title}</span>
                                </div>
                                <Badge variant="outline">{getTypeLabel(learningResource.type)}</Badge>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
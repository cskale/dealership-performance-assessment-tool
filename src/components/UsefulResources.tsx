import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Video, FileText, Globe, TrendingUp, CheckCircle, 
  Search, Download, ExternalLink, Clock, Filter, GraduationCap,
  FileSpreadsheet, Presentation, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

interface UsefulResourcesProps {
  scores: Record<string, number>;
}

// Static resource catalog for filtering
const resourceCatalog = {
  en: [
    { id: 1, title: 'Modern Sales Techniques in Automotive', type: 'Course', department: 'new-vehicle-sales', duration: '2 hours', description: 'Comprehensive training on consultative selling and customer engagement' },
    { id: 2, title: 'Customer Psychology and Buying Behavior', type: 'Article', department: 'new-vehicle-sales', duration: '15 min read', description: 'Understanding what drives purchase decisions' },
    { id: 3, title: 'Closing Techniques That Work', type: 'Video', department: 'new-vehicle-sales', duration: '45 min', description: 'Proven strategies for improving close rates' },
    { id: 4, title: 'Used Vehicle Inventory Management', type: 'Course', department: 'used-vehicle-sales', duration: '3 hours', description: 'Optimize inventory turn and reduce days in stock' },
    { id: 5, title: 'Market-Based Pricing Strategies', type: 'Article', department: 'used-vehicle-sales', duration: '20 min read', description: 'Competitive pricing approaches for used vehicles' },
    { id: 6, title: 'Digital Retailing Best Practices', type: 'Webinar', department: 'used-vehicle-sales', duration: '1 hour', description: 'Leveraging technology for used car sales' },
    { id: 7, title: 'Service Department Excellence', type: 'Course', department: 'service-performance', duration: '4 hours', description: 'Improving efficiency and customer satisfaction' },
    { id: 8, title: 'Technician Productivity Guide', type: 'Article', department: 'service-performance', duration: '25 min read', description: 'Maximize billable hours and efficiency' },
    { id: 9, title: 'Customer Retention Strategies', type: 'Video', department: 'service-performance', duration: '30 min', description: 'Building long-term service relationships' },
    { id: 10, title: 'Parts Inventory Optimization', type: 'Course', department: 'parts-inventory', duration: '2.5 hours', description: 'Reduce carrying costs and improve fill rates' },
    { id: 11, title: 'Demand Forecasting Techniques', type: 'Article', department: 'parts-inventory', duration: '18 min read', description: 'Predicting parts demand accurately' },
    { id: 12, title: 'Obsolete Stock Management', type: 'Webinar', department: 'parts-inventory', duration: '45 min', description: 'Strategies to reduce and prevent obsolete inventory' },
    { id: 13, title: 'Dealership Financial Management', type: 'Course', department: 'financial-operations', duration: '5 hours', description: 'Complete financial operations guide' },
    { id: 14, title: 'Cash Flow Optimization', type: 'Article', department: 'financial-operations', duration: '20 min read', description: 'Improving working capital management' },
    { id: 15, title: 'KPI Dashboard Best Practices', type: 'Video', department: 'financial-operations', duration: '40 min', description: 'Building effective performance dashboards' }
  ],
  de: [
    { id: 1, title: 'Moderne Verkaufstechniken in der Automobilbranche', type: 'Kurs', department: 'new-vehicle-sales', duration: '2 Stunden', description: 'Umfassende Schulung zu beratungsbasiertem Verkauf' },
    { id: 2, title: 'Kundenpsychologie und Kaufverhalten', type: 'Artikel', department: 'new-vehicle-sales', duration: '15 Min Lesen', description: 'Verstehen, was Kaufentscheidungen antreibt' },
    { id: 3, title: 'Erfolgreiche Abschlusstechniken', type: 'Video', department: 'new-vehicle-sales', duration: '45 Min', description: 'Bewährte Strategien zur Verbesserung der Abschlussquote' },
    { id: 4, title: 'Gebrauchtwagenbestandsmanagement', type: 'Kurs', department: 'used-vehicle-sales', duration: '3 Stunden', description: 'Optimieren Sie den Lagerumschlag' },
    { id: 5, title: 'Marktbasierte Preisstrategien', type: 'Artikel', department: 'used-vehicle-sales', duration: '20 Min Lesen', description: 'Wettbewerbsfähige Preisansätze' },
    { id: 6, title: 'Digitaler Einzelhandel Best Practices', type: 'Webinar', department: 'used-vehicle-sales', duration: '1 Stunde', description: 'Technologie für Gebrauchtwagenverkauf' },
    { id: 7, title: 'Serviceabteilung Exzellenz', type: 'Kurs', department: 'service-performance', duration: '4 Stunden', description: 'Effizienz und Kundenzufriedenheit verbessern' },
    { id: 8, title: 'Technikerproduktivitätsleitfaden', type: 'Artikel', department: 'service-performance', duration: '25 Min Lesen', description: 'Abrechenbare Stunden maximieren' },
    { id: 9, title: 'Kundenbindungsstrategien', type: 'Video', department: 'service-performance', duration: '30 Min', description: 'Langfristige Servicebeziehungen aufbauen' },
    { id: 10, title: 'Teilebestandsoptimierung', type: 'Kurs', department: 'parts-inventory', duration: '2,5 Stunden', description: 'Lagerkosten reduzieren' },
    { id: 11, title: 'Nachfrageprognosetechniken', type: 'Artikel', department: 'parts-inventory', duration: '18 Min Lesen', description: 'Teilenachfrage genau vorhersagen' },
    { id: 12, title: 'Veraltete Bestandsverwaltung', type: 'Webinar', department: 'parts-inventory', duration: '45 Min', description: 'Strategien zur Reduzierung veralteter Bestände' },
    { id: 13, title: 'Finanzmanagement für Autohäuser', type: 'Kurs', department: 'financial-operations', duration: '5 Stunden', description: 'Kompletter Finanzoperationsleitfaden' },
    { id: 14, title: 'Cashflow-Optimierung', type: 'Artikel', department: 'financial-operations', duration: '20 Min Lesen', description: 'Verbesserung des Working Capital Managements' },
    { id: 15, title: 'KPI Dashboard Best Practices', type: 'Video', department: 'financial-operations', duration: '40 Min', description: 'Effektive Leistungs-Dashboards erstellen' }
  ]
};

// KPI Encyclopedia data
const kpiEncyclopedia = {
  en: [
    { department: 'New Vehicle Sales', kpis: [
      { name: 'Monthly Revenue', definition: 'Total revenue generated from new vehicle sales per month', formula: 'Sum of all new vehicle sale prices', benchmark: '€420,000+', why: 'Primary indicator of sales department health' },
      { name: 'Lead Conversion Rate', definition: 'Percentage of leads that convert to sales', formula: '(Closed Sales / Total Leads) × 100', benchmark: '23%+', why: 'Measures sales team effectiveness' },
      { name: 'Average Transaction Value', definition: 'Average revenue per vehicle sold including F&I', formula: 'Total Revenue / Units Sold', benchmark: '€42,000+', why: 'Indicates upselling success and product mix' },
      { name: 'Customer Satisfaction Score', definition: 'Average rating from post-purchase surveys', formula: 'Sum of ratings / Number of responses', benchmark: '84%+', why: 'Predicts repeat business and referrals' },
      { name: 'Gross Profit Margin', definition: 'Profit percentage after cost of goods sold', formula: '(Revenue - COGS) / Revenue × 100', benchmark: '9.2%+', why: 'Measures pricing and negotiation effectiveness' }
    ]},
    { department: 'Used Vehicle Sales', kpis: [
      { name: 'Days in Inventory', definition: 'Average days a vehicle remains in stock', formula: 'Sum of all vehicle days / Units Sold', benchmark: '<45 days', why: 'Lower is better - reduces depreciation' },
      { name: 'Inventory Turnover', definition: 'How many times inventory sells per year', formula: 'Annual Units Sold / Average Inventory', benchmark: '8x+', why: 'Higher turnover improves cash flow' },
      { name: 'Gross Profit Per Unit', definition: 'Average profit per used vehicle sold', formula: 'Total Gross Profit / Units Sold', benchmark: '€2,500+', why: 'Primary profitability metric' }
    ]},
    { department: 'Service Performance', kpis: [
      { name: 'Labor Efficiency', definition: 'Billable hours vs available hours', formula: '(Billable Hours / Available Hours) × 100', benchmark: '85%+', why: 'Measures technician productivity' },
      { name: 'Workshop Utilization', definition: 'Percentage of capacity being used', formula: '(Actual Jobs / Capacity) × 100', benchmark: '90%+', why: 'Indicates operational efficiency' },
      { name: 'Service Retention', definition: 'Customers returning within 12 months', formula: '(Return Customers / Total) × 100', benchmark: '65%+', why: 'Loyalty and predictable revenue' }
    ]},
    { department: 'Parts & Inventory', kpis: [
      { name: 'Fill Rate', definition: 'Orders fulfilled from stock', formula: '(Fulfilled from Stock / Total Orders) × 100', benchmark: '92%+', why: 'Customer satisfaction and efficiency' },
      { name: 'Obsolete Stock %', definition: 'Inventory with no movement 12+ months', formula: '(Obsolete Value / Total Value) × 100', benchmark: '<5%', why: 'Lower is better - frees up capital' },
      { name: 'Parts Margin', definition: 'Profit margin on parts sales', formula: '(Revenue - Cost) / Revenue × 100', benchmark: '35%+', why: 'Key profit contributor' }
    ]},
    { department: 'Financial Operations', kpis: [
      { name: 'Profit Margin', definition: 'Net profit as percentage of revenue', formula: 'Net Profit / Total Revenue × 100', benchmark: '3%+', why: 'Overall business profitability' },
      { name: 'Cash Flow', definition: 'Net cash movement per month', formula: 'Cash Inflows - Cash Outflows', benchmark: 'Positive', why: 'Critical for operations' },
      { name: 'Expense Ratio', definition: 'Operating expenses vs revenue', formula: 'Operating Expenses / Revenue × 100', benchmark: '<88%', why: 'Lower is better - indicates efficiency' }
    ]}
  ],
  de: [
    { department: 'Neuwagenverkauf', kpis: [
      { name: 'Monatsumsatz', definition: 'Gesamtumsatz aus Neuwagenverkäufen pro Monat', formula: 'Summe aller Neuwagenverkaufspreise', benchmark: '€420.000+', why: 'Primärer Indikator für Verkaufsabteilungsgesundheit' },
      { name: 'Lead-Konvertierungsrate', definition: 'Prozentsatz der Leads, die zu Verkäufen führen', formula: '(Abgeschlossene Verkäufe / Gesamt-Leads) × 100', benchmark: '23%+', why: 'Misst die Effektivität des Verkaufsteams' }
    ]},
    { department: 'Gebrauchtwagenverkauf', kpis: [
      { name: 'Lagertage', definition: 'Durchschnittliche Tage, die ein Fahrzeug auf Lager bleibt', formula: 'Summe aller Fahrzeugtage / Verkaufte Einheiten', benchmark: '<45 Tage', why: 'Niedriger ist besser - reduziert Wertverlust' }
    ]}
  ]
};

// Support materials
const supportMaterials = {
  en: [
    { title: 'Action Plan Template', type: 'Template', description: 'Structured template for improvement initiatives', icon: FileSpreadsheet },
    { title: 'Monthly KPI Tracking Sheet', type: 'Template', description: 'Track key metrics month-over-month', icon: FileSpreadsheet },
    { title: 'Team Meeting Agenda', type: 'Template', description: 'Standard agenda for performance review meetings', icon: Presentation },
    { title: 'Premium Dealership Case Study', type: 'Case Study', description: 'How a BMW dealer improved scores by 35%', icon: Users },
    { title: 'Service Excellence Transformation', type: 'Case Study', description: 'Toyota dealer service department turnaround', icon: Users },
    { title: 'Best Practice Guide: Sales Training', type: 'Guide', description: 'Comprehensive sales training framework', icon: BookOpen }
  ],
  de: [
    { title: 'Aktionsplan-Vorlage', type: 'Vorlage', description: 'Strukturierte Vorlage für Verbesserungsinitiativen', icon: FileSpreadsheet },
    { title: 'Monatliches KPI-Tracking', type: 'Vorlage', description: 'Verfolgen Sie wichtige Kennzahlen', icon: FileSpreadsheet },
    { title: 'Team-Meeting-Agenda', type: 'Vorlage', description: 'Standard-Agenda für Leistungsüberprüfungen', icon: Presentation },
    { title: 'Premium-Autohaus Fallstudie', type: 'Fallstudie', description: 'Wie ein BMW-Händler die Punktzahlen um 35% verbesserte', icon: Users },
    { title: 'Service-Exzellenz-Transformation', type: 'Fallstudie', description: 'Toyota-Händler Serviceabteilung Turnaround', icon: Users },
    { title: 'Best-Practice-Leitfaden: Verkaufsschulung', type: 'Leitfaden', description: 'Umfassendes Verkaufsschulungs-Framework', icon: BookOpen }
  ]
};

export function UsefulResources({ scores }: UsefulResourcesProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Get improvement areas (departments with score < 70)
  const improvementAreas = useMemo(() => {
    return Object.entries(scores)
      .filter(([_, score]) => score < 70)
      .map(([dept]) => dept);
  }, [scores]);

  // Filter resources based on improvement areas and search
  const filteredResources = useMemo(() => {
    const catalog = resourceCatalog[language as 'en' | 'de'] || resourceCatalog.en;
    
    return catalog.filter(resource => {
      // Department filter
      if (departmentFilter !== 'all' && resource.department !== departmentFilter) {
        return false;
      }
      
      // Search filter
      if (searchTerm && !resource.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [language, searchTerm, departmentFilter]);

  // Prioritized resources for improvement areas
  const prioritizedResources = useMemo(() => {
    const catalog = resourceCatalog[language as 'en' | 'de'] || resourceCatalog.en;
    return catalog.filter(resource => improvementAreas.includes(resource.department));
  }, [language, improvementAreas]);

  const encyclopedia = kpiEncyclopedia[language as 'en' | 'de'] || kpiEncyclopedia.en;
  const materials = supportMaterials[language as 'en' | 'de'] || supportMaterials.en;

  const getTypeIcon = (type: string) => {
    const typeMap: Record<string, typeof BookOpen> = {
      'Course': GraduationCap, 'Kurs': GraduationCap,
      'Video': Video,
      'Article': FileText, 'Artikel': FileText,
      'Webinar': Globe
    };
    return typeMap[type] || BookOpen;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'Course': 'bg-blue-500', 'Kurs': 'bg-blue-500',
      'Video': 'bg-purple-500',
      'Article': 'bg-green-500', 'Artikel': 'bg-green-500',
      'Webinar': 'bg-orange-500'
    };
    return colorMap[type] || 'bg-gray-500';
  };

  const departmentNames: Record<string, Record<string, string>> = {
    'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
    'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
    'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
    'parts-inventory': { en: 'Parts & Inventory', de: 'Teile & Lager' },
    'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen' }
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <Card className="border-primary/20 shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            {language === 'de' ? 'Ressourcen & Referenz' : 'Resources & Reference'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {language === 'de' 
              ? 'Kuratierte Lernressourcen und Referenzmaterialien basierend auf Ihrer Bewertung.'
              : 'Curated learning resources and reference materials based on your assessment.'}
          </p>
          <Link to="/resources">
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" />
              {language === 'de' ? 'Lernressourcen erkunden' : 'Explore Learning Resources'}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Three-Section Tabs */}
      <Tabs defaultValue="learning" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="learning" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'de' ? 'Lernbibliothek' : 'Learning Library'}</span>
          </TabsTrigger>
          <TabsTrigger value="encyclopedia" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'de' ? 'KPI-Enzyklopädie' : 'KPI Encyclopedia'}</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'de' ? 'Unterstützungsmaterialien' : 'Support Materials'}</span>
          </TabsTrigger>
        </TabsList>

        {/* Learning Library Tab */}
        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                📚 {language === 'de' ? 'Kuratierte Lernressourcen für Ihre Verbesserungsbereiche' : 'Curated Learning Resources for Your Improvement Areas'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'de' 
                  ? 'Ressourcen, die für Bereiche mit Verbesserungsbedarf priorisiert sind'
                  : 'Resources prioritized for areas needing improvement'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={language === 'de' ? 'Ressourcen suchen...' : 'Search resources...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select 
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">{language === 'de' ? 'Alle Abteilungen' : 'All Departments'}</option>
                  {Object.entries(departmentNames).map(([key, names]) => (
                    <option key={key} value={key}>{names[language] || names.en}</option>
                  ))}
                </select>
              </div>

              {/* Resource Grid */}
              {filteredResources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'de' 
                    ? 'Keine passenden Ressourcen für die ausgewählten Filter gefunden.'
                    : 'No matching resources available for the selected filters.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.map((resource) => {
                    const Icon = getTypeIcon(resource.type);
                    const isPrioritized = improvementAreas.includes(resource.department);
                    return (
                      <Card 
                        key={resource.id} 
                        className={cn(
                          "hover:border-primary/50 transition-all cursor-pointer hover:shadow-md",
                          isPrioritized && "ring-2 ring-primary/20"
                        )}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className={cn("p-2 rounded-lg", getTypeColor(resource.type))}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            {isPrioritized && (
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                {language === 'de' ? 'Empfohlen' : 'Recommended'}
                              </Badge>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm line-clamp-2">{resource.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {resource.duration}
                            </span>
                            <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPI Encyclopedia Tab */}
        <TabsContent value="encyclopedia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                📊 {language === 'de' ? 'KPI-Enzyklopädie' : 'KPI Encyclopedia'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'de' 
                  ? 'Referenzbibliothek für alle Leistungskennzahlen'
                  : 'Reference library for all performance metrics'}
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {encyclopedia.map((dept, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`dept-${index}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="font-semibold">{dept.department}</span>
                      <Badge variant="secondary" className="ml-2">{dept.kpis.length} KPIs</Badge>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4">
                        {dept.kpis.map((kpi, kpiIndex) => (
                          <div key={kpiIndex} className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <h4 className="font-semibold text-primary">{kpi.name}</h4>
                            <p className="text-sm text-muted-foreground">{kpi.definition}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div className="bg-background p-2 rounded">
                                <span className="text-muted-foreground">{language === 'de' ? 'Formel:' : 'Formula:'}</span>
                                <p className="font-mono mt-1">{kpi.formula}</p>
                              </div>
                              <div className="bg-background p-2 rounded">
                                <span className="text-muted-foreground">{language === 'de' ? 'Benchmark:' : 'Benchmark:'}</span>
                                <p className="font-semibold text-primary mt-1">{kpi.benchmark}</p>
                              </div>
                              <div className="bg-background p-2 rounded">
                                <span className="text-muted-foreground">{language === 'de' ? 'Warum wichtig:' : 'Why it matters:'}</span>
                                <p className="mt-1">{kpi.why}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Materials Tab */}
        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                🛠️ {language === 'de' ? 'Unterstützungsmaterialien' : 'Support Materials'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'de' 
                  ? 'Vorlagen, Leitfäden und Fallstudien'
                  : 'Templates, guides, and case studies'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((material, index) => {
                  const Icon = material.icon;
                  return (
                    <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{material.title}</h4>
                            <Badge variant="outline" className="text-xs">{material.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                          <Button variant="ghost" size="sm" className="mt-2 h-8 px-2 gap-1">
                            <Download className="h-3 w-3" />
                            {language === 'de' ? 'Herunterladen' : 'Download'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
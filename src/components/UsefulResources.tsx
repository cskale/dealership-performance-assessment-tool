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
  FileSpreadsheet, Presentation, Users, ArrowUpRight, ArrowDownRight,
  UserCheck, Settings, Wrench, Building2, Coins, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { KPI_DEFINITIONS, KPIDefinition } from "@/lib/kpiDefinitions";

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

const DEPARTMENT_MAP: Record<string, { en: string; de: string }> = {
  'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
  'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
  'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
  'parts-inventory': { en: 'Parts & Inventory', de: 'Teile & Lager' },
  'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen' }
};

const ROOT_CAUSE_ICONS: Record<string, typeof UserCheck> = {
  people: UserCheck,
  process: Settings,
  tools: Wrench,
  structure: Building2,
  incentives: Coins
};

const ROOT_CAUSE_LABELS: Record<string, { en: string; de: string }> = {
  people: { en: 'People', de: 'Personal' },
  process: { en: 'Process', de: 'Prozess' },
  tools: { en: 'Tools', de: 'Werkzeuge' },
  structure: { en: 'Structure', de: 'Struktur' },
  incentives: { en: 'Incentives', de: 'Anreize' }
};

function KPIDetailCard({ kpiKey, kpi, language }: { kpiKey: string; kpi: KPIDefinition; language: string }) {
  const [showDetails, setShowDetails] = useState(false);
  const isEnriched = !!kpi.rootCauseDiagnostics;

  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-primary">{kpi.title}</h4>
        <div className="flex items-center gap-2 shrink-0">
          {kpi.benchmark && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {kpi.benchmark}
            </Badge>
          )}
          {isEnriched && (
            <Badge variant="secondary" className="text-xs">
              {language === 'de' ? 'Vertiefte Analyse' : 'Deep Dive'}
            </Badge>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{kpi.definition}</p>

      {kpi.executiveSummary && (
        <p className="text-xs text-muted-foreground italic">{kpi.executiveSummary}</p>
      )}

      {/* Formula, Unit, Benchmark row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {kpi.formula && (
          <div className="bg-background p-2 rounded">
            <span className="text-muted-foreground">{language === 'de' ? 'Formel:' : 'Formula:'}</span>
            <p className="font-mono mt-1 text-[11px]">{kpi.formula}</p>
          </div>
        )}
        {kpi.unitOfMeasure && (
          <div className="bg-background p-2 rounded">
            <span className="text-muted-foreground">{language === 'de' ? 'Einheit:' : 'Unit:'}</span>
            <p className="font-semibold mt-1">{kpi.unitOfMeasure}</p>
          </div>
        )}
        <div className="bg-background p-2 rounded">
          <span className="text-muted-foreground">{language === 'de' ? 'Warum wichtig:' : 'Why it matters:'}</span>
          <p className="mt-1">{kpi.whyItMatters}</p>
        </div>
      </div>

      {/* Inclusions/Exclusions */}
      {(kpi.inclusions || kpi.exclusions) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {kpi.inclusions && kpi.inclusions.length > 0 && (
            <div className="bg-background p-2 rounded">
              <span className="text-muted-foreground font-medium">{language === 'de' ? 'Einschlüsse:' : 'Includes:'}</span>
              <ul className="mt-1 space-y-0.5">
                {kpi.inclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {kpi.exclusions && kpi.exclusions.length > 0 && (
            <div className="bg-background p-2 rounded">
              <span className="text-muted-foreground font-medium">{language === 'de' ? 'Ausschlüsse:' : 'Excludes:'}</span>
              <ul className="mt-1 space-y-0.5">
                {kpi.exclusions.map((item, i) => (
                  <li key={i} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Enriched content toggle */}
      {isEnriched && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs gap-1"
            onClick={() => setShowDetails(!showDetails)}
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", showDetails && "rotate-90")} />
            {showDetails
              ? (language === 'de' ? 'Details ausblenden' : 'Hide details')
              : (language === 'de' ? 'Ursachendiagnostik & Verbesserungshebel anzeigen' : 'Show root cause diagnostics & improvement levers')
            }
          </Button>

          {showDetails && (
            <div className="space-y-3 pt-2 border-t border-border/50">
              {/* Root Cause Diagnostics */}
              {kpi.rootCauseDiagnostics && (
                <div>
                  <h5 className="text-xs font-semibold mb-2">
                    🔍 {language === 'de' ? 'Ursachendiagnostik' : 'Root Cause Diagnostics'}
                  </h5>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(kpi.rootCauseDiagnostics).map(([dimension, text]) => {
                      const Icon = ROOT_CAUSE_ICONS[dimension] || Settings;
                      const label = ROOT_CAUSE_LABELS[dimension]?.[language as 'en' | 'de'] || dimension;
                      return (
                        <div key={dimension} className="flex items-start gap-2 bg-background p-2 rounded text-xs">
                          <div className="p-1 rounded bg-muted shrink-0">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="font-medium">{label}:</span>{' '}
                            <span className="text-muted-foreground">{text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Improvement Levers */}
              {kpi.improvementLevers && kpi.improvementLevers.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold mb-2">
                    🎯 {language === 'de' ? 'Verbesserungshebel' : 'Improvement Levers'}
                  </h5>
                  <ul className="space-y-1">
                    {kpi.improvementLevers.map((lever, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        <span>{lever}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interdependencies */}
              {kpi.interdependencies && (
                <div>
                  <h5 className="text-xs font-semibold mb-2">
                    🔗 {language === 'de' ? 'KPI-Abhängigkeiten' : 'KPI Interdependencies'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {kpi.interdependencies.upstreamDrivers.length > 0 && (
                      <div className="bg-background p-2 rounded text-xs">
                        <div className="flex items-center gap-1 font-medium mb-1">
                          <ArrowUpRight className="h-3 w-3 text-blue-500" />
                          {language === 'de' ? 'Vorgelagerte Treiber' : 'Upstream Drivers'}
                        </div>
                        <ul className="space-y-0.5">
                          {kpi.interdependencies.upstreamDrivers.map((d, i) => (
                            <li key={i} className="text-muted-foreground">• {d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {kpi.interdependencies.downstreamImpacts.length > 0 && (
                      <div className="bg-background p-2 rounded text-xs">
                        <div className="flex items-center gap-1 font-medium mb-1">
                          <ArrowDownRight className="h-3 w-3 text-orange-500" />
                          {language === 'de' ? 'Nachgelagerte Auswirkungen' : 'Downstream Impacts'}
                        </div>
                        <ul className="space-y-0.5">
                          {kpi.interdependencies.downstreamImpacts.map((d, i) => (
                            <li key={i} className="text-muted-foreground">• {d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function UsefulResources({ scores }: UsefulResourcesProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [encyclopediaSearch, setEncycediaSearch] = useState('');

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
      if (departmentFilter !== 'all' && resource.department !== departmentFilter) return false;
      if (searchTerm && !resource.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [language, searchTerm, departmentFilter]);

  // Build encyclopedia data from KPI_DEFINITIONS grouped by department
  const encyclopediaData = useMemo(() => {
    const deptGroups: Record<string, { key: string; kpi: KPIDefinition }[]> = {};
    
    for (const [key, value] of Object.entries(KPI_DEFINITIONS)) {
      const enDef = value.en;
      const dept = enDef.department || 'other';
      const localizedDef = value[language as 'en' | 'de'] || value.en;
      
      if (!deptGroups[dept]) deptGroups[dept] = [];
      deptGroups[dept].push({ key, kpi: localizedDef });
    }

    // Filter by search
    if (encyclopediaSearch) {
      const search = encyclopediaSearch.toLowerCase();
      for (const dept of Object.keys(deptGroups)) {
        deptGroups[dept] = deptGroups[dept].filter(item =>
          item.kpi.title.toLowerCase().includes(search) ||
          item.kpi.definition.toLowerCase().includes(search)
        );
        if (deptGroups[dept].length === 0) delete deptGroups[dept];
      }
    }

    // Order departments
    const orderedDepts = ['new-vehicle-sales', 'used-vehicle-sales', 'service-performance', 'parts-inventory', 'financial-operations', 'other'];
    return orderedDepts
      .filter(d => deptGroups[d] && deptGroups[d].length > 0)
      .map(d => ({
        departmentKey: d,
        departmentName: DEPARTMENT_MAP[d]?.[language as 'en' | 'de'] || DEPARTMENT_MAP[d]?.en || (language === 'de' ? 'Sonstige' : 'Other'),
        kpis: deptGroups[d],
        enrichedCount: deptGroups[d].filter(k => k.kpi.rootCauseDiagnostics).length
      }));
  }, [language, encyclopediaSearch]);

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
                  {Object.entries(DEPARTMENT_MAP).map(([key, names]) => (
                    <option key={key} value={key}>{names[language as 'en' | 'de'] || names.en}</option>
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

        {/* KPI Encyclopedia Tab — Now sourced from kpiDefinitions.ts */}
        <TabsContent value="encyclopedia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                📊 {language === 'de' ? 'KPI-Enzyklopädie' : 'KPI Encyclopedia'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'de' 
                  ? 'Umfassende Referenzbibliothek mit Ursachendiagnostik, Verbesserungshebeln und KPI-Abhängigkeiten'
                  : 'Comprehensive reference library with root cause diagnostics, improvement levers, and KPI interdependencies'}
              </p>
              <div className="pt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={language === 'de' ? 'KPIs durchsuchen...' : 'Search KPIs...'}
                    value={encyclopediaSearch}
                    onChange={(e) => setEncycediaSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {encyclopediaData.map((dept, index) => (
                  <AccordionItem 
                    key={dept.departmentKey} 
                    value={`dept-${dept.departmentKey}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{dept.departmentName}</span>
                        <Badge variant="secondary" className="text-xs">{dept.kpis.length} KPIs</Badge>
                        {dept.enrichedCount > 0 && (
                          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                            {dept.enrichedCount} {language === 'de' ? 'mit Deep Dive' : 'with Deep Dive'}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4">
                        {dept.kpis.map((item) => (
                          <KPIDetailCard 
                            key={item.key} 
                            kpiKey={item.key} 
                            kpi={item.kpi} 
                            language={language} 
                          />
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

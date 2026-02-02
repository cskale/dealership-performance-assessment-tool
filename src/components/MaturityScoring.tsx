import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MaturityScoringProps {
  scores: Record<string, number>;
  answers: Record<string, any>;
}

interface MaturityLevel {
  level: 1 | 2 | 3 | 4;
  name: string;
  emoji: string;
  color: string;
  description: string;
  characteristics: string[];
}

export function MaturityScoring({ scores, answers }: MaturityScoringProps) {
  const { t, language } = useLanguage();

  const maturityLevels: MaturityLevel[] = useMemo(() => [
    {
      level: 1,
      name: language === 'de' ? 'Basis' : 'Basic',
      emoji: '🔴',
      color: 'bg-red-50 text-red-800 border-red-200',
      description: language === 'de' ? 'Grundlegende Prozesse vorhanden' : 'Basic processes in place',
      characteristics: [
        language === 'de' ? 'Grundlegende Prozesse vorhanden' : 'Basic processes in place',
        language === 'de' ? 'Begrenzte Datennutzung' : 'Limited data usage',
        language === 'de' ? 'Reaktiver Ansatz' : 'Reactive approach',
        language === 'de' ? 'Verbesserungspotenzial' : 'Room for improvement'
      ]
    },
    {
      level: 2,
      name: language === 'de' ? 'Entwickelnd' : 'Developing',
      emoji: '🟡',
      color: 'bg-orange-50 text-orange-800 border-orange-200',
      description: language === 'de' ? 'Prozesse werden standardisiert' : 'Processes being standardized',
      characteristics: [
        language === 'de' ? 'Strukturierte Prozesse' : 'Structured processes',
        language === 'de' ? 'Regelmäßige Datenanalyse' : 'Regular data analysis',
        language === 'de' ? 'Proaktive Maßnahmen' : 'Proactive measures',
        language === 'de' ? 'Kontinuierliche Verbesserung' : 'Continuous improvement'
      ]
    },
    {
      level: 3,
      name: language === 'de' ? 'Ausgereift' : 'Mature',
      emoji: '🟦',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      description: language === 'de' ? 'Optimierte Prozesse' : 'Optimized processes',
      characteristics: [
        language === 'de' ? 'Optimierte Arbeitsabläufe' : 'Optimized workflows',
        language === 'de' ? 'Datengesteuerte Entscheidungen' : 'Data-driven decisions',
        language === 'de' ? 'Starke Kundenorientierung' : 'Strong customer focus',
        language === 'de' ? 'Marktführende Praktiken' : 'Market-leading practices'
      ]
    },
    {
      level: 4,
      name: language === 'de' ? 'Fortgeschritten' : 'Advanced',
      emoji: '🟢',
      color: 'bg-green-50 text-green-800 border-green-200',
      description: language === 'de' ? 'Branchenführend' : 'Industry leading',
      characteristics: [
        language === 'de' ? 'Innovation und Best Practices' : 'Innovation and best practices',
        language === 'de' ? 'Exzellente Leistung' : 'Excellent performance',
        language === 'de' ? 'Digitale Transformation' : 'Digital transformation',
        language === 'de' ? 'Benchmarking-Standard' : 'Benchmarking standard'
      ]
    }
  ], [language]);

  const getMaturityLevel = (score: number): MaturityLevel => {
    if (score >= 85) return maturityLevels[3]; // Advanced
    if (score >= 70) return maturityLevels[2]; // Mature
    if (score >= 50) return maturityLevels[1]; // Developing
    return maturityLevels[0]; // Basic
  };

  // Exact 5 assessment sections for radar chart
  const radarData = useMemo(() => {
    const sectionNames = {
      'new-vehicle-sales': language === 'de' ? 'Neuwagenverkauf' : 'New Vehicle Sales',
      'used-vehicle-sales': language === 'de' ? 'Gebrauchtwagenverkauf' : 'Used Vehicle Sales',
      'service-performance': language === 'de' ? 'Serviceleistung' : 'Service Performance',
      'parts-inventory': language === 'de' ? 'Teile & Lager' : 'Parts & Inventory',
      'financial-operations': language === 'de' ? 'Finanzoperationen' : 'Financial Operations'
    };

    return Object.entries(sectionNames).map(([key, name]) => ({
      subject: name,
      score: scores[key] || 0,
      benchmark: 75, // Industry average benchmark
      fullMark: 100
    }));
  }, [scores, language]);

  // Gap Analysis Data
  const gapAnalysisData = useMemo(() => {
    const INDUSTRY_AVG = 75;
    const sectionNames: Record<string, Record<string, string>> = {
      'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
      'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
      'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
      'parts-inventory': { en: 'Parts & Inventory', de: 'Teile & Lager' },
      'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen' }
    };

    return Object.entries(scores)
      .map(([dept, score]) => {
        const gap = score - INDUSTRY_AVG;
        let priority: 'critical' | 'medium' | 'low';
        let priorityLabel: string;
        let priorityColor: string;
        
        if (gap <= -30) {
          priority = 'critical';
          priorityLabel = language === 'de' ? 'Kritisch' : 'Critical';
          priorityColor = 'bg-red-100 text-red-800';
        } else if (gap <= -10) {
          priority = 'medium';
          priorityLabel = language === 'de' ? 'Mittel' : 'Medium';
          priorityColor = 'bg-yellow-100 text-yellow-800';
        } else {
          priority = 'low';
          priorityLabel = language === 'de' ? 'Niedrig' : 'Low';
          priorityColor = 'bg-green-100 text-green-800';
        }

        return {
          category: sectionNames[dept]?.[language] || dept,
          yourScore: score,
          industryAvg: INDUSTRY_AVG,
          gap,
          priority,
          priorityLabel,
          priorityColor
        };
      })
      .sort((a, b) => a.gap - b.gap); // Sort by gap (most critical first)
  }, [scores, language]);

  const overallMaturity = useMemo(() => {
    const avgScore = Object.values(scores).reduce((sum, s) => sum + s, 0) / Object.values(scores).length || 0;
    return getMaturityLevel(avgScore);
  }, [scores, maturityLevels]);

  const departmentMaturityData = useMemo(() => {
    return Object.entries(scores).map(([dept, score]) => {
      const deptNames: Record<string, Record<string, string>> = {
        'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
        'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
        'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
        'parts-inventory': { en: 'Parts & Inventory', de: 'Teile & Lager' },
        'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen' }
      };
      
      return {
        department: deptNames[dept]?.[language] || dept,
        score,
        level: getMaturityLevel(score),
      };
    });
  }, [scores, language, maturityLevels]);

  return (
    <div className="space-y-6">
      {/* Radar Chart Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 {language === 'de' ? 'Leistungsradar' : 'Performance Radar'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === 'de' 
              ? 'Ihre Bewertung (blau) vs. Branchendurchschnitt 75% (graue Linie)'
              : 'Your assessment (blue) vs. industry benchmark 75% (gray line)'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  className="text-xs"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Radar
                  name={language === 'de' ? 'Branchendurchschnitt (75%)' : 'Industry Benchmark (75%)'}
                  dataKey="benchmark"
                  stroke="#9ca3af"
                  fill="#9ca3af"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Radar
                  name={language === 'de' ? 'Ihre Bewertung' : 'Your Score'}
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                  strokeWidth={3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis Table - NEW */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 {language === 'de' ? 'Lückenanalyse' : 'Performance Gap Analysis'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === 'de' 
              ? 'Vergleich Ihrer Leistung mit dem Branchendurchschnitt'
              : 'Comparison of your performance against industry average'}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'de' ? 'Kategorie' : 'Category'}</TableHead>
                <TableHead className="text-center">{language === 'de' ? 'Ihre Punktzahl' : 'Your Score'}</TableHead>
                <TableHead className="text-center">{language === 'de' ? 'Branchendurchschnitt' : 'Industry Avg'}</TableHead>
                <TableHead className="text-center">{language === 'de' ? 'Lücke' : 'Gap'}</TableHead>
                <TableHead className="text-center">{language === 'de' ? 'Priorität' : 'Priority'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gapAnalysisData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell className="text-center font-semibold">{row.yourScore}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{row.industryAvg}</TableCell>
                  <TableCell className={`text-center font-semibold ${row.gap >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.gap >= 0 ? '+' : ''}{row.gap}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={row.priorityColor}>
                      {row.priority === 'critical' ? '🔴' : row.priority === 'medium' ? '🟡' : '🟢'} {row.priorityLabel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overall Maturity Assessment */}
      <Card className={`border-2 shadow-lg ${overallMaturity.color}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{overallMaturity.emoji}</span>
            <div>
              <CardTitle className="text-xl font-bold">
                {language === 'de' ? 'Reifestufe' : 'Maturity Level'}: {overallMaturity.name}
              </CardTitle>
              <p className="text-sm opacity-80 mt-1">{overallMaturity.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">{language === 'de' ? 'Aktuelle Merkmale' : 'Current Characteristics'}</h4>
              <ul className="space-y-1">
                {overallMaturity.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">{language === 'de' ? 'Reifeverteilung' : 'Maturity Distribution'}</h4>
              <div className="space-y-2">
                {maturityLevels.map((level) => {
                  const count = departmentMaturityData.filter(d => d.level.level === level.level).length;
                  const percentage = (count / departmentMaturityData.length) * 100;
                  return (
                    <div key={level.level} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{level.emoji}</span>
                        <span>{level.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-20" />
                        <span className="text-xs w-8">{count} {language === 'de' ? 'Bereiche' : 'areas'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maturity Roadmap */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {language === 'de' ? 'Entwicklungs-Roadmap' : 'Development Roadmap'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4">
            {maturityLevels.map((level, index) => (
              <div key={level.level} className="flex items-center gap-2">
                <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center font-bold ${level.color} ${overallMaturity.level === level.level ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                  <span className="text-2xl">{level.emoji}</span>
                </div>
                <div className="text-sm">
                  <div className="font-bold">{level.name}</div>
                  <div className="text-muted-foreground">
                    {departmentMaturityData.filter(d => d.level.level === level.level).length} {language === 'de' ? 'Bereiche' : 'depts'}
                  </div>
                </div>
                {index < maturityLevels.length - 1 && (
                  <div className="hidden md:block w-8 h-0.5 bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

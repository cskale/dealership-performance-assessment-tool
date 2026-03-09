import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatEuro, formatNumber } from '@/utils/euroFormatter';
import {
  calculateWeightedScore,
  CATEGORY_WEIGHTS,
  DEPARTMENT_TO_CATEGORY,
  calculateSubCategoryScores,
  calculateAllConfidenceMetrics,
  detectSystemicPatterns,
  calculateEnhancedMaturity,
} from '@/lib/scoringEngine';
import { questionnaire } from '@/data/questionnaire';
import { generateBenchmarkDisclaimer } from '@/lib/benchmarkGovernance';
import { KPI_DEFINITIONS, getKPILabel } from '@/lib/kpiDefinitions';
import { getMaturityLevel } from '@/lib/constants';

// ── i18n labels ──
const LABELS: Record<string, Record<string, string>> = {
  en: {
    reportTitle: 'Dealer Performance Assessment Report',
    confidential: 'Confidential',
    generated: 'Generated',
    completedOn: 'Completed',
    preparedFor: 'Prepared for',
    overallScore: 'Overall Score',
    maturityLevel: 'Maturity Level',
    executiveSummary: 'Executive Summary',
    kpiAnalytics: 'KPI Context & Benchmarks',
    actionPlan: 'Action Plan',
    methodology: 'Methodology',
    appendix: 'Appendix',
    keyStrengths: 'Key Strengths',
    areasForImprovement: 'Areas for Improvement',
    whatToDoNext: 'What to Do Next',
    kpiName: 'KPI',
    benchmark: 'Industry Benchmark',
    whyItMatters: 'Why It Matters',
    action: 'Action',
    owner: 'Owner',
    dueDate: 'Due Date',
    status: 'Status',
    description: 'Description',
    priority: 'Priority',
    dataNotAvailable: 'Data not available for this assessment.',
    unassigned: 'Unassigned',
    page: 'Page',
    of: 'of',
    organization: 'Organization',
    assessmentId: 'Assessment ID',
    completionDate: 'Completion Date',
    generatedDate: 'Generated Date',
    role: 'Role',
    departmentOverview: 'Department Overview',
    department: 'Department',
    score: 'Score',
    weight: 'Weight',
    insightOverall: 'Overall Assessment',
    insightStrongest: 'Strongest Area',
    insightFocus: 'Priority Focus',
    user: 'User',
    kpiBenchmarkNote: 'Benchmarks are industry standards from automotive dealer networks. Your actual KPI values require connection to your business systems.',
  },
  de: {
    reportTitle: 'Haendler-Leistungsbewertungsbericht',
    confidential: 'Vertraulich',
    generated: 'Erstellt',
    completedOn: 'Abgeschlossen',
    preparedFor: 'Erstellt fuer',
    overallScore: 'Gesamtpunktzahl',
    maturityLevel: 'Reifestufe',
    executiveSummary: 'Zusammenfassung',
    kpiAnalytics: 'KPI-Kontext & Benchmarks',
    actionPlan: 'Massnahmenplan',
    methodology: 'Methodik',
    appendix: 'Anhang',
    keyStrengths: 'Schluesselstaerken',
    areasForImprovement: 'Verbesserungsbereiche',
    whatToDoNext: 'Naechste Schritte',
    kpiName: 'KPI',
    benchmark: 'Branchenbenchmark',
    whyItMatters: 'Warum es wichtig ist',
    action: 'Massnahme',
    owner: 'Verantwortlich',
    dueDate: 'Zieldatum',
    status: 'Status',
    description: 'Beschreibung',
    priority: 'Prioritaet',
    dataNotAvailable: 'Fuer diese Bewertung sind keine Daten verfuegbar.',
    unassigned: 'Nicht zugewiesen',
    page: 'Seite',
    of: 'von',
    organization: 'Organisation',
    assessmentId: 'Bewertungs-ID',
    completionDate: 'Abschlussdatum',
    generatedDate: 'Erstellungsdatum',
    role: 'Rolle',
    departmentOverview: 'Abteilungsuebersicht',
    department: 'Abteilung',
    score: 'Punktzahl',
    weight: 'Gewichtung',
    insightOverall: 'Gesamtbewertung',
    insightStrongest: 'Staerkster Bereich',
    insightFocus: 'Schwerpunkt',
    user: 'Benutzer',
    kpiBenchmarkNote: 'Benchmarks sind Branchenstandards aus Autohaendlernetzwerken. Ihre tatsaechlichen KPI-Werte erfordern die Anbindung an Ihre Geschaeftssysteme.',
  },
  fr: {
    reportTitle: "Rapport d'evaluation des performances du concessionnaire",
    confidential: 'Confidentiel',
    generated: 'Genere',
    completedOn: 'Termine',
    preparedFor: 'Prepare pour',
    overallScore: 'Score global',
    maturityLevel: 'Niveau de maturite',
    executiveSummary: 'Resume executif',
    kpiAnalytics: 'Contexte KPI & Benchmarks',
    actionPlan: "Plan d'action",
    methodology: 'Methodologie',
    appendix: 'Annexe',
    keyStrengths: 'Points forts',
    areasForImprovement: "Axes d'amelioration",
    whatToDoNext: 'Prochaines etapes',
    kpiName: 'KPI',
    benchmark: 'Reference industrielle',
    whyItMatters: 'Pourquoi c\'est important',
    action: 'Action',
    owner: 'Responsable',
    dueDate: 'Date cible',
    status: 'Statut',
    description: 'Description',
    priority: 'Priorite',
    dataNotAvailable: 'Donnees non disponibles pour cette evaluation.',
    unassigned: 'Non assigne',
    page: 'Page',
    of: 'de',
    organization: 'Organisation',
    assessmentId: "ID d'evaluation",
    completionDate: "Date d'achevement",
    generatedDate: 'Date de generation',
    role: 'Role',
    departmentOverview: 'Apercu des departements',
    department: 'Departement',
    score: 'Score',
    weight: 'Ponderation',
    insightOverall: 'Evaluation globale',
    insightStrongest: 'Domaine le plus fort',
    insightFocus: 'Priorite',
    user: 'Utilisateur',
    kpiBenchmarkNote: 'Les benchmarks sont des standards industriels. Vos valeurs KPI reelles necessitent une connexion a vos systemes.',
  },
  es: {
    reportTitle: 'Informe de evaluacion del rendimiento del concesionario',
    confidential: 'Confidencial',
    generated: 'Generado',
    completedOn: 'Completado',
    preparedFor: 'Preparado para',
    overallScore: 'Puntuacion general',
    maturityLevel: 'Nivel de madurez',
    executiveSummary: 'Resumen ejecutivo',
    kpiAnalytics: 'Contexto KPI & Benchmarks',
    actionPlan: 'Plan de accion',
    methodology: 'Metodologia',
    appendix: 'Apendice',
    keyStrengths: 'Fortalezas clave',
    areasForImprovement: 'Areas de mejora',
    whatToDoNext: 'Proximos pasos',
    kpiName: 'KPI',
    benchmark: 'Referencia industrial',
    whyItMatters: 'Por que importa',
    action: 'Accion',
    owner: 'Responsable',
    dueDate: 'Fecha objetivo',
    status: 'Estado',
    description: 'Descripcion',
    priority: 'Prioridad',
    dataNotAvailable: 'Datos no disponibles para esta evaluacion.',
    unassigned: 'Sin asignar',
    page: 'Pagina',
    of: 'de',
    organization: 'Organizacion',
    assessmentId: 'ID de evaluacion',
    completionDate: 'Fecha de finalizacion',
    generatedDate: 'Fecha de generacion',
    role: 'Rol',
    departmentOverview: 'Resumen de departamentos',
    department: 'Departamento',
    score: 'Puntuacion',
    weight: 'Ponderacion',
    insightOverall: 'Evaluacion general',
    insightStrongest: 'Area mas fuerte',
    insightFocus: 'Enfoque prioritario',
    user: 'Usuario',
    kpiBenchmarkNote: 'Los benchmarks son estandares de la industria. Sus valores KPI reales requieren conexion a sus sistemas.',
  },
  it: {
    reportTitle: 'Rapporto di valutazione delle prestazioni del concessionario',
    confidential: 'Riservato',
    generated: 'Generato',
    completedOn: 'Completato',
    preparedFor: 'Preparato per',
    overallScore: 'Punteggio complessivo',
    maturityLevel: 'Livello di maturita',
    executiveSummary: 'Riepilogo esecutivo',
    kpiAnalytics: 'Contesto KPI & Benchmark',
    actionPlan: "Piano d'azione",
    methodology: 'Metodologia',
    appendix: 'Appendice',
    keyStrengths: 'Punti di forza',
    areasForImprovement: 'Aree di miglioramento',
    whatToDoNext: 'Prossimi passi',
    kpiName: 'KPI',
    benchmark: 'Benchmark industriale',
    whyItMatters: 'Perche e importante',
    action: 'Azione',
    owner: 'Responsabile',
    dueDate: 'Data obiettivo',
    status: 'Stato',
    description: 'Descrizione',
    priority: 'Priorita',
    dataNotAvailable: 'Dati non disponibili per questa valutazione.',
    unassigned: 'Non assegnato',
    page: 'Pagina',
    of: 'di',
    organization: 'Organizzazione',
    assessmentId: 'ID valutazione',
    completionDate: 'Data di completamento',
    generatedDate: 'Data di generazione',
    role: 'Ruolo',
    departmentOverview: 'Panoramica dei reparti',
    department: 'Reparto',
    score: 'Punteggio',
    weight: 'Ponderazione',
    insightOverall: 'Valutazione complessiva',
    insightStrongest: 'Area piu forte',
    insightFocus: 'Focus prioritario',
    user: 'Utente',
    kpiBenchmarkNote: 'I benchmark sono standard di settore. I valori KPI reali richiedono la connessione ai sistemi aziendali.',
  },
};

const DEPT_NAMES: Record<string, Record<string, string>> = {
  'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf', fr: 'Ventes de vehicules neufs', es: 'Ventas de vehiculos nuevos', it: 'Vendite veicoli nuovi' },
  'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf', fr: "Ventes de vehicules d'occasion", es: 'Ventas de vehiculos usados', it: 'Vendite veicoli usati' },
  'service-performance': { en: 'Service Performance', de: 'Serviceleistung', fr: 'Performance du service', es: 'Rendimiento del servicio', it: 'Performance del servizio' },
  'parts-inventory': { en: 'Parts & Inventory', de: 'Teile & Lager', fr: 'Pieces & Inventaire', es: 'Repuestos e inventario', it: 'Ricambi e inventario' },
  'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen', fr: 'Operations financieres', es: 'Operaciones financieras', it: 'Operazioni finanziarie' },
};

// Map departments to their relevant KPIs from canonical definitions
const DEPT_KPI_MAP: Record<string, string[]> = {
  'new-vehicle-sales': ['leadResponseTime', 'leadConversion', 'showroomConversion', 'testDriveRatio', 'appointmentShowRate', 'salesCycleLength'],
  'used-vehicle-sales': ['grossPerUsedRetailed', 'usedVehicleInventoryTurn', 'reconCycleDays', 'daysSupply', 'usedRetailMix'],
  'service-performance': ['serviceAbsorption', 'labourEfficiency', 'technicianUtilization', 'effectiveLabourRate', 'serviceRetention', 'hoursPerRo'],
  'parts-inventory': ['partsGrossProfit', 'partsInventoryTurnover', 'partsFillRate', 'partsSalesPerRo', 'partsObsolescence'],
  'financial-operations': ['netProfitMargin', 'returnOnAssets', 'variableSelling', 'inventoryTurnover'],
};

export interface PDFExportData {
  organization: {
    name: string;
    logo_url?: string | null;
    default_language?: string | null;
  } | null;
  user: {
    fullName: string;
    role: string;
  };
  assessment: {
    id: string;
    completedAt: string;
    overallScore: number;
    scores: Record<string, number>;
    answers: Record<string, any>;
  };
  actions: Array<{
    action_title: string;
    action_description: string;
    priority: string;
    status: string;
    responsible_person?: string | null;
    target_completion_date?: string | null;
    department: string;
  }>;
  includeWatermark: boolean;
}

function l(lang: string, key: string): string {
  return LABELS[lang]?.[key] || LABELS.en[key] || key;
}

// ── Normalize role label ──
function formatRole(role: string): string {
  if (!role) return 'User';
  const clean = role.trim().toLowerCase();
  const map: Record<string, string> = {
    owner: 'Owner', admin: 'Admin', manager: 'Manager',
    analyst: 'Analyst', viewer: 'Viewer', coach: 'Coach',
    dealer: 'Dealer', user: 'User',
  };
  return map[clean] || (role.charAt(0).toUpperCase() + role.slice(1));
}

// ── Normalize status/priority labels ──
function normalizeStatus(s: string): string {
  const map: Record<string, string> = {
    open: 'Open', in_progress: 'In Progress', 'in progress': 'In Progress',
    completed: 'Completed', done: 'Completed', pending: 'Open',
  };
  return map[s?.toLowerCase()] || (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : 'Open');
}
function normalizePriority(p: string): string {
  const map: Record<string, string> = {
    low: 'Low', medium: 'Medium', high: 'High', critical: 'High',
  };
  return map[p?.toLowerCase()] || (p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : 'Medium');
}

// ── Resolve user full name ──
function resolveFullName(raw: string): string {
  if (!raw || raw.length <= 2) return raw || 'User';
  return raw;
}

// ── Short assessment ID: first 8 + last 4 ──
function shortId(id: string): string {
  if (!id) return '--';
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

export async function generatePDFReport(data: PDFExportData): Promise<void> {
  const lang = data.organization?.default_language || 'en';
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toISOString().slice(11, 16);
  const orgName = data.organization?.name || 'Dealership';
  const fullName = resolveFullName(data.user.fullName);
  const roleLabel = formatRole(data.user.role);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  const headerY = 14;
  const footerY = pageH - 10;
  const contentTop = 26;

  // ── Try loading logo ──
  let logoDataUrl: string | null = null;
  if (data.organization?.logo_url) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = data.organization!.logo_url!;
      });
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(img.naturalWidth, 400);
      canvas.height = Math.min(img.naturalHeight, 400);
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      logoDataUrl = canvas.toDataURL('image/png');
    } catch {
      logoDataUrl = null;
    }
  }

  // ── Header (content pages only, not cover) ──
  const addHeader = () => {
    pdf.setFontSize(7);
    pdf.setTextColor(130, 130, 130);
    pdf.setFont('helvetica', 'normal');
    const headerLeft = logoDataUrl ? margin + 12 : margin;
    if (logoDataUrl) {
      try { pdf.addImage(logoDataUrl, 'PNG', margin, 6, 10, 10); } catch {}
    }
    pdf.text(`${orgName}  |  ${l(lang, 'confidential')}  |  ${l(lang, 'generated')}: ${dateStr} ${timeStr}`, headerLeft, headerY);
    pdf.setDrawColor(210, 210, 210);
    pdf.line(margin, 18, pageW - margin, 18);
  };

  // ── Footer (all pages) ──
  const addFooter = (pageNum: number) => {
    pdf.setFontSize(8);
    pdf.setTextColor(130, 130, 130);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${l(lang, 'page')} ${pageNum}`, margin, footerY);
  };

  // ── Watermark (content pages only, not cover) ──
  const addWatermark = () => {
    if (!data.includeWatermark) return;
    pdf.saveGraphicsState();
    pdf.setGState(new (pdf as any).GState({ opacity: 0.04 }));
    pdf.setFontSize(38);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    const wmText = `${orgName} -- Internal Use Only`;
    pdf.text(wmText, pageW / 2, pageH / 2, { angle: 45, align: 'center' });
    pdf.restoreGraphicsState();
  };

  const overallScore = data.assessment.overallScore;
  const maturity = getMaturityLevel(overallScore, (lang === 'de' ? 'de' : 'en') as 'en' | 'de');

  // ═══════════════════════════════════════════
  // PAGE 1: COVER
  // ═══════════════════════════════════════════
  let pageNum = 1;

  // Dark header band
  pdf.setFillColor(24, 24, 27);
  pdf.rect(0, 0, pageW, 120, 'F');

  // Logo on cover
  if (logoDataUrl) {
    try { pdf.addImage(logoDataUrl, 'PNG', pageW - margin - 28, 18, 28, 28); } catch {}
  }

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  pdf.text(l(lang, 'reportTitle'), margin, 48, { maxWidth: contentW - 40 });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orgName, margin, 74);

  pdf.setFontSize(10);
  pdf.text(`${l(lang, 'completedOn')}: ${data.assessment.completedAt.slice(0, 10)}`, margin, 88);
  pdf.text(`${l(lang, 'generated')}: ${dateStr} ${timeStr}`, margin, 96);
  pdf.text(`${l(lang, 'preparedFor')}: ${fullName} (${roleLabel})`, margin, 104);

  // Score display
  pdf.setTextColor(24, 24, 27);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(l(lang, 'overallScore'), margin, 145);

  const scoreColor = overallScore >= 70 ? [16, 185, 129] : overallScore >= 50 ? [234, 179, 8] : [220, 38, 38];
  pdf.setFontSize(48);
  pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  pdf.text(`${overallScore}`, margin, 175);

  const scoreTextW = pdf.getTextWidth(`${overallScore}`);
  pdf.setFontSize(16);
  pdf.setTextColor(130, 130, 130);
  pdf.text('/100', margin + scoreTextW + 2, 175);

  pdf.setFontSize(12);
  pdf.setTextColor(24, 24, 27);
  pdf.text(`${l(lang, 'maturityLevel')}: ${maturity}`, margin, 190);

  // Department overview table on cover
  let coverY = 210;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(l(lang, 'departmentOverview'), margin, coverY);
  coverY += 6;

  const sortedDepts = Object.entries(data.assessment.scores).sort(([, a], [, b]) => b - a);
  const deptRows = sortedDepts.map(([dept, score]) => {
    const cat = DEPARTMENT_TO_CATEGORY[dept];
    const weight = cat ? CATEGORY_WEIGHTS[cat] : 0;
    return [
      DEPT_NAMES[dept]?.[lang] || DEPT_NAMES[dept]?.en || dept,
      `${score}%`,
      `${Math.round(weight * 100)}%`,
    ];
  });

  autoTable(pdf, {
    startY: coverY,
    head: [[l(lang, 'department'), l(lang, 'score'), l(lang, 'weight')]],
    body: deptRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  addFooter(pageNum);

  // ═══════════════════════════════════════════
  // PAGE 2: EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════
  pdf.addPage();
  pageNum++;
  addHeader();
  addWatermark();
  let y = contentTop;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(l(lang, 'executiveSummary'), margin, y);
  y += 12;

  const strengths = sortedDepts.filter(([, s]) => s >= 60).slice(0, 3);
  const weaknesses = [...sortedDepts].reverse().filter(([, s]) => s < 60).slice(0, 3);

  // Summary paragraph
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  const summaryText = lang === 'de'
    ? `Die Bewertung ergibt eine Gesamtpunktzahl von ${overallScore}/100 (${maturity}). Die Analyse umfasst ${Object.keys(data.assessment.scores).length} Abteilungen mit ${Object.keys(data.assessment.answers).length} beantworteten Fragen.`
    : `The assessment yields an overall score of ${overallScore}/100 (${maturity}). The analysis covers ${Object.keys(data.assessment.scores).length} departments with ${Object.keys(data.assessment.answers).length} questions answered.`;
  const summaryLines = pdf.splitTextToSize(summaryText, contentW);
  pdf.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 10;

  // Strengths
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(16, 185, 129);
  pdf.text(l(lang, 'keyStrengths'), margin, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  if (strengths.length > 0) {
    strengths.forEach(([dept, score]) => {
      const name = DEPT_NAMES[dept]?.[lang] || DEPT_NAMES[dept]?.en || dept;
      pdf.text(`  - ${name}: ${score}%`, margin, y);
      y += 5;
    });
  } else {
    pdf.text(`  - ${l(lang, 'dataNotAvailable')}`, margin, y);
    y += 5;
  }
  y += 6;

  // Weaknesses
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(234, 179, 8);
  pdf.text(l(lang, 'areasForImprovement'), margin, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  if (weaknesses.length > 0) {
    weaknesses.forEach(([dept, score]) => {
      const name = DEPT_NAMES[dept]?.[lang] || DEPT_NAMES[dept]?.en || dept;
      pdf.text(`  - ${name}: ${score}%`, margin, y);
      y += 5;
    });
  } else {
    const noWeakText = lang === 'de' ? 'Alle Bereiche ueber 60%' : 'All areas performing above 60%';
    pdf.text(`  - ${noWeakText}`, margin, y);
    y += 5;
  }
  y += 6;

  // What to do next
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(59, 130, 246);
  pdf.text(l(lang, 'whatToDoNext'), margin, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  if (data.actions.length > 0) {
    const topActions = data.actions.filter(a => a.priority === 'critical' || a.priority === 'high').slice(0, 2);
    const actionsToShow = topActions.length > 0 ? topActions : data.actions.slice(0, 2);
    actionsToShow.forEach(a => {
      const line = pdf.splitTextToSize(`  - ${a.action_title}`, contentW - 8);
      pdf.text(line, margin, y);
      y += line.length * 5;
    });
  } else {
    const nextText = lang === 'de' ? 'Massnahmenplan erstellen und mit der Umsetzung beginnen.' : 'Create an action plan and begin implementation.';
    pdf.text(`  - ${nextText}`, margin, y);
    y += 5;
  }
  y += 8;

  // Insight block
  pdf.setDrawColor(230, 230, 230);
  pdf.setFillColor(248, 248, 250);
  pdf.roundedRect(margin, y, contentW, 32, 2, 2, 'FD');
  y += 7;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);

  const matStmt = lang === 'de'
    ? `${l(lang, 'insightOverall')}: Das Autohaus befindet sich auf der Stufe "${maturity}" mit ${overallScore}/100 Punkten.`
    : `${l(lang, 'insightOverall')}: The dealership is at "${maturity}" level with a score of ${overallScore}/100.`;
  pdf.text(matStmt, margin + 4, y);
  y += 6;

  if (sortedDepts.length > 0) {
    const [topDept, topScore] = sortedDepts[0];
    const topName = DEPT_NAMES[topDept]?.[lang] || DEPT_NAMES[topDept]?.en || topDept;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${l(lang, 'insightStrongest')}: ${topName} (${topScore}%)`, margin + 4, y);
    y += 6;
  }

  if (weaknesses.length > 0) {
    const focusNames = weaknesses.map(([d]) => DEPT_NAMES[d]?.[lang] || DEPT_NAMES[d]?.en || d).join(', ');
    pdf.text(`${l(lang, 'insightFocus')}: ${focusNames}`, margin + 4, y);
  } else if (sortedDepts.length > 0) {
    const [lastDept] = sortedDepts[sortedDepts.length - 1];
    const lastName = DEPT_NAMES[lastDept]?.[lang] || DEPT_NAMES[lastDept]?.en || lastDept;
    pdf.text(`${l(lang, 'insightFocus')}: ${lastName}`, margin + 4, y);
  }

  addFooter(pageNum);

  // ═══════════════════════════════════════════
  // PAGE 3: SUB-CATEGORY BREAKDOWN & CONFIDENCE
  // ═══════════════════════════════════════════
  const subCatLabelTitle = lang === 'de' ? 'Capability-Analyse nach Teilbereich' : 'Capability Analysis by Sub-Category';
  const subCatLabel = lang === 'de' ? 'Teilbereich' : 'Sub-Category';
  const maturityLabel = lang === 'de' ? 'Reifegrad' : 'Maturity';
  const consistencyLabel = lang === 'de' ? 'Konsistenz' : 'Consistency';

  const subCategoryData = calculateSubCategoryScores(questionnaire.sections, data.assessment.answers as Record<string, number>);
  const confidenceData = calculateAllConfidenceMetrics(questionnaire.sections, data.assessment.answers as Record<string, number>);
  const systemicPatterns = detectSystemicPatterns(questionnaire.sections, data.assessment.answers as Record<string, number>);

  pdf.addPage();
  pageNum++;
  addHeader();
  addWatermark();
  y = contentTop;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(subCatLabelTitle, margin, y);
  y += 10;

  const deptKeys = Object.keys(subCategoryData);
  for (const dept of deptKeys) {
    const deptData = subCategoryData[dept];
    const conf = confidenceData[dept];
    const enhancedMat = calculateEnhancedMaturity(deptData.overallScore, deptData.subCategories, conf);
    const deptName = DEPT_NAMES[dept]?.[lang] || DEPT_NAMES[dept]?.en || dept;

    if (y > pageH - 70) {
      addFooter(pageNum);
      pdf.addPage();
      pageNum++;
      addHeader();
      addWatermark();
      y = contentTop;
    }

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(24, 24, 27);
    pdf.text(deptName, margin, y);

    const confLabel = conf.confidence === 'high'
      ? (lang === 'de' ? 'Hohe Konfidenz' : 'High Confidence')
      : conf.confidence === 'medium'
        ? (lang === 'de' ? 'Mittlere Konfidenz' : 'Medium Confidence')
        : (lang === 'de' ? 'Ueberprufung empfohlen' : 'Review Recommended');
    const confColor: [number, number, number] = conf.confidence === 'high' ? [16, 185, 129] : conf.confidence === 'medium' ? [234, 179, 8] : [220, 38, 38];

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(confColor[0], confColor[1], confColor[2]);
    const confX = margin + pdf.getTextWidth(deptName + '  ') + 12;
    pdf.text(`[${confLabel} - ${consistencyLabel}: ${conf.consistencyScore}%]`, confX > pageW - margin - 60 ? margin : confX, y);

    y += 5;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${maturityLabel}: ${enhancedMat.level} -- ${enhancedMat.reason.slice(0, 120)}`, margin, y);
    y += 5;

    if (deptData.subCategories.length > 0) {
      const scRows = deptData.subCategories.map(sc => {
        const bar = sc.score >= 75 ? '+++' : sc.score >= 50 ? '++' : '+';
        return [
          sc.category.charAt(0).toUpperCase() + sc.category.slice(1),
          `${sc.score}%`,
          bar,
          `${sc.questionCount} Q`,
        ];
      });

      autoTable(pdf, {
        startY: y,
        head: [[subCatLabel, l(lang, 'score'), 'Level', 'Questions']],
        body: scRows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 2, font: 'helvetica' },
        headStyles: { fillColor: [60, 60, 70], textColor: [255, 255, 255], fontSize: 7 },
        alternateRowStyles: { fillColor: [250, 250, 252] },
        columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 20 }, 2: { cellWidth: 18 }, 3: { cellWidth: 22 } },
        tableWidth: contentW * 0.62,
      });
      y = (pdf as any).lastAutoTable.finalY + 6;
    } else {
      y += 4;
    }
  }

  // Systemic Patterns
  const systemicOnly = systemicPatterns.filter(p => p.severity === 'systemic');
  if (systemicOnly.length > 0) {
    if (y > pageH - 50) {
      addFooter(pageNum);
      pdf.addPage();
      pageNum++;
      addHeader();
      addWatermark();
      y = contentTop;
    }

    const systemicTitle = lang === 'de' ? 'Systemische Muster erkannt' : 'Systemic Patterns Detected';
    pdf.setFillColor(254, 242, 242);
    pdf.setDrawColor(220, 38, 38);
    const alertH = 10 + systemicOnly.length * 14;
    pdf.roundedRect(margin, y, contentW, Math.min(alertH, pageH - y - 20), 2, 2, 'FD');
    y += 7;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(185, 28, 28);
    pdf.text(`! ${systemicTitle}`, margin + 4, y);
    y += 7;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 30, 30);
    for (const p of systemicOnly) {
      const deptNames = p.departments.map(d => DEPT_NAMES[d]?.[lang] || DEPT_NAMES[d]?.en || d).join(', ');
      const line = pdf.splitTextToSize(`- ${p.signalCode}: ${p.description} (${deptNames})`, contentW - 12);
      pdf.text(line, margin + 5, y);
      y += line.length * 4 + 2;
    }
    y += 4;
  }

  addFooter(pageNum);

  // ═══════════════════════════════════════════
  // KPI CONTEXT PAGES (from canonical definitions)
  // ═══════════════════════════════════════════
  pdf.addPage();
  pageNum++;
  addHeader();
  addWatermark();
  y = contentTop;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(l(lang, 'kpiAnalytics'), margin, y);
  y += 8;

  // Disclaimer about KPI benchmarks
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(100, 100, 100);
  const disclaimerLines = pdf.splitTextToSize(l(lang, 'kpiBenchmarkNote'), contentW);
  pdf.text(disclaimerLines, margin, y);
  y += disclaimerLines.length * 4 + 8;

  Object.entries(data.assessment.scores).forEach(([sectionId, sectionScore]) => {
    const kpiKeys = DEPT_KPI_MAP[sectionId] || [];
    if (kpiKeys.length === 0) return;

    if (y > pageH - 80) {
      addFooter(pageNum);
      pdf.addPage();
      pageNum++;
      addHeader();
      addWatermark();
      y = contentTop;
    }

    // Department heading
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(24, 24, 27);
    const sectionName = DEPT_NAMES[sectionId]?.[lang] || DEPT_NAMES[sectionId]?.en || sectionId;
    pdf.text(`${sectionName} -- ${sectionScore}%`, margin, y);
    y += 6;

    // KPI rows from canonical definitions
    const kpiRows = kpiKeys.map(key => {
      const kpiDef = KPI_DEFINITIONS[key];
      if (!kpiDef) return null;
      const localized = kpiDef[lang as 'en' | 'de'] || kpiDef.en;
      return [
        localized.title,
        localized.benchmark || '--',
        localized.whyItMatters?.slice(0, 80) || '--',
      ];
    }).filter(Boolean) as string[][];

    if (kpiRows.length > 0) {
      autoTable(pdf, {
        startY: y,
        head: [[l(lang, 'kpiName'), l(lang, 'benchmark'), l(lang, 'whyItMatters')]],
        body: kpiRows as string[][],
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
        headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontSize: 8 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: contentW - 70 - margin },
        },
      });
      y = (pdf as any).lastAutoTable.finalY + 10;
    }
  });

  addFooter(pageNum);

  // ═══════════════════════════════════════════
  // ACTION PLAN
  // ═══════════════════════════════════════════
  pdf.addPage();
  pageNum++;
  addHeader();
  addWatermark();
  y = contentTop;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(l(lang, 'actionPlan'), margin, y);
  y += 10;

  if (data.actions.length > 0) {
    const actionRows = data.actions.map(a => [
      a.action_title.length > 70 ? a.action_title.slice(0, 67) + '...' : a.action_title,
      a.responsible_person || l(lang, 'unassigned'),
      a.target_completion_date?.slice(0, 10) || '--',
      normalizeStatus(a.status),
      normalizePriority(a.priority),
    ]);

    autoTable(pdf, {
      startY: y,
      head: [[l(lang, 'action'), l(lang, 'owner'), l(lang, 'dueDate'), l(lang, 'status'), l(lang, 'priority')]],
      body: actionRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
      headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: { 0: { cellWidth: 55 } },
      rowPageBreak: 'avoid',
    });

    y = (pdf as any).lastAutoTable.finalY + 10;

    // Action descriptions
    data.actions.forEach((a, i) => {
      const titleText = `${i + 1}. ${a.action_title}`;
      const cleanDesc = a.action_description
        .replace(/Triggered because:.*$/s, '')
        .trim()
        .slice(0, 400);
      const descLines = cleanDesc ? pdf.splitTextToSize(cleanDesc, contentW - 12) : [];
      const blockH = 8 + descLines.length * 4;

      if (y + blockH > pageH - 20) {
        addFooter(pageNum);
        pdf.addPage();
        pageNum++;
        addHeader();
        addWatermark();
        y = contentTop;
      }

      pdf.setFillColor(248, 248, 250);
      pdf.setDrawColor(230, 230, 230);
      pdf.roundedRect(margin, y - 2, contentW, blockH + 2, 1, 1, 'FD');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(24, 24, 27);
      pdf.text(titleText.slice(0, 90), margin + 3, y + 3);

      if (descLines.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(descLines, margin + 3, y + 9);
      }
      y += blockH + 4;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(l(lang, 'dataNotAvailable'), margin, y);
    y += 10;
  }

  addFooter(pageNum);

  // ═══════════════════════════════════════════
  // METHODOLOGY
  // ═══════════════════════════════════════════
  pdf.addPage();
  pageNum++;
  addHeader();
  addWatermark();
  y = contentTop;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(l(lang, 'methodology'), margin, y);
  y += 12;

  const methTexts = lang === 'de'
    ? [
        'Dieser Bericht wurde mit der Autohaus-Bewertungsplattform erstellt.',
        'Die Bewertungen basieren auf Selbsteinschaetzungen des Teilnehmers in den wichtigsten operativen Bereichen.',
        'Die gewichtete Gesamtpunktzahl kombiniert die Abteilungsergebnisse nach ihrer strategischen Bedeutung.',
        'Branchenbenchmarks basieren auf veroeffentlichten Branchenstudien und Best Practices.',
        'KPI-Benchmarks sind Referenzwerte aus Autohaendlernetzwerken -- tatsaechliche Werte erfordern Systemintegration.',
        'Die Konfidenzmetrik zeigt die interne Konsistenz der Antworten innerhalb jeder Abteilung.',
        'Systemische Muster werden identifiziert, wenn mehrere Abteilungen aehnliche niedrige Punktzahlen aufweisen.',
        'Aktionspunkte werden basierend auf Signalen aus niedrig bewerteten Bereichen generiert.',
      ]
    : [
        'This report was generated using the Dealership Assessment Platform.',
        'Scores are based on self-assessment responses provided by the participant across key operational areas.',
        'The weighted overall score combines department results according to their strategic importance.',
        'Industry benchmarks are based on published industry studies and best practices.',
        'KPI benchmarks are reference values from automotive dealer networks -- actual values require system integration.',
        'The confidence metric indicates internal consistency of responses within each department.',
        'Systemic patterns are identified when multiple departments exhibit similar low scores.',
        'Action items are generated based on signals from low-scoring areas.',
      ];

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  methTexts.forEach(txt => {
    const lines = pdf.splitTextToSize(`- ${txt}`, contentW - 10);
    pdf.text(lines, margin + 4, y);
    y += lines.length * 4 + 2;
  });

  y += 8;

  // Benchmark disclaimer
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(100, 100, 100);
  const disclaimer = generateBenchmarkDisclaimer(lang);
  const discLines = pdf.splitTextToSize(disclaimer, contentW);
  pdf.text(discLines, margin, y);

  addFooter(pageNum);

  // ═══════════════════════════════════════════
  // FINALIZE: Update page footers with total
  // ═══════════════════════════════════════════
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFontSize(8);
    pdf.setTextColor(130, 130, 130);
    pdf.setFont('helvetica', 'normal');
    const footerText = `${l(lang, 'page')} ${p} ${l(lang, 'of')} ${totalPages}`;
    pdf.text(footerText, pageW - margin - pdf.getTextWidth(footerText), footerY);
  }

  // Save
  const fileName = `${orgName.replace(/\s+/g, '_')}_Assessment_Report_${dateStr}.pdf`;
  pdf.save(fileName);
}

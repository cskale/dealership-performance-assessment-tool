import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateRealisticData, industryBenchmarks, formatEuro, formatPercentage, formatNumber } from '@/utils/euroFormatter';
import { calculateWeightedScore, CATEGORY_WEIGHTS, DEPARTMENT_TO_CATEGORY } from '@/lib/scoringEngine';

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
    kpiAnalytics: 'KPI Analytics',
    actionPlan: 'Action Plan',
    methodology: 'Methodology',
    appendix: 'Appendix',
    keyStrengths: 'Key Strengths',
    areasForImprovement: 'Areas for Improvement',
    whatToDoNext: 'What to Do Next',
    kpiName: 'KPI',
    yourValue: 'Your Value',
    benchmark: 'Benchmark',
    gap: 'Gap',
    interpretation: 'Interpretation',
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
    user: 'User',
    language: 'Language',
    organization: 'Organization',
    assessmentId: 'Assessment ID',
    completionDate: 'Completion Date',
    generatedDate: 'Generated Date',
    role: 'Role',
    departmentOverview: 'Department Overview',
    department: 'Department',
    score: 'Score',
    weight: 'Weight',
  },
  de: {
    reportTitle: 'Händler-Leistungsbewertungsbericht',
    confidential: 'Vertraulich',
    generated: 'Erstellt',
    completedOn: 'Abgeschlossen',
    preparedFor: 'Erstellt für',
    overallScore: 'Gesamtpunktzahl',
    maturityLevel: 'Reifestufe',
    executiveSummary: 'Zusammenfassung',
    kpiAnalytics: 'KPI-Analyse',
    actionPlan: 'Maßnahmenplan',
    methodology: 'Methodik',
    appendix: 'Anhang',
    keyStrengths: 'Schlüsselstärken',
    areasForImprovement: 'Verbesserungsbereiche',
    whatToDoNext: 'Nächste Schritte',
    kpiName: 'KPI',
    yourValue: 'Ihr Wert',
    benchmark: 'Benchmark',
    gap: 'Differenz',
    interpretation: 'Interpretation',
    action: 'Maßnahme',
    owner: 'Verantwortlich',
    dueDate: 'Zieldatum',
    status: 'Status',
    description: 'Beschreibung',
    priority: 'Priorität',
    dataNotAvailable: 'Für diese Bewertung sind keine Daten verfügbar.',
    unassigned: 'Nicht zugewiesen',
    page: 'Seite',
    of: 'von',
    user: 'Benutzer',
    language: 'Sprache',
    organization: 'Organisation',
    assessmentId: 'Bewertungs-ID',
    completionDate: 'Abschlussdatum',
    generatedDate: 'Erstellungsdatum',
    role: 'Rolle',
    departmentOverview: 'Abteilungsübersicht',
    department: 'Abteilung',
    score: 'Punktzahl',
    weight: 'Gewichtung',
  },
  fr: {
    reportTitle: 'Rapport d\'évaluation des performances du concessionnaire',
    confidential: 'Confidentiel',
    generated: 'Généré',
    completedOn: 'Terminé',
    preparedFor: 'Préparé pour',
    overallScore: 'Score global',
    maturityLevel: 'Niveau de maturité',
    executiveSummary: 'Résumé exécutif',
    kpiAnalytics: 'Analyse KPI',
    actionPlan: 'Plan d\'action',
    methodology: 'Méthodologie',
    appendix: 'Annexe',
    keyStrengths: 'Points forts',
    areasForImprovement: 'Axes d\'amélioration',
    whatToDoNext: 'Prochaines étapes',
    kpiName: 'KPI',
    yourValue: 'Votre valeur',
    benchmark: 'Référence',
    gap: 'Écart',
    interpretation: 'Interprétation',
    action: 'Action',
    owner: 'Responsable',
    dueDate: 'Date cible',
    status: 'Statut',
    description: 'Description',
    priority: 'Priorité',
    dataNotAvailable: 'Données non disponibles pour cette évaluation.',
    unassigned: 'Non assigné',
    page: 'Page',
    of: 'de',
    user: 'Utilisateur',
    language: 'Langue',
    organization: 'Organisation',
    assessmentId: 'ID d\'évaluation',
    completionDate: 'Date d\'achèvement',
    generatedDate: 'Date de génération',
    role: 'Rôle',
    departmentOverview: 'Aperçu des départements',
    department: 'Département',
    score: 'Score',
    weight: 'Pondération',
  },
  es: {
    reportTitle: 'Informe de evaluación del rendimiento del concesionario',
    confidential: 'Confidencial',
    generated: 'Generado',
    completedOn: 'Completado',
    preparedFor: 'Preparado para',
    overallScore: 'Puntuación general',
    maturityLevel: 'Nivel de madurez',
    executiveSummary: 'Resumen ejecutivo',
    kpiAnalytics: 'Análisis KPI',
    actionPlan: 'Plan de acción',
    methodology: 'Metodología',
    appendix: 'Apéndice',
    keyStrengths: 'Fortalezas clave',
    areasForImprovement: 'Áreas de mejora',
    whatToDoNext: 'Próximos pasos',
    kpiName: 'KPI',
    yourValue: 'Su valor',
    benchmark: 'Referencia',
    gap: 'Brecha',
    interpretation: 'Interpretación',
    action: 'Acción',
    owner: 'Responsable',
    dueDate: 'Fecha objetivo',
    status: 'Estado',
    description: 'Descripción',
    priority: 'Prioridad',
    dataNotAvailable: 'Datos no disponibles para esta evaluación.',
    unassigned: 'Sin asignar',
    page: 'Página',
    of: 'de',
    user: 'Usuario',
    language: 'Idioma',
    organization: 'Organización',
    assessmentId: 'ID de evaluación',
    completionDate: 'Fecha de finalización',
    generatedDate: 'Fecha de generación',
    role: 'Rol',
    departmentOverview: 'Resumen de departamentos',
    department: 'Departamento',
    score: 'Puntuación',
    weight: 'Ponderación',
  },
  it: {
    reportTitle: 'Rapporto di valutazione delle prestazioni del concessionario',
    confidential: 'Riservato',
    generated: 'Generato',
    completedOn: 'Completato',
    preparedFor: 'Preparato per',
    overallScore: 'Punteggio complessivo',
    maturityLevel: 'Livello di maturità',
    executiveSummary: 'Riepilogo esecutivo',
    kpiAnalytics: 'Analisi KPI',
    actionPlan: 'Piano d\'azione',
    methodology: 'Metodologia',
    appendix: 'Appendice',
    keyStrengths: 'Punti di forza',
    areasForImprovement: 'Aree di miglioramento',
    whatToDoNext: 'Prossimi passi',
    kpiName: 'KPI',
    yourValue: 'Il tuo valore',
    benchmark: 'Riferimento',
    gap: 'Divario',
    interpretation: 'Interpretazione',
    action: 'Azione',
    owner: 'Responsabile',
    dueDate: 'Data obiettivo',
    status: 'Stato',
    description: 'Descrizione',
    priority: 'Priorità',
    dataNotAvailable: 'Dati non disponibili per questa valutazione.',
    unassigned: 'Non assegnato',
    page: 'Pagina',
    of: 'di',
    user: 'Utente',
    language: 'Lingua',
    organization: 'Organizzazione',
    assessmentId: 'ID valutazione',
    completionDate: 'Data di completamento',
    generatedDate: 'Data di generazione',
    role: 'Ruolo',
    departmentOverview: 'Panoramica dei reparti',
    department: 'Reparto',
    score: 'Punteggio',
    weight: 'Ponderazione',
  },
};

const DEPT_NAMES: Record<string, Record<string, string>> = {
  'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf', fr: 'Ventes de véhicules neufs', es: 'Ventas de vehículos nuevos', it: 'Vendite veicoli nuovi' },
  'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf', fr: 'Ventes de véhicules d\'occasion', es: 'Ventas de vehículos usados', it: 'Vendite veicoli usati' },
  'service-performance': { en: 'Service Performance', de: 'Serviceleistung', fr: 'Performance du service', es: 'Rendimiento del servicio', it: 'Performance del servizio' },
  'parts-inventory': { en: 'Parts & Inventory', de: 'Teile & Lager', fr: 'Pièces & Inventaire', es: 'Repuestos e inventario', it: 'Ricambi e inventario' },
  'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen', fr: 'Opérations financières', es: 'Operaciones financieras', it: 'Operazioni finanziarie' },
};

const KPI_LABELS: Record<string, Record<string, string>> = {
  monthlyRevenue: { en: 'Monthly Revenue', de: 'Monatsumsatz' },
  averageMargin: { en: 'Average Margin', de: 'Durchschnittsmarge' },
  customerSatisfaction: { en: 'Customer Satisfaction', de: 'Kundenzufriedenheit' },
  leadConversion: { en: 'Lead Conversion', de: 'Lead-Konversion' },
  averageTransactionValue: { en: 'Avg Transaction Value', de: 'Durchschn. Transaktionswert' },
  turnoverRate: { en: 'Turnover Rate', de: 'Umschlagsrate' },
  laborEfficiency: { en: 'Labor Efficiency', de: 'Arbeitseffizienz' },
  customerRetention: { en: 'Customer Retention', de: 'Kundenbindung' },
  averageRO: { en: 'Average Repair Order', de: 'Durchschn. Reparaturauftrag' },
  technicianUtilization: { en: 'Technician Utilization', de: 'Technikerauslastung' },
  grossMargin: { en: 'Gross Margin', de: 'Bruttomarge' },
  stockoutRate: { en: 'Stockout Rate', de: 'Fehlbestandsrate' },
  supplierPerformance: { en: 'Supplier Performance', de: 'Lieferantenleistung' },
  profitMargin: { en: 'Profit Margin', de: 'Gewinnmarge' },
  cashFlowDays: { en: 'Cash Flow Days', de: 'Cashflow-Tage' },
  costPerSale: { en: 'Cost per Sale', de: 'Kosten pro Verkauf' },
  roiMarketing: { en: 'Marketing ROI', de: 'Marketing-ROI' },
  operationalEfficiency: { en: 'Operational Efficiency', de: 'Betriebliche Effizienz' },
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

function getMaturityLevel(score: number, lang: string): string {
  const levels: Record<string, Record<string, string>> = {
    advanced: { en: 'Advanced', de: 'Fortgeschritten', fr: 'Avancé', es: 'Avanzado', it: 'Avanzato' },
    mature: { en: 'Mature', de: 'Ausgereift', fr: 'Mature', es: 'Maduro', it: 'Maturo' },
    developing: { en: 'Developing', de: 'Entwickelnd', fr: 'En développement', es: 'En desarrollo', it: 'In sviluppo' },
    basic: { en: 'Basic', de: 'Basis', fr: 'Basique', es: 'Básico', it: 'Base' },
  };
  const key = score >= 85 ? 'advanced' : score >= 70 ? 'mature' : score >= 50 ? 'developing' : 'basic';
  return levels[key][lang] || levels[key].en;
}

function formatPDFValue(key: string, value: number): string {
  if (key.includes('Revenue') || key.includes('Value') || key.includes('RO') || key.includes('costPerSale') || key.includes('cashFlow') || key.includes('counterSales') || key.includes('roiMarketing')) {
    return formatEuro(value);
  }
  if (key.includes('Margin') || key.includes('Efficiency') || key.includes('Satisfaction') || key.includes('Retention') || key.includes('Utilization') || key.includes('Conversion') || key.includes('stockoutRate') || key.includes('supplierPerformance') || key.includes('operationalEfficiency') || key.includes('leadConversion') || key.includes('grossMargin') || key.includes('profitMargin') || key.includes('laborEfficiency') || key.includes('customerRetention') || key.includes('technicianUtilization') || key.includes('customerSatisfaction')) {
    return `${value.toFixed(1)}%`;
  }
  if (key.includes('Days') || key.includes('cashFlowDays')) {
    return `${Math.round(value)} days`;
  }
  if (key.includes('turnoverRate')) {
    return `${value.toFixed(1)}x/yr`;
  }
  return formatNumber(value);
}

export async function generatePDFReport(data: PDFExportData): Promise<void> {
  const lang = data.organization?.default_language || 'en';
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toISOString().slice(11, 16);
  const orgName = data.organization?.name || 'Dealership';
  const langCode = lang.toUpperCase();

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;

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
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      logoDataUrl = canvas.toDataURL('image/png');
    } catch {
      logoDataUrl = null;
    }
  }

  // ── Utility: add header/footer to current page (not cover) ──
  let totalPages = 0; // will be set at the end
  const pageNumbers: number[] = [];

  const addHeaderFooter = (pageNum: number, isCover = false) => {
    const prevFont = pdf.getFont();
    // Footer on every page
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${l(lang, 'page')} ${pageNum}`, margin, pageH - 10);
    pdf.text(`${l(lang, 'user')}: ${data.user.fullName} (${data.user.role})`, pageW / 2, pageH - 10, { align: 'center' });
    pdf.text(`${l(lang, 'language')}: ${langCode}`, pageW - margin, pageH - 10, { align: 'right' });

    if (!isCover) {
      // Header
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, 18, pageW - margin, 18);
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);

      const headerLeft = logoDataUrl ? margin + 12 : margin;
      if (logoDataUrl) {
        try { pdf.addImage(logoDataUrl, 'PNG', margin, 8, 10, 10); } catch {}
      }
      pdf.text(`${orgName}  |  ${l(lang, 'confidential')}  |  ${l(lang, 'generated')}: ${dateStr} ${timeStr}`, headerLeft, 14);
    }

    // Watermark
    if (data.includeWatermark) {
      pdf.saveGraphicsState();
      pdf.setGState(new (pdf as any).GState({ opacity: 0.06 }));
      pdf.setFontSize(40);
      pdf.setTextColor(0, 0, 0);
      const wmText = `${orgName} – Internal Use Only`;
      // Rotate text diagonally
      const cx = pageW / 2;
      const cy = pageH / 2;
      pdf.text(wmText, cx, cy, { angle: 45, align: 'center' });
      pdf.restoreGraphicsState();
    }

    pdf.setFont(prevFont.fontName, prevFont.fontStyle);
  };

  // ── PAGE 1: COVER ──
  let pageNum = 1;

  // Background accent
  pdf.setFillColor(24, 24, 27); // zinc-900
  pdf.rect(0, 0, pageW, 120, 'F');

  // Logo on cover
  if (logoDataUrl) {
    try { pdf.addImage(logoDataUrl, 'PNG', pageW - margin - 30, 20, 30, 30); } catch {}
  }

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(l(lang, 'reportTitle'), margin, 50, { maxWidth: contentW - 40 });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orgName, margin, 75);

  pdf.setFontSize(10);
  pdf.text(`${l(lang, 'completedOn')}: ${data.assessment.completedAt.slice(0, 10)}`, margin, 88);
  pdf.text(`${l(lang, 'generated')}: ${dateStr} ${timeStr}`, margin, 96);
  pdf.text(`${l(lang, 'preparedFor')}: ${data.user.fullName} (${data.user.role})`, margin, 104);

  // Score circle area
  const overallScore = data.assessment.overallScore;
  const maturity = getMaturityLevel(overallScore, lang);

  pdf.setTextColor(24, 24, 27);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(l(lang, 'overallScore'), margin, 145);

  pdf.setFontSize(48);
  pdf.setTextColor(overallScore >= 70 ? 16 : overallScore >= 50 ? 161 : 220, overallScore >= 70 ? 185 : overallScore >= 50 ? 98 : 38, overallScore >= 70 ? 129 : overallScore >= 50 ? 4 : 38);
  pdf.text(`${overallScore}`, margin, 175);

  pdf.setFontSize(16);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`/ 100`, margin + pdf.getTextWidth(`${overallScore}`) + 3, 175);

  pdf.setFontSize(12);
  pdf.setTextColor(24, 24, 27);
  pdf.text(`${l(lang, 'maturityLevel')}: ${maturity}`, margin, 190);

  // Department overview table on cover
  let coverY = 210;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(l(lang, 'departmentOverview'), margin, coverY);
  coverY += 6;

  const deptRows = Object.entries(data.assessment.scores).map(([dept, score]) => {
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
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  addHeaderFooter(pageNum, true);

  // ── PAGE 2: EXECUTIVE SUMMARY ──
  pdf.addPage();
  pageNum++;
  let y = 28;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(l(lang, 'executiveSummary'), margin, y);
  y += 12;

  // Generate executive summary text
  const sortedScores = Object.entries(data.assessment.scores).sort(([, a], [, b]) => b - a);
  const strengths = sortedScores.filter(([, s]) => s >= 60).slice(0, 3);
  const weaknesses = sortedScores.filter(([, s]) => s < 60).sort(([, a], [, b]) => a - b).slice(0, 3);

  // Summary paragraph
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  const summaryText = lang === 'de'
    ? `Die Bewertung ergibt eine Gesamtpunktzahl von ${overallScore}/100 (${maturity}). Die Analyse umfasst ${Object.keys(data.assessment.scores).length} Abteilungen mit ${Object.keys(data.assessment.answers).length} beantworteten Fragen.`
    : `The assessment yields an overall score of ${overallScore}/100 (${maturity}). The analysis covers ${Object.keys(data.assessment.scores).length} departments with ${Object.keys(data.assessment.answers).length} questions answered.`;
  const summaryLines = pdf.splitTextToSize(summaryText, contentW);
  pdf.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 8;

  // Strengths
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(16, 185, 129);
  pdf.text(`✓ ${l(lang, 'keyStrengths')}`, margin, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  if (strengths.length > 0) {
    strengths.forEach(([dept, score]) => {
      const name = DEPT_NAMES[dept]?.[lang] || DEPT_NAMES[dept]?.en || dept;
      pdf.text(`• ${name}: ${score}%`, margin + 4, y);
      y += 5;
    });
  } else {
    pdf.text(`• ${l(lang, 'dataNotAvailable')}`, margin + 4, y);
    y += 5;
  }
  y += 6;

  // Weaknesses
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(234, 179, 8);
  pdf.text(`⚠ ${l(lang, 'areasForImprovement')}`, margin, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  if (weaknesses.length > 0) {
    weaknesses.forEach(([dept, score]) => {
      const name = DEPT_NAMES[dept]?.[lang] || DEPT_NAMES[dept]?.en || dept;
      pdf.text(`• ${name}: ${score}%`, margin + 4, y);
      y += 5;
    });
  } else {
    const noWeakText = lang === 'de' ? 'Alle Bereiche über 60%' : 'All areas performing above 60%';
    pdf.text(`• ${noWeakText}`, margin + 4, y);
    y += 5;
  }
  y += 6;

  // What to do next
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(59, 130, 246);
  pdf.text(`→ ${l(lang, 'whatToDoNext')}`, margin, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  if (data.actions.length > 0) {
    const topActions = data.actions.filter(a => a.priority === 'critical' || a.priority === 'high').slice(0, 2);
    const actionsToShow = topActions.length > 0 ? topActions : data.actions.slice(0, 2);
    actionsToShow.forEach(a => {
      const line = pdf.splitTextToSize(`• ${a.action_title}`, contentW - 8);
      pdf.text(line, margin + 4, y);
      y += line.length * 5;
    });
  } else {
    const nextText = lang === 'de' ? 'Maßnahmenplan erstellen und mit der Umsetzung beginnen.' : 'Create an action plan and begin implementation.';
    pdf.text(`• ${nextText}`, margin + 4, y);
    y += 5;
  }

  addHeaderFooter(pageNum);

  // ── PAGE 3+: KPI ANALYTICS ──
  pdf.addPage();
  pageNum++;
  y = 28;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(l(lang, 'kpiAnalytics'), margin, y);
  y += 10;

  Object.entries(data.assessment.scores).forEach(([sectionId, sectionScore]) => {
    const kpiData = generateRealisticData(sectionScore, sectionId);
    const benchmarks = industryBenchmarks[sectionId as keyof typeof industryBenchmarks];
    if (!kpiData || !benchmarks) return;

    // Check if we need a new page
    if (y > pageH - 60) {
      addHeaderFooter(pageNum);
      pdf.addPage();
      pageNum++;
      y = 28;
    }

    // Section heading
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(24, 24, 27);
    const sectionName = DEPT_NAMES[sectionId]?.[lang] || DEPT_NAMES[sectionId]?.en || sectionId;
    pdf.text(`${sectionName} (${sectionScore}%)`, margin, y);
    y += 4;

    const kpiRows = Object.entries(kpiData).map(([key, value]) => {
      const benchmark = (benchmarks as any)[key];
      const numVal = value as number;
      const gap = benchmark ? numVal - benchmark : 0;
      const gapStr = benchmark ? (gap >= 0 ? '+' : '') + formatPDFValue(key, Math.abs(gap)) : '—';
      const interp = gap >= 0
        ? (lang === 'de' ? 'Über Benchmark' : 'Above benchmark')
        : (lang === 'de' ? 'Unter Benchmark' : 'Below benchmark');
      return [
        KPI_LABELS[key]?.[lang] || KPI_LABELS[key]?.en || key,
        formatPDFValue(key, numVal),
        benchmark ? formatPDFValue(key, benchmark) : '—',
        gapStr,
        interp,
      ];
    });

    autoTable(pdf, {
      startY: y,
      head: [[l(lang, 'kpiName'), l(lang, 'yourValue'), l(lang, 'benchmark'), l(lang, 'gap'), l(lang, 'interpretation')]],
      body: kpiRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontSize: 8 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 35 },
        4: { cellWidth: 30 },
      },
    });

    y = (pdf as any).lastAutoTable.finalY + 8;
  });

  addHeaderFooter(pageNum);

  // ── ACTION PLAN ──
  pdf.addPage();
  pageNum++;
  y = 28;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(l(lang, 'actionPlan'), margin, y);
  y += 10;

  if (data.actions.length > 0) {
    const actionRows = data.actions.map(a => [
      a.action_title.slice(0, 60),
      a.responsible_person || l(lang, 'unassigned'),
      a.target_completion_date?.slice(0, 10) || '—',
      a.status,
      a.priority,
    ]);

    autoTable(pdf, {
      startY: y,
      head: [[l(lang, 'action'), l(lang, 'owner'), l(lang, 'dueDate'), l(lang, 'status'), l(lang, 'priority')]],
      body: actionRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 55 },
      },
    });

    y = (pdf as any).lastAutoTable.finalY + 8;

    // Action descriptions
    if (y > pageH - 40) {
      addHeaderFooter(pageNum);
      pdf.addPage();
      pageNum++;
      y = 28;
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(24, 24, 27);
    pdf.text(l(lang, 'description') + 's', margin, y);
    y += 6;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);

    data.actions.forEach((a, i) => {
      if (y > pageH - 30) {
        addHeaderFooter(pageNum);
        pdf.addPage();
        pageNum++;
        y = 28;
      }
      pdf.setFont('helvetica', 'bold');
      const titleLine = `${i + 1}. ${a.action_title}`;
      pdf.text(titleLine.slice(0, 90), margin, y);
      y += 4;
      pdf.setFont('helvetica', 'normal');
      // Clean description — remove "Triggered because:" metadata
      const cleanDesc = a.action_description
        .replace(/Triggered because:.*$/s, '')
        .trim()
        .slice(0, 300);
      if (cleanDesc) {
        const descLines = pdf.splitTextToSize(cleanDesc, contentW - 4);
        pdf.text(descLines, margin + 2, y);
        y += descLines.length * 4 + 3;
      }
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(120, 120, 120);
    pdf.text(l(lang, 'dataNotAvailable'), margin, y);
  }

  addHeaderFooter(pageNum);

  // ── METHODOLOGY ──
  pdf.addPage();
  pageNum++;
  y = 28;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(l(lang, 'methodology'), margin, y);
  y += 12;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);

  const methodText = lang === 'de'
    ? `Die Bewertung basiert auf einem strukturierten Fragebogen, der die wichtigsten Leistungsbereiche eines Autohauses abdeckt: Neuwagenverkauf (25%), Gebrauchtwagenverkauf (20%), Serviceleistung (20%), Finanzoperationen (20%) und Teile & Lager (15%).\n\nJede Frage wird auf einer Skala von 1 bis 5 bewertet, wobei die Punktzahlen auf 0-100 normalisiert werden. Die Gewichtung spiegelt die relative Bedeutung jedes Bereichs für die Gesamtrentabilität wider.\n\nReifestufen:\n• Fortgeschritten (85-100): Branchenführende Praktiken mit Innovationsfokus\n• Ausgereift (70-84): Gut etablierte Prozesse mit kontinuierlicher Optimierung\n• Entwickelnd (50-69): Grundlegende Optimierung und Standardisierung implementiert\n• Basis (0-49): Grundlegende Prozesse mit erheblichen Lücken\n\nBenchmarks basieren auf konfigurierten Referenzwerten für den europäischen Automobilmarkt.`
    : `Scores are calculated from assessment responses across five key performance areas: New Vehicle Sales (25%), Used Vehicle Sales (20%), Service Performance (20%), Financial Operations (20%), and Parts & Inventory (15%).\n\nEach question is rated on a 1-5 scale, with scores normalized to 0-100. The weighting reflects each area's relative importance to overall dealership profitability.\n\nMaturity Levels:\n• Advanced (85-100): Industry-leading practices with innovation focus\n• Mature (70-84): Well-established processes with consistent optimization\n• Developing (50-69): Some optimization and standardization implemented\n• Basic (0-49): Foundational processes in place with significant gaps\n\nBenchmarks shown reflect the configured reference values for the European automotive market.`;

  const methodLines = pdf.splitTextToSize(methodText, contentW);
  pdf.text(methodLines, margin, y);

  addHeaderFooter(pageNum);

  // ── APPENDIX ──
  pdf.addPage();
  pageNum++;
  y = 28;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(24, 24, 27);
  pdf.text(l(lang, 'appendix'), margin, y);
  y += 12;

  const appendixData = [
    [l(lang, 'organization'), orgName],
    [l(lang, 'assessmentId'), data.assessment.id.slice(0, 8) + '...'],
    [l(lang, 'completionDate'), data.assessment.completedAt.slice(0, 10)],
    [l(lang, 'generatedDate'), `${dateStr} ${timeStr}`],
    [l(lang, 'user'), data.user.fullName],
    [l(lang, 'role'), data.user.role],
    [l(lang, 'language'), langCode],
    [l(lang, 'overallScore'), `${overallScore}/100`],
    [l(lang, 'maturityLevel'), maturity],
  ];

  autoTable(pdf, {
    startY: y,
    body: appendixData,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  addHeaderFooter(pageNum);

  // ── Fix page numbers: "Page X of Y" ──
  totalPages = pageNum;
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    // Overwrite page number area
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin - 2, pageH - 14, 40, 6, 'F');
    pdf.text(`${l(lang, 'page')} ${i} ${l(lang, 'of')} ${pageCount}`, margin, pageH - 10);
  }

  // ── Save ──
  const fileName = `${orgName.replace(/[^a-zA-Z0-9]/g, '_')}_Assessment_Report_${dateStr}.pdf`;
  pdf.save(fileName);
}

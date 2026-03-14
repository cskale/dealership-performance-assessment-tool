import * as XLSX from 'xlsx';

export interface ExcelExportParams {
  dealerName: string;
  assessmentDate: string;
  overallScore: number;
  maturityLevel: string;
  kpiData: Array<{
    category: string;
    score: number;
    benchmark: number;
    gap: number;
    confidence?: string;
  }>;
  actionData: Array<{
    title: string;
    priority: string;
    owner?: string;
    dueDate?: string;
    triageScore?: number;
    status: string;
  }>;
  gapAnalysisData: Array<{
    department: string;
    score: number;
    benchmark: number;
    gap: number;
    confidenceLevel?: string;
    systemicPatterns?: string;
  }>;
}

export function generateExcelReport(params: ExcelExportParams): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Cover
  const coverRows = [
    ['DEALER DIAGNOSTIC REPORT'],
    [],
    ['Dealer Name', params.dealerName],
    ['Assessment Date', params.assessmentDate],
    ['Overall Score', `${params.overallScore}%`],
    ['Maturity Level', params.maturityLevel],
    ['Generated On', new Date().toLocaleDateString('en-GB')],
    [],
    ['Benchmark Note',
     'Benchmark values are indicative. Segmented benchmarks available in enterprise tier.'],
  ];
  const coverSheet = XLSX.utils.aoa_to_sheet(coverRows);
  coverSheet['!cols'] = [{ wch: 22 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, coverSheet, 'Cover');

  // Sheet 2: KPI Summary
  const kpiHeaders = ['Category', 'Score (%)', 'Benchmark (%)', 'Gap', 'Confidence'];
  const kpiRows = params.kpiData.map(k => [
    k.category, k.score, k.benchmark, k.gap, k.confidence ?? 'N/A'
  ]);
  const kpiSheet = XLSX.utils.aoa_to_sheet([kpiHeaders, ...kpiRows]);
  kpiSheet['!cols'] = [{ wch: 32 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPI Summary');

  // Sheet 3: Action Plan
  const actionHeaders = [
    'Action', 'Priority', 'Owner', 'Due Date', 'Triage Score', 'Status'
  ];
  const actionRows = params.actionData.map(a => [
    a.title, a.priority, a.owner ?? '—', a.dueDate ?? '—',
    a.triageScore ?? '—', a.status
  ]);
  const actionSheet = XLSX.utils.aoa_to_sheet([actionHeaders, ...actionRows]);
  actionSheet['!cols'] = [
    { wch: 42 }, { wch: 12 }, { wch: 22 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, actionSheet, 'Action Plan');

  // Sheet 4: Gap Analysis
  const gapHeaders = [
    'Department', 'Score (%)', 'Benchmark (%)', 'Gap',
    'Confidence', 'Systemic Patterns'
  ];
  const gapRows = params.gapAnalysisData.map(g => [
    g.department, g.score, g.benchmark, g.gap,
    g.confidenceLevel ?? 'N/A',
    g.systemicPatterns ?? 'None detected'
  ]);
  const gapSheet = XLSX.utils.aoa_to_sheet([gapHeaders, ...gapRows]);
  gapSheet['!cols'] = [
    { wch: 28 }, { wch: 12 }, { wch: 14 }, { wch: 10 },
    { wch: 14 }, { wch: 32 }
  ];
  XLSX.utils.book_append_sheet(wb, gapSheet, 'Gap Analysis');

  // Trigger download
  const safeName = params.dealerName.replace(/[^a-zA-Z0-9_\-]/g, '_');
  XLSX.writeFile(wb, `DealerDiagnostic_${safeName}_${params.assessmentDate}.xlsx`);
}

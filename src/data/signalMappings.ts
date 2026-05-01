/**
 * Signal Mappings Inventory
 * 
 * Deterministic mapping of each question to signal codes.
 * Auto-generated based on question metadata (category, linkedKPIs).
 * 
 * Mapping Rules:
 * - Category-based: process→PROCESS_NOT_EXECUTED, governance→GOVERNANCE_WEAK, etc.
 * - KPI-based: linkedKPIs present→KPI_NOT_REVIEWED
 * - Default: NONE for questions without clear signal match
 * 
 * Coverage: All 50 questions must appear here.
 * 
 * rootCauseDimension: Identifies which of the 5 root cause dimensions
 * (people, process, tools, structure, incentives) is most relevant,
 * enabling KPI-specific action template selection.
 */

import { SignalMapping, SignalCode, RootCauseDimension } from './signalTypes';

export interface EnrichedSignalMapping extends SignalMapping {
  rootCauseDimension?: RootCauseDimension;
}

/**
 * Category-to-signal mapping rules
 */
const CATEGORY_SIGNAL_MAP: Record<string, SignalCode> = {
  volume: 'CAPACITY_MISALIGNED',
  conversion: 'PROCESS_NOT_EXECUTED',
  satisfaction: 'KPI_NOT_REVIEWED',
  profitability: 'KPI_NOT_REVIEWED',
  efficiency: 'PROCESS_NOT_EXECUTED',
  digital: 'TOOL_UNDERUTILISED',
  technology: 'TOOL_UNDERUTILISED',
  training: 'ROLE_OWNERSHIP_MISSING',
  certification: 'ROLE_OWNERSHIP_MISSING',
  inventory: 'PROCESS_NOT_STANDARDISED',
  turnover: 'PROCESS_NOT_STANDARDISED',
  obsolete: 'GOVERNANCE_WEAK',
  financial: 'KPI_NOT_REVIEWED',
  cashflow: 'KPI_NOT_REVIEWED',
  floorplan: 'GOVERNANCE_WEAK',
  costs: 'GOVERNANCE_WEAK',
  pricing: 'PROCESS_NOT_STANDARDISED',
  quality: 'PROCESS_NOT_EXECUTED',
  accuracy: 'PROCESS_NOT_STANDARDISED',
  availability: 'CAPACITY_MISALIGNED',
  warranty: 'PROCESS_NOT_EXECUTED',
  retention: 'KPI_NOT_REVIEWED',
  parts: 'CAPACITY_MISALIGNED',
  emergency: 'CAPACITY_MISALIGNED',
  vendor: 'GOVERNANCE_WEAK',
  wholesale: 'PROCESS_NOT_STANDARDISED',
  returns: 'PROCESS_NOT_EXECUTED',
  counter: 'PROCESS_NOT_EXECUTED',
  productivity: 'CAPACITY_MISALIGNED',
  express: 'PROCESS_NOT_EXECUTED',
  facility: 'CAPACITY_MISALIGNED',
  data: 'TOOL_UNDERUTILISED'
};

/**
 * Derive signal code from question category
 */
function deriveSignalFromCategory(category: string): SignalCode {
  const normalizedCategory = category.toLowerCase();
  return CATEGORY_SIGNAL_MAP[normalizedCategory] || 'NONE';
}

/**
 * Complete question-to-signal mappings for all 50 questions
 * Now enriched with rootCauseDimension for KPI-specific action selection
 */
export const SIGNAL_MAPPINGS: EnrichedSignalMapping[] = [
  // =====================================================
  // NEW VEHICLE SALES PERFORMANCE (nvs-1 to nvs-10)
  // =====================================================
  {
    questionId: 'nvs-1',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    secondarySignalCode: 'KPI_NOT_REVIEWED',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Volume metric - capacity alignment issue if low'
  },
  {
    questionId: 'nvs-2',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'PROCESS_NOT_EXECUTED',
    secondarySignalCode: 'KPI_NOT_REVIEWED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Conversion metric - sales process execution'
  },
  {
    questionId: 'nvs-3',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    severityRule: 'standard',
    rootCauseDimension: 'process',
    notes: 'Customer satisfaction - KPI tracking issue'
  },
  {
    questionId: 'nvs-4',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    secondarySignalCode: 'PROCESS_NOT_STANDARDISED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Profitability metric - pricing strategy'
  },
  {
    questionId: 'nvs-5',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'standard',
    rootCauseDimension: 'process',
    notes: 'Efficiency metric - delivery process'
  },
  {
    questionId: 'nvs-6',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'TOOL_UNDERUTILISED',
    secondarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'weighted',
    rootCauseDimension: 'tools',
    notes: 'Digital metric - online lead conversion'
  },
  {
    questionId: 'nvs-7',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'ROLE_OWNERSHIP_MISSING',
    severityRule: 'standard',
    rootCauseDimension: 'people',
    notes: 'Training metric - staff development'
  },
  {
    questionId: 'nvs-8',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'PROCESS_NOT_STANDARDISED',
    secondarySignalCode: 'GOVERNANCE_WEAK',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Inventory turnover - stock management'
  },
  {
    questionId: 'nvs-9',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    secondarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Financial metric - F&I penetration'
  },
  {
    questionId: 'nvs-10',
    moduleKey: 'new-vehicle-sales',
    primarySignalCode: 'TOOL_UNDERUTILISED',
    severityRule: 'standard',
    rootCauseDimension: 'tools',
    notes: 'Technology metric - CRM utilization'
  },

  // =====================================================
  // USED VEHICLE SALES PERFORMANCE (uvs-1 to uvs-10)
  // =====================================================
  {
    questionId: 'uvs-1',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'PROCESS_NOT_STANDARDISED',
    secondarySignalCode: 'GOVERNANCE_WEAK',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Turnover metric - inventory management'
  },
  {
    questionId: 'uvs-2',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    secondarySignalCode: 'PROCESS_NOT_STANDARDISED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Profitability metric - pricing strategy'
  },
  {
    questionId: 'uvs-3',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'PROCESS_NOT_STANDARDISED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Accuracy metric - appraisal process'
  },
  {
    questionId: 'uvs-4',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'GOVERNANCE_WEAK',
    secondarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Cost metric - reconditioning efficiency'
  },
  {
    questionId: 'uvs-5',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'TOOL_UNDERUTILISED',
    severityRule: 'standard',
    rootCauseDimension: 'tools',
    notes: 'Digital metric - pricing tools'
  },
  {
    questionId: 'uvs-6',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Inventory balance - trade-in vs acquisition'
  },
  {
    questionId: 'uvs-7',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    severityRule: 'standard',
    rootCauseDimension: 'process',
    notes: 'Customer satisfaction - used car experience'
  },
  {
    questionId: 'uvs-8',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'TOOL_UNDERUTILISED',
    secondarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'weighted',
    rootCauseDimension: 'tools',
    notes: 'Digital metric - online presence'
  },
  {
    questionId: 'uvs-9',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'PROCESS_NOT_STANDARDISED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Pricing metric - market positioning'
  },
  {
    questionId: 'uvs-10',
    moduleKey: 'used-vehicle-sales',
    primarySignalCode: 'GOVERNANCE_WEAK',
    secondarySignalCode: 'PROCESS_NOT_STANDARDISED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Inventory metric - aged stock management'
  },

  // =====================================================
  // SERVICE PERFORMANCE (svc-1 to svc-12)
  // =====================================================
  {
    questionId: 'svc-1',
    moduleKey: 'service-performance',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    secondarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Efficiency metric - labor utilization'
  },
  {
    questionId: 'svc-2',
    moduleKey: 'service-performance',
    primarySignalCode: 'PROCESS_NOT_STANDARDISED',
    secondarySignalCode: 'KPI_NOT_REVIEWED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Pricing metric - labor rate realization'
  },
  {
    questionId: 'svc-3',
    moduleKey: 'service-performance',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Availability metric - appointment capacity'
  },
  {
    questionId: 'svc-4',
    moduleKey: 'service-performance',
    primarySignalCode: 'PROCESS_NOT_EXECUTED',
    secondarySignalCode: 'ROLE_OWNERSHIP_MISSING',
    severityRule: 'weighted',
    rootCauseDimension: 'people',
    notes: 'Quality metric - first-time fix rate'
  },
  {
    questionId: 'svc-5',
    moduleKey: 'service-performance',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Satisfaction metric - service experience'
  },
  {
    questionId: 'svc-6',
    moduleKey: 'service-performance',
    primarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Warranty metric - claim processing'
  },
  {
    questionId: 'svc-7',
    moduleKey: 'service-performance',
    primarySignalCode: 'ROLE_OWNERSHIP_MISSING',
    severityRule: 'standard',
    rootCauseDimension: 'people',
    notes: 'Certification metric - technician skills'
  },
  {
    questionId: 'svc-8',
    moduleKey: 'service-performance',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    secondarySignalCode: 'GOVERNANCE_WEAK',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Retention metric - customer loyalty'
  },
  {
    questionId: 'svc-9',
    moduleKey: 'service-performance',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Parts metric - service parts availability'
  },
  {
    questionId: 'svc-10',
    moduleKey: 'service-performance',
    primarySignalCode: 'TOOL_UNDERUTILISED',
    severityRule: 'standard',
    rootCauseDimension: 'tools',
    notes: 'Digital metric - customer communication tools'
  },
  {
    questionId: 'svc-11',
    moduleKey: 'service-performance',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    secondarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Productivity metric - advisor throughput'
  },
  {
    questionId: 'svc-12',
    moduleKey: 'service-performance',
    primarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'standard',
    rootCauseDimension: 'process',
    notes: 'Express metric - quick service efficiency'
  },

  // =====================================================
  // PARTS AND INVENTORY PERFORMANCE (pts-1 to pts-10)
  // =====================================================
  {
    questionId: 'pts-1',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'PROCESS_NOT_STANDARDISED',
    secondarySignalCode: 'GOVERNANCE_WEAK',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Turnover metric - inventory management'
  },
  {
    questionId: 'pts-2',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Availability metric - parts fill rate'
  },
  {
    questionId: 'pts-3',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    secondarySignalCode: 'PROCESS_NOT_STANDARDISED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Profitability metric - parts margin'
  },
  {
    questionId: 'pts-4',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'GOVERNANCE_WEAK',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Obsolete metric - dead stock management'
  },
  {
    questionId: 'pts-5',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'PROCESS_NOT_STANDARDISED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Accuracy metric - order accuracy'
  },
  {
    questionId: 'pts-6',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'PROCESS_NOT_STANDARDISED',
    severityRule: 'standard',
    rootCauseDimension: 'process',
    notes: 'Wholesale metric - external sales'
  },
  {
    questionId: 'pts-7',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Returns metric - error rate'
  },
  {
    questionId: 'pts-8',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    severityRule: 'standard',
    rootCauseDimension: 'structure',
    notes: 'Emergency metric - urgent sourcing'
  },
  {
    questionId: 'pts-9',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'PROCESS_NOT_EXECUTED',
    severityRule: 'standard',
    rootCauseDimension: 'process',
    notes: 'Counter metric - service speed'
  },
  {
    questionId: 'pts-10',
    moduleKey: 'parts-inventory',
    primarySignalCode: 'GOVERNANCE_WEAK',
    severityRule: 'standard',
    rootCauseDimension: 'incentives',
    notes: 'Vendor metric - supplier relationships'
  },

  // =====================================================
  // FINANCIAL OPERATIONS & OVERALL PERFORMANCE (fin-1 to fin-8)
  // =====================================================
  {
    questionId: 'fin-1',
    moduleKey: 'financial-operations',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    secondarySignalCode: 'GOVERNANCE_WEAK',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Profitability metric - overall trend'
  },
  {
    questionId: 'fin-2',
    moduleKey: 'financial-operations',
    primarySignalCode: 'KPI_NOT_REVIEWED',
    secondarySignalCode: 'GOVERNANCE_WEAK',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Cashflow metric - financial stability'
  },
  {
    questionId: 'fin-3',
    moduleKey: 'financial-operations',
    primarySignalCode: 'GOVERNANCE_WEAK',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Floorplan metric - financing management'
  },
  {
    questionId: 'fin-4',
    moduleKey: 'financial-operations',
    primarySignalCode: 'GOVERNANCE_WEAK',
    secondarySignalCode: 'PROCESS_NOT_STANDARDISED',
    severityRule: 'weighted',
    rootCauseDimension: 'process',
    notes: 'Costs metric - expense control'
  },
  {
    questionId: 'fin-5',
    moduleKey: 'financial-operations',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Productivity metric - revenue per employee'
  },
  {
    questionId: 'fin-6',
    moduleKey: 'financial-operations',
    primarySignalCode: 'TOOL_UNDERUTILISED',
    severityRule: 'weighted',
    rootCauseDimension: 'tools',
    notes: 'Technology metric - ROI on investments'
  },
  {
    questionId: 'fin-7',
    moduleKey: 'financial-operations',
    primarySignalCode: 'CAPACITY_MISALIGNED',
    severityRule: 'weighted',
    rootCauseDimension: 'structure',
    notes: 'Facility metric - space utilization'
  },
  {
    questionId: 'fin-8',
    moduleKey: 'financial-operations',
    primarySignalCode: 'TOOL_UNDERUTILISED',
    severityRule: 'standard',
    rootCauseDimension: 'tools',
    notes: 'Data metric - customer database management'
  }
];

/**
 * Get mapping for a specific question
 */
export function getSignalMapping(questionId: string): EnrichedSignalMapping | undefined {
  return SIGNAL_MAPPINGS.find(m => m.questionId === questionId);
}

/**
 * Get all mappings for a module
 */
export function getMappingsForModule(moduleKey: string): EnrichedSignalMapping[] {
  return SIGNAL_MAPPINGS.filter(m => m.moduleKey === moduleKey);
}

/**
 * Validate that all questions are mapped (for testing)
 */
export function validateMappingCoverage(questionIds: string[]): { 
  covered: string[]; 
  missing: string[]; 
  coveragePercent: number;
} {
  const mappedIds = new Set(SIGNAL_MAPPINGS.map(m => m.questionId));
  const covered = questionIds.filter(id => mappedIds.has(id));
  const missing = questionIds.filter(id => !mappedIds.has(id));
  
  return {
    covered,
    missing,
    coveragePercent: (covered.length / questionIds.length) * 100
  };
}

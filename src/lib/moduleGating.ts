import { Section } from '@/data/questionnaire';

export type BusinessModel = 'sales_only' | 'service_only' | '2s' | '3s' | '4s' | null | undefined;

export interface ModuleGatingRule {
  sectionId: string;
  requiredModels: BusinessModel[];
  suppressedFor: BusinessModel[];
  suppressionReason: string;
}

export const MODULE_GATING_RULES: ModuleGatingRule[] = [
  {
    sectionId: 'new-vehicle-sales',
    requiredModels: ['sales_only', '2s', '3s', '4s'],
    suppressedFor: ['service_only'],
    suppressionReason: 'New vehicle sales is not applicable for service-only operations'
  },
  {
    sectionId: 'used-vehicle-sales',
    requiredModels: ['sales_only', '2s', '3s', '4s'],
    suppressedFor: ['service_only'],
    suppressionReason: 'Used vehicle sales is not applicable for service-only operations'
  },
  {
    sectionId: 'service-performance',
    requiredModels: ['service_only', '2s', '3s', '4s'],
    suppressedFor: ['sales_only'],
    suppressionReason: 'Service performance is not applicable for sales-only operations'
  },
  {
    sectionId: 'parts-inventory',
    requiredModels: ['3s', '4s', 'service_only'],
    suppressedFor: ['sales_only', '2s'],
    suppressionReason: 'Parts & inventory requires a parts department (3S or 4S business model)'
  },
  {
    sectionId: 'financial-operations',
    requiredModels: [],
    suppressedFor: [],
    suppressionReason: ''
  }
];

export function isSectionSuppressed(
  sectionId: string,
  businessModel: BusinessModel
): { suppressed: boolean; reason: string } {
  if (!businessModel) return { suppressed: false, reason: '' };
  const rule = MODULE_GATING_RULES.find(r => r.sectionId === sectionId);
  if (!rule || rule.suppressedFor.length === 0) return { suppressed: false, reason: '' };
  const suppressed = rule.suppressedFor.includes(businessModel);
  return { suppressed, reason: suppressed ? rule.suppressionReason : '' };
}

export function getActiveSections(
  allSections: Section[],
  businessModel: BusinessModel
): Section[] {
  if (!businessModel) return allSections;
  return allSections.filter(section => {
    const { suppressed } = isSectionSuppressed(section.id, businessModel);
    return !suppressed;
  });
}

export function getSuppressedSectionCount(
  allSections: Section[],
  businessModel: BusinessModel
): number {
  if (!businessModel) return 0;
  return allSections.filter(section => {
    const { suppressed } = isSectionSuppressed(section.id, businessModel);
    return suppressed;
  }).length;
}

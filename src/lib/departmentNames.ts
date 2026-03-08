/**
 * Shared department name mappings
 * Single source of truth for department display names across the application.
 */

export const DEPARTMENT_NAMES: Record<string, Record<string, string>> = {
  'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
  'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
  'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
  'parts-inventory': { en: 'Parts & Inventory', de: 'Teile & Lager' },
  'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen' },
  'customer-satisfaction': { en: 'Customer Satisfaction', de: 'Kundenzufriedenheit' },
  'marketing-digital': { en: 'Marketing & Digital', de: 'Marketing & Digital' },
  'workforce-hr': { en: 'Workforce & HR', de: 'Personal & HR' },
  'ev-readiness': { en: 'EV Readiness', de: 'E-Mobilität Bereitschaft' },
  'sales-process': { en: 'Sales Process & Pipeline', de: 'Vertriebsprozess & Pipeline' }
};

export const DEPARTMENT_NAMES_FULL: Record<string, Record<string, string>> = {
  'new-vehicle-sales': { en: 'New Vehicle Sales Performance', de: 'Neuwagenverkaufsleistung' },
  'used-vehicle-sales': { en: 'Used Vehicle Sales Performance', de: 'Gebrauchtwagenverkaufsleistung' },
  'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
  'parts-inventory': { en: 'Parts & Inventory Performance', de: 'Teile- und Lagerleistung' },
  'financial-operations': { en: 'Financial Operations Performance', de: 'Finanzoperationsleistung' },
  'customer-satisfaction': { en: 'Customer Satisfaction Performance', de: 'Kundenzufriedenheitsleistung' },
  'marketing-digital': { en: 'Marketing & Digital Performance', de: 'Marketing- & Digitalleistung' },
  'workforce-hr': { en: 'Workforce & HR Performance', de: 'Personal- & HR-Leistung' },
  'ev-readiness': { en: 'EV Readiness Performance', de: 'E-Mobilität Bereitschaftsleistung' },
  'sales-process': { en: 'Sales Process & Pipeline Performance', de: 'Vertriebsprozess- & Pipeline-Leistung' }
};

export function getDepartmentName(dept: string, language: string, full = false): string {
  const map = full ? DEPARTMENT_NAMES_FULL : DEPARTMENT_NAMES;
  return map[dept]?.[language] || dept.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Shared department name mappings
 * WRAPPER: Reads from canonical departmentConfig.ts source
 */

import { DEPARTMENT_CONFIG, getDepartmentConfig } from './departmentConfig';

// Derive DEPARTMENT_NAMES from canonical DEPARTMENT_CONFIG source
export const DEPARTMENT_NAMES: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(DEPARTMENT_CONFIG).map(([key, config]) => [key, config.label])
);

// Full names with "Performance" suffix
export const DEPARTMENT_NAMES_FULL: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(DEPARTMENT_CONFIG).map(([key, config]) => [
    key,
    {
      en: `${config.label.en} Performance`,
      de: `${config.label.de}sleistung`,
    },
  ])
);

export function getDepartmentName(dept: string, language: string, full = false): string {
  const config = getDepartmentConfig(dept);
  if (full) {
    return DEPARTMENT_NAMES_FULL[dept]?.[language] || 
           `${config.label[language as 'en' | 'de'] || config.label.en} Performance`;
  }
  return config.label[language as 'en' | 'de'] || config.label.en;
}

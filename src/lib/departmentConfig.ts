import {
  Car, CarFront, Wrench, Package, DollarSign,
  HeartHandshake, Megaphone, Users, Zap, GitBranch
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DepartmentConfig {
  icon: LucideIcon;
  label: { en: string; de: string };
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
}

export const DEPARTMENT_CONFIG: Record<string, DepartmentConfig> = {
  'new-vehicle-sales': {
    icon: Car,
    label: { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    dotClass: 'bg-blue-500',
  },
  'used-vehicle-sales': {
    icon: CarFront,
    label: { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  'service-performance': {
    icon: Wrench,
    label: { en: 'Service Performance', de: 'Serviceleistung' },
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  'parts-inventory': {
    icon: Package,
    label: { en: 'Parts & Inventory', de: 'Teile & Lager' },
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    dotClass: 'bg-amber-500',
  },
  'financial-operations': {
    icon: DollarSign,
    label: { en: 'Financial Operations', de: 'Finanzoperationen' },
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
    dotClass: 'bg-green-500',
  },
  'customer-satisfaction': {
    icon: HeartHandshake,
    label: { en: 'Customer Satisfaction', de: 'Kundenzufriedenheit' },
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    dotClass: 'bg-rose-500',
  },
  'marketing-digital': {
    icon: Megaphone,
    label: { en: 'Marketing & Digital', de: 'Marketing & Digital' },
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    dotClass: 'bg-purple-500',
  },
  'workforce-hr': {
    icon: Users,
    label: { en: 'Workforce & HR', de: 'Personal & HR' },
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
    dotClass: 'bg-sky-500',
  },
  'ev-readiness': {
    icon: Zap,
    label: { en: 'EV Readiness', de: 'E-Mobilität Bereitschaft' },
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-200',
    dotClass: 'bg-teal-500',
  },
  'sales-process': {
    icon: GitBranch,
    label: { en: 'Sales Process & Pipeline', de: 'Vertriebsprozess & Pipeline' },
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
    dotClass: 'bg-orange-500',
  },
};

export const ROOT_CAUSE_DIMENSIONS = [
  { key: 'people', label: { en: 'People', de: 'Personal' }, bgClass: 'bg-blue-50', textClass: 'text-blue-700', iconBgClass: 'bg-blue-100' },
  { key: 'process', label: { en: 'Process', de: 'Prozess' }, bgClass: 'bg-emerald-50', textClass: 'text-emerald-700', iconBgClass: 'bg-emerald-100' },
  { key: 'tools', label: { en: 'Tools', de: 'Werkzeuge' }, bgClass: 'bg-purple-50', textClass: 'text-purple-700', iconBgClass: 'bg-purple-100' },
  { key: 'structure', label: { en: 'Structure', de: 'Struktur' }, bgClass: 'bg-orange-50', textClass: 'text-orange-700', iconBgClass: 'bg-orange-100' },
  { key: 'incentives', label: { en: 'Incentives', de: 'Anreize' }, bgClass: 'bg-amber-50', textClass: 'text-amber-700', iconBgClass: 'bg-amber-100' },
] as const;

export const ORDERED_DEPARTMENTS = [
  'new-vehicle-sales', 'used-vehicle-sales', 'service-performance',
  'parts-inventory', 'financial-operations', 'customer-satisfaction',
  'marketing-digital', 'workforce-hr', 'ev-readiness', 'sales-process'
];

export function getDepartmentConfig(deptKey: string): DepartmentConfig {
  return DEPARTMENT_CONFIG[deptKey] || {
    icon: GitBranch,
    label: { en: 'Other', de: 'Sonstige' },
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-200',
    dotClass: 'bg-gray-500',
  };
}
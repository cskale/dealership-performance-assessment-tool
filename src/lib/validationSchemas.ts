import { z } from 'zod';

// ── Action Sheet ──
export const actionSchema = z.object({
  action_title: z.string().trim().min(1, 'Title is required').max(500, 'Title must be under 500 characters'),
  action_description: z.string().trim().max(5000, 'Description must be under 5,000 characters').optional().default(''),
  department: z.string().trim().max(100).optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  status: z.string().trim().max(50).optional().default('Open'),
  responsible_person: z.string().trim().max(200).nullable().optional(),
  target_completion_date: z.string().nullable().optional(),
  support_required_from: z.array(z.string().max(100)).max(20).optional(),
  kpis_linked_to: z.array(z.string().max(200)).max(50).optional(),
  impact_score: z.number().int().min(1).max(5).nullable().optional(),
  effort_score: z.number().int().min(1).max(5).nullable().optional(),
  urgency_score: z.number().int().min(1).max(5).nullable().optional(),
});

export type ActionFormData = z.infer<typeof actionSchema>;

// ── Organization Settings ──
export const organizationSettingsSchema = z.object({
  brand_mode: z.string().max(50).nullable(),
  oem_authorization: z.string().max(50).nullable(),
  network_structure: z.string().max(50).nullable(),
  business_model: z.string().max(50).nullable(),
  positioning: z.string().max(50).nullable(),
  default_language: z.string().max(10).nullable(),
  country: z.string().trim().max(100, 'Country must be under 100 characters').nullable(),
  city: z.string().trim().max(100, 'City must be under 100 characters').nullable(),
  logo_url: z.string().url().max(2000).nullable().optional(),
  oem_brands: z.array(z.string().max(100)).max(50).nullable(),
  product_segments: z.array(z.string().max(50)).max(20).nullable(),
  operational_focus: z.array(z.string().max(50)).max(20).nullable(),
});

// ── Dealer Context Form ──
export const dealerContextSchema = z.object({
  brandRepresented: z.string().trim().min(1, 'Brand is required').max(100),
  marketType: z.string().trim().min(1, 'Market type is required').max(50),
  annualUnitSales: z.string().refine(v => {
    const n = parseInt(v, 10);
    return !isNaN(n) && n > 0 && n <= 1_000_000;
  }, 'Annual unit sales must be between 1 and 1,000,000'),
  avgGrossProfitPerUnit: z.string().optional().refine(v => {
    if (!v || v === '') return true;
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 10_000_000;
  }, 'Must be a valid number'),
  avgMonthlyLeads: z.string().optional().refine(v => {
    if (!v || v === '') return true;
    const n = parseInt(v, 10);
    return !isNaN(n) && n >= 0 && n <= 1_000_000;
  }, 'Must be a valid number'),
});

// ── Profile (Account page) ──
export const profileSchema = z.object({
  display_name: z.string().trim().min(1, 'Display name is required').max(100, 'Display name must be under 100 characters'),
  job_title: z.string().trim().max(100, 'Job title must be under 100 characters').optional().default(''),
  department: z.string().trim().max(100, 'Department must be under 100 characters').optional().default(''),
  bio: z.string().trim().max(1000, 'Bio must be under 1,000 characters').optional().default(''),
  timezone: z.string().max(50).optional().default('UTC'),
});

// ── Assessment Notes ──
export const assessmentNoteSchema = z.object({
  notes: z.string().trim().max(5000, 'Note must be under 5,000 characters'),
});



# Integrate All 100 KPIs into the Encyclopedia

## Current State

- **27 enriched KPIs** in `kpiDefinitions.ts` (KPIs 1-25 New Vehicle Sales + 2 Used Vehicle: Inventory Turn, Days in Inventory)
- **11 legacy shallow KPIs** (no root cause diagnostics)
- **5 department categories** registered

## What Was Successfully Parsed

From the 5 PDFs, I extracted full data for **KPIs 26-100**. KPIs_1-50.pdf failed to parse (those KPIs 1-25 are already integrated). Here's the complete mapping:

| # | KPI | Document Source | Department |
|---|-----|----------------|------------|
| 26 | Aged Stock % (>90 Days) | KPIs_51-100.pdf | used-vehicle-sales |
| 27 | Stock-to-Sales Ratio | KPIs_51-100.pdf | used-vehicle-sales |
| 28 | Reconditioning Cycle Time | KPIs_51-100.pdf | used-vehicle-sales |
| 29 | Gross per Used Vehicle | KPIs_51-100.pdf | used-vehicle-sales |
| 30 | Price to Market Ratio | KPIs_51-100.pdf | used-vehicle-sales |
| 31 | Appraisal Accuracy Rate | KPIs_51-100.pdf | used-vehicle-sales |
| 32 | Trade-In Capture Rate | KPIs_51-100.pdf | used-vehicle-sales |
| 33 | Auction Profitability % | KPIs_51-100.pdf | used-vehicle-sales |
| 34 | Units Sold per Used Car Manager | KPIs_51-100.pdf | used-vehicle-sales |
| 35 | Reconditioning Cost per Unit | KPIs_51-100.pdf | used-vehicle-sales |
| 36 | Digital Lead to Sale Conversion | KPIs_51-100.pdf | used-vehicle-sales |
| 37 | Wholesale Leakage % | KPIs_51-100.pdf | used-vehicle-sales |
| 38 | Technician Productivity % | KPIs_51-100.pdf | service-performance |
| 39 | Technician Efficiency % | KPIs_51-100.pdf | service-performance |
| 40 | Labor Utilization Rate | KPIs_51-100.pdf | service-performance |
| 41 | Labor Sales per RO | KPIs_51-100.pdf | service-performance |
| 42 | Revenue per Technician | KPIs_51-100.pdf | service-performance |
| 43 | First-Time Fix Rate | KPIs_51-100.pdf | service-performance |
| 44 | Comeback Rate | KPIs_51-100.pdf | service-performance |
| 45 | CSI – Service | KPIs_51-100.pdf | service-performance |
| 46 | Net Promoter Score (Service) | KPIs_51-100.pdf | service-performance |
| 47 | Appointment Lead Time | KPIs_100-150.pdf | service-performance |
| 48 | Service Retention Rate | KPIs_100-150.pdf | service-performance |
| 49 | Revenue per Customer | KPIs_100-150.pdf | service-performance |
| 50 | Menu Selling Penetration | KPIs_100-150.pdf | service-performance |
| 51 | Maintenance Plan Penetration | KPIs_100-150.pdf | service-performance |
| 52 | Warranty vs Retail Mix % | KPIs_100-150.pdf | parts-inventory |
| 53 | Parts Gross Margin % | KPIs_100-150.pdf | parts-inventory |
| 54 | Parts Inventory Turn | KPIs_100-150.pdf | parts-inventory |
| 55 | Parts Obsolescence % | KPIs_100-150.pdf | parts-inventory |
| 56 | Fill Rate % | KPIs_100-150.pdf | parts-inventory |
| 57 | Lost Sales % | KPIs_100-150.pdf | parts-inventory |
| 58 | Counter Sales Ratio | KPIs_100-150.pdf | parts-inventory |
| 59 | Internal vs External Mix % | KPIs_100-150.pdf | parts-inventory |
| 60 | Parts Days on Hand | KPIs_100-150.pdf | parts-inventory |
| 61 | Overall CSI | KPIs_100-150.pdf | customer-satisfaction |
| 62 | Sales CSI | KPIs_100-150.pdf | customer-satisfaction |
| 63 | Service CSI | KPIs_100-150.pdf | customer-satisfaction |
| 64 | Online Review Score | KPIs_100-150.pdf | customer-satisfaction |
| 65 | Complaint Resolution Time | KPIs_100-150.pdf | customer-satisfaction |
| 66 | Repeat Purchase Rate | KPIs_100-150.pdf | customer-satisfaction |
| 67 | Cost per Lead | KPIs_100-150.pdf | marketing-digital |
| 68 | Cost per Sale | KPIs_150-200.pdf | marketing-digital |
| 69 | Website Conversion Rate | KPIs_150-200.pdf | marketing-digital |
| 70 | Digital Appointment Ratio | KPIs_150-200.pdf | marketing-digital |
| 71 | Social Media Engagement to Lead | KPIs_150-200.pdf | marketing-digital |
| 72 | Marketing ROI | KPIs_150-200.pdf | marketing-digital |
| 73 | Paid vs Organic Lead Mix | KPIs_150-200.pdf | marketing-digital |
| 74 | Employee Turnover Rate | KPIs_150-200.pdf | workforce-hr |
| 75 | Sales Staff Turnover | KPIs_150-200.pdf | workforce-hr |
| 76 | Technician Retention Rate | KPIs_150-200.pdf | workforce-hr |
| 77 | Absenteeism Rate | KPIs_150-200.pdf | workforce-hr |
| 78 | Training Hours per Employee | KPIs_150-200.pdf | workforce-hr |
| 79 | Revenue per Employee | KPIs_150-200.pdf | workforce-hr |
| 80 | Sales per Headcount | KPIs_150-200.pdf | workforce-hr |
| 81 | EV Sales Penetration | KPIs_150-200.pdf | ev-readiness |
| 82 | EV Service Readiness Index | KPIs_150-200.pdf | ev-readiness |
| 83 | Charger Utilization Rate | KPIs_150-200.pdf | ev-readiness |
| 84 | EV Gross per Unit | KPIs_150-200.pdf | ev-readiness |
| 85 | Battery Claim Rate | KPIs_150-200.pdf | ev-readiness |
| 86 | Sales Process Compliance % | KPIs_150-200.pdf | sales-process |
| 87 | CRM Data Completeness Rate | KPIs_150-200.pdf | sales-process |
| 88 | Follow-Up Completion Rate | KPIs_200-250.pdf | sales-process |
| 89 | Pipeline Hygiene Score | KPIs_200-250.pdf | sales-process |
| 90 | Quote-to-Order Ratio | KPIs_200-250.pdf | sales-process |
| 91 | Total Dealership Net Profit % | KPIs_200-250.pdf | financial-operations |
| 92 | Operating Margin % | KPIs_200-250.pdf | financial-operations |
| 93 | EBITDA Margin | KPIs_200-250.pdf | financial-operations |
| 94 | Gross Profit per Department | KPIs_200-250.pdf | financial-operations |
| 95 | Total Gross Margin % | KPIs_200-250.pdf | financial-operations |
| 96 | Net Profit per Vehicle Retail | KPIs_200-250.pdf | financial-operations |
| 97 | Gross Profit per Employee | KPIs_200-250.pdf | financial-operations |
| 98 | Break-even Volume | KPIs_200-250.pdf | financial-operations |
| 99 | Contribution Margin per Unit | KPIs_200-250.pdf | financial-operations |
| 100 | Overhead Cost Ratio % | KPIs_200-250.pdf | financial-operations |

## Implementation Approach

Due to the massive size (~75 KPI entries × ~40 lines each = ~3,000+ lines), this will be implemented across multiple steps to stay within file size limits.

### Step 1: Add new department categories
**File: `src/lib/departmentNames.ts`**
Add 4 new departments: `customer-satisfaction`, `marketing-digital`, `workforce-hr`, `ev-readiness`, `sales-process`.

### Step 2: Add KPIs 26-50 (Used Vehicle + Service/Aftersales)
**File: `src/lib/kpiDefinitions.ts`**
Insert before the LEGACY section. Each entry follows the enriched schema with all fields from the documents.

### Step 3: Add KPIs 51-75 (Parts, Customer Satisfaction, Marketing, HR)
**File: `src/lib/kpiDefinitions.ts`**

### Step 4: Add KPIs 76-100 (HR continued, EV, Sales Process, Financial)
**File: `src/lib/kpiDefinitions.ts`**

### Step 5: Update UsefulResources.tsx
**File: `src/components/UsefulResources.tsx`**
Add the new department categories to the `DEPARTMENT_MAP` so KPIs render in the encyclopedia accordion under proper headings.

## Data Quality

All 75 new KPIs have been fully extracted from the PDFs with:
- Definition, Executive Summary, Formula
- Inclusions/Exclusions, Unit of Measure, Benchmark
- Root Cause Diagnostics (all 5 dimensions)
- Improvement Levers (5-10 per KPI)
- Interdependencies (upstream drivers + downstream impacts)

Only KPI 87 (CRM Data Completeness Rate) was partially truncated in the document — I'll reconstruct it from cross-references in other KPIs.

## Files to Change

| File | Change |
|------|--------|
| `src/lib/departmentNames.ts` | Add 5 new department display names |
| `src/lib/kpiDefinitions.ts` | Add 75 enriched KPI entries (multiple steps) |
| `src/components/UsefulResources.tsx` | Add new departments to DEPARTMENT_MAP |


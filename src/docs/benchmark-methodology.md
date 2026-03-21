# Dealer Diagnostic — Benchmark Methodology

**Version 1.0 | March 2026 | Dealer Diagnostic Platform**

---

## 1. Purpose

This document describes how benchmark reference values used in the Dealer Diagnostic Platform are derived, classified, and maintained. It is intended for OEM programme managers, field coaches, and procurement stakeholders evaluating the platform for enterprise deployment.

---

## 2. Benchmark Sources and Classification

Each KPI benchmark in the platform is classified into one of four confidence tiers:

| Tier | Label | Description |
|------|-------|-------------|
| 1 | **OEM-Specific** | Derived directly from manufacturer programme data or OEM-provided dealer composite reports |
| 2 | **Verified Industry** | Published industry studies from recognised sources (NADA, JATO, DAT, EurotaxGlass's, Cox Automotive Europe) |
| 3 | **Estimated Range** | Derived from publicly available dealer financial reporting, regional dealer association data, and practitioner experience |
| 4 | **Generic** | Conservative reference values used when no regional data is available; flagged with review recommendation |

All benchmarks displayed in the platform are labelled with their confidence tier. Tier 3 and Tier 4 values display an explicit disclaimer indicating they are reference estimates, not verified industry standards.

---

## 3. Geographic Scope

Current benchmark values are calibrated for **Western European dealer markets**, primarily:

- Germany (DACH region primary calibration)
- United Kingdom
- France
- Benelux

Benchmarks are **not calibrated** for North American, Asian, or emerging market dealer operations. OEM-specific deployments should override generic benchmarks with manufacturer-provided composite data via the benchmark governance configuration in the platform.

---

## 4. Business Model Segmentation

Benchmarks are differentiated by dealership business model:

| Model | Description | Benchmark Pool |
|-------|-------------|----------------|
| **Sales Only (2S)** | New and used vehicle sales, F&I, no workshop | Sales and F&I benchmarks only |
| **Sales + Service (3S)** | Sales plus authorised workshop, limited parts | All modules except wholesale parts |
| **Full Franchise (4S)** | Complete new/used/service/parts operation | All module benchmarks active |

Applying a 4S benchmark to a 2S dealer is a known contamination risk. The platform suppresses inapplicable benchmarks based on the organisation's declared business model.

---

## 5. KPI Categories Benchmarked

The platform currently provides reference benchmarks across five operational domains:

**New Vehicle Sales**
Units per sales executive per month, closing ratio, test drive ratio, F&I penetration, lead response time, lead conversion rate, inventory turnover, CSI score

**Used Vehicle Sales**
Days in inventory, reconditioning cycle time, used vehicle gross per unit, used-to-new ratio, aged inventory percentage

**Service Operations**
Labour utilisation rate, technician productivity, average repair order value, service retention rate, first-time fix rate, warranty recovery rate, appointment lead time

**Parts & Inventory**
Parts fill rate, inventory turnover, obsolescence rate, gross margin %, emergency sourcing capability

**Financial Operations**
Service absorption rate, net profit margin, personnel expense ratio, floorplan efficiency, front-end gross per unit

---

## 6. Update Cadence

| Benchmark Type | Review Frequency |
|----------------|-----------------|
| OEM-Specific | Updated with each OEM programme cycle (typically annual) |
| Verified Industry | Reviewed annually, updated when source publications are refreshed |
| Estimated Range | Reviewed bi-annually; recalibrated as platform assessment volume grows |
| Generic | Replaced as regional data becomes available |

The platform is designed to evolve from static reference benchmarks (current state) toward live peer-pool benchmarks derived from anonymised assessment data, subject to minimum peer group size requirements (minimum 12 dealers per segment) to protect confidentiality.

---

## 7. Peer Group Integrity

Benchmarks are only meaningful when comparing like-with-like. The platform prevents benchmark contamination through a four-dimension segmentation key:

1. **Brand tier** — volume/mainstream/premium/ultra-premium
2. **Business model** — 2S/3S/4S
3. **Network structure** — single-outlet/multi-outlet/dealer group
4. **Volume band** — under 20 / 21–50 / 51–100 / 101–200 / 200+ units/month

A dealer will only be benchmarked against peers sharing the same combination on all four dimensions. Segments with fewer than 12 peers use the next-widest applicable tier.

---

## 8. Transparency and Disclosure

- All benchmarks are displayed with their confidence tier label
- Tier 3 and Tier 4 benchmarks include an explicit estimated/reference disclaimer
- Dealers and OEM stakeholders can request the data source reference for any specific benchmark via the platform support channel
- No benchmark is presented as a guarantee of achievable performance — they are reference points to contextualise assessment scores

---

## 9. Limitations

- Self-assessment responses are subject to response bias; benchmarks should be interpreted alongside coach-validated assessments where available
- Regional economic conditions, brand-specific programme requirements, and market maturity can cause legitimate deviation from generic benchmarks
- The platform does not have access to dealer management system data; KPI estimates are derived from assessment responses, not accounting records

---

*For questions about benchmark methodology or to provide OEM-specific benchmark data for integration, contact the platform administrator.*

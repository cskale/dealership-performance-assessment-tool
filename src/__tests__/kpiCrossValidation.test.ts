import { describe, it, expect } from 'vitest';
import { evaluateKpiCrossValidations, type KpiValueInput } from '@/lib/kpiCrossValidation';

function kpiRow(kpi_key: string, value: number | null, skipped = false): KpiValueInput {
  return { kpi_key, value, skipped };
}

describe('evaluateKpiCrossValidations', () => {
  describe('KPI-NVS-LEAD-RESPONSE', () => {
    it('fires when lead response is slow and CRM is rated strong', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('nvs_lead_response_1h_pct', 30)],
        { 'nvs-10': 4 },
        {}
      );
      expect(findings.map(f => f.ruleId)).toContain('KPI-NVS-LEAD-RESPONSE');
    });

    it('does not fire when lead response is fast', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('nvs_lead_response_1h_pct', 80)],
        { 'nvs-10': 4 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-NVS-LEAD-RESPONSE');
    });

    it('does not fire when CRM is not rated strong', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('nvs_lead_response_1h_pct', 30)],
        { 'nvs-10': 2 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-NVS-LEAD-RESPONSE');
    });

    it('never fires when the KPI value is skipped', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('nvs_lead_response_1h_pct', 30, true)],
        { 'nvs-10': 4 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-NVS-LEAD-RESPONSE');
    });
  });

  describe('KPI-UVS-AGED-STOCK', () => {
    it('fires when days-to-sale is high and aged-stock strategy is rated strong', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('uvs_days_to_sale', 90)],
        { 'uvs-10': 5 },
        {}
      );
      expect(findings.map(f => f.ruleId)).toContain('KPI-UVS-AGED-STOCK');
    });

    it('does not fire when days-to-sale is within range', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('uvs_days_to_sale', 50)],
        { 'uvs-10': 5 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-UVS-AGED-STOCK');
    });

    it('does not fire when aged-stock strategy is not rated strong', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('uvs_days_to_sale', 90)],
        { 'uvs-10': 3 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-UVS-AGED-STOCK');
    });

    it('never fires when the KPI value is skipped', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('uvs_days_to_sale', 90, true)],
        { 'uvs-10': 5 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-UVS-AGED-STOCK');
    });
  });

  describe('KPI-SVC-WORKSHOP-LOADING', () => {
    it('fires when workshop loading is low and availability is rated strong', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('svc_workshop_loading_pct', 45)],
        { 'svc-3': 4 },
        {}
      );
      expect(findings.map(f => f.ruleId)).toContain('KPI-SVC-WORKSHOP-LOADING');
    });

    it('does not fire when workshop loading is high', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('svc_workshop_loading_pct', 75)],
        { 'svc-3': 4 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-SVC-WORKSHOP-LOADING');
    });

    it('does not fire when availability is not rated strong', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('svc_workshop_loading_pct', 45)],
        { 'svc-3': 3 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-SVC-WORKSHOP-LOADING');
    });

    it('never fires when the KPI value is skipped', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('svc_workshop_loading_pct', 45, true)],
        { 'svc-3': 4 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-SVC-WORKSHOP-LOADING');
    });
  });

  describe('KPI-PTS-GROSS-MARGIN', () => {
    it('fires when parts margin is thin and vendor pricing is rated strong', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('prt_gross_margin_pct', 15)],
        { 'pts-10': 4 },
        {}
      );
      expect(findings.map(f => f.ruleId)).toContain('KPI-PTS-GROSS-MARGIN');
    });

    it('does not fire when parts margin is healthy', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('prt_gross_margin_pct', 25)],
        { 'pts-10': 4 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-PTS-GROSS-MARGIN');
    });

    it('does not fire when vendor pricing is not rated strong', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('prt_gross_margin_pct', 15)],
        { 'pts-10': 2 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-PTS-GROSS-MARGIN');
    });

    it('never fires when the KPI value is skipped', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('prt_gross_margin_pct', 15, true)],
        { 'pts-10': 4 },
        {}
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-PTS-GROSS-MARGIN');
    });
  });

  describe('KPI-FIN-NET-PROFIT', () => {
    it('fires when net profit margin is thin and financial-operations score is high', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('fin_net_profit_pct', 0.5)],
        {},
        { 'financial-operations': 80 }
      );
      expect(findings.map(f => f.ruleId)).toContain('KPI-FIN-NET-PROFIT');
    });

    it('does not fire when net profit margin is healthy', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('fin_net_profit_pct', 3)],
        {},
        { 'financial-operations': 80 }
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-FIN-NET-PROFIT');
    });

    it('does not fire when financial-operations score is low', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('fin_net_profit_pct', 0.5)],
        {},
        { 'financial-operations': 50 }
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-FIN-NET-PROFIT');
    });

    it('never fires when the KPI value is skipped', () => {
      const findings = evaluateKpiCrossValidations(
        [kpiRow('fin_net_profit_pct', 0.5, true)],
        {},
        { 'financial-operations': 80 }
      );
      expect(findings.map(f => f.ruleId)).not.toContain('KPI-FIN-NET-PROFIT');
    });
  });

  it('never fires any rule when the KPI row is missing entirely', () => {
    const findings = evaluateKpiCrossValidations(
      [],
      { 'nvs-10': 5, 'uvs-10': 5, 'svc-3': 5, 'pts-10': 5 },
      { 'financial-operations': 100 }
    );
    expect(findings).toHaveLength(0);
  });
});

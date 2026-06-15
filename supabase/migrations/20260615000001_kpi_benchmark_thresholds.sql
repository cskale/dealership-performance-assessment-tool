-- KPI benchmark threshold scaffolding (schema only, no seed data).
-- segmentation_key follows the peer_segmentation_keys composite convention:
-- positioning|business_model|network_structure|volume_band
CREATE TABLE public.kpi_benchmark_thresholds (
  kpi_key text NOT NULL,
  segmentation_key text NOT NULL,
  healthy_min numeric,
  healthy_max numeric,
  warning_min numeric,
  warning_max numeric,
  critical_min numeric,
  critical_max numeric,
  source text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kpi_key, segmentation_key)
);

ALTER TABLE public.kpi_benchmark_thresholds ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users. No write policies — managed via
-- migration/admin only for now.
CREATE POLICY "kpi_benchmark_thresholds_select_authenticated"
  ON public.kpi_benchmark_thresholds
  FOR SELECT
  TO authenticated
  USING (true);

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RadarBenchmarkChartProps {
  departmentScores: Record<string, number>;
  benchmarkValue?: number;
}

const DEPARTMENTS: { key: string; label: string }[] = [
  { key: 'new_vehicle_sales', label: 'New Vehicles' },
  { key: 'used_vehicle_sales', label: 'Used Vehicles' },
  { key: 'service', label: 'Service' },
  { key: 'parts', label: 'Parts' },
  { key: 'financial_operations', label: 'Finance' },
];

export function RadarBenchmarkChart({ departmentScores, benchmarkValue = 72 }: RadarBenchmarkChartProps) {
  const data = DEPARTMENTS.map(d => ({
    subject: d.label,
    score: Math.round(departmentScores?.[d.key] ?? 0),
    benchmark: benchmarkValue,
  }));

  return (
    <div
      className="bg-white rounded-lg p-4"
      style={{ border: '1px solid #e2e0d8' }}
    >
      <div
        className="uppercase mb-2"
        style={{ fontSize: '12px', color: '#96948e', letterSpacing: '0.04em', fontWeight: 600 }}
      >
        Performance Radar
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="#e2e0d8" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: '#5c5a54' }}
            />
            <Radar
              name="Benchmark"
              dataKey="benchmark"
              stroke="#1D9E75"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill="transparent"
              isAnimationActive
              animationBegin={200}
              animationDuration={800}
            />
            <Radar
              name="Your Score"
              dataKey="score"
              stroke="#0052CC"
              strokeWidth={2}
              fill="#0052CC"
              fillOpacity={0.12}
              isAnimationActive
              animationBegin={200}
              animationDuration={800}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="flex items-center justify-center gap-5 mt-2"
        style={{ fontSize: '11px', color: '#5c5a54' }}
      >
        <div className="flex items-center gap-1.5">
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '9999px',
              backgroundColor: '#0052CC',
            }}
          />
          Your score
        </div>
        <div className="flex items-center gap-1.5">
          <span
            style={{
              display: 'inline-block',
              width: 18,
              height: 0,
              borderTop: '1.5px dashed #1D9E75',
            }}
          />
          Peer benchmark
        </div>
      </div>
    </div>
  );
}

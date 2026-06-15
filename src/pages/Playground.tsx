import { ReverseSalesFunnelCalculator } from '@/components/playground/ReverseSalesFunnelCalculator';

export default function Playground() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-foreground">Playground</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Interactive calculators that turn your dealership KPIs into decision-ready scenarios.
        </p>
      </header>

      <div className="space-y-6">
        <ReverseSalesFunnelCalculator />
      </div>
    </div>
  );
}

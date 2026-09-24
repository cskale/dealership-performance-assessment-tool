import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Gauge,
  Target,
  Megaphone,
  Wrench,
  Package,
  Users,
  PiggyBank,
  LineChart,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CalculatorMeta {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  live: boolean;
}

interface CalculatorCategory {
  title: string;
  description: string;
  items: CalculatorMeta[];
}

const CATEGORIES: CalculatorCategory[] = [
  {
    title: 'Sales Optimization',
    description: 'Model pipeline volume, velocity, and revenue scenarios.',
    items: [
      {
        id: 'reverse-sales-funnel',
        name: 'Reverse Sales Funnel Calculator',
        description:
          'Work backward from a unit-sales target to required leads, appointments, and showroom visits.',
        icon: TrendingUp,
        href: '/app/playground/reverse-sales-funnel',
        live: true,
      },
      {
        id: 'sales-velocity',
        name: 'Sales Velocity Instrument',
        description: 'Quantify deal-flow speed across the pipeline and identify bottleneck stages.',
        icon: Gauge,
        href: '/app/playground/sales-velocity',
        live: true,
      },
      {
        id: 'lead-quality',
        name: 'Lead Quality Auditor',
        description: 'Score lead sources by close rate, time-to-close, and gross profit contribution.',
        icon: Target,
        href: '/app/playground/lead-quality',
        live: true,
      },
      {
        id: 'price-elasticity',
        name: 'Price Elasticity Simulator',
        description: 'Model how unit price adjustments shift volume and total gross profit.',
        icon: LineChart,
        live: false,
      },
    ],
  },
  {
    title: 'Marketing Intelligence',
    description: 'Allocate marketing spend and measure conversion economics.',
    items: [
      {
        id: 'marketing-roi',
        name: 'Marketing ROI Engine',
        description: 'Compute channel-level ROAS and break-even spend at your current funnel rates.',
        icon: Megaphone,
        href: '/app/playground/marketing-roi',
        live: true,
      },
      {
        id: 'cac-payback',
        name: 'CAC Payback Calculator',
        description: 'Determine months to recover customer acquisition cost from average GP per unit.',
        icon: PiggyBank,
        href: '/app/playground/cac-payback',
        live: true,
      },
      {
        id: 'retention-ltv',
        name: 'Retention & LTV Model',
        description: 'Project lifetime value across sales, service, and parts attachment.',
        icon: Users,
        live: false,
      },
    ],
  },
  {
    title: 'Operational Models',
    description: 'Stress-test capacity, inventory, and workshop economics.',
    items: [
      {
        id: 'tech-utilization',
        name: 'Technician Utilization Calculator',
        description: 'Calculate technician utilization to measure workshop capacity and identify revenue from idle hours.',
        icon: Wrench,
        href: '/app/playground/tech-utilization',
        live: true,
      },
      {
        id: 'vehicle-stock-turn',
        name: 'Vehicle Stock Turn Calculator',
        description: 'Analyse inventory velocity, days in stock, and holding cost to optimize vehicle stock levels.',
        icon: Package,
        href: '/app/playground/vehicle-stock-turn',
        live: true,
      },
      {
        id: 'absorption-rate',
        name: 'Absorption Rate Modeler',
        description: 'Model how service and parts gross profit cover fixed dealership overhead.',
        icon: ShieldCheck,
        href: '/app/playground/absorption-rate',
        live: true,
      },
      {
        id: 'appointment-density',
        name: 'Appointment Density Optimizer',
        description: 'Optimize workshop scheduling for maximum throughput and minimum wait time.',
        icon: Clock,
        href: '/app/playground/appointment-density',
        live: true,
      },
      {
        id: 'fi-penetration',
        name: 'F&I Penetration Calculator',
        description: 'Model finance, insurance, and warranty attach rates against gross profit uplift.',
        icon: Sparkles,
        href: '/app/playground/fi-penetration',
        live: true,
      },
    ],
  },
];

const TOTAL_PLANNED = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
const TOTAL_LIVE = CATEGORIES.reduce(
  (sum, c) => sum + c.items.filter((i) => i.live).length,
  0,
);

export default function Playground() {
  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <header className="relative mb-8 overflow-hidden rounded-lg border border-border bg-card px-5 py-6 shadow-card animate-in fade-in slide-in-from-bottom-2 duration-300 sm:px-7">
        <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />
        <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">
          Playground
        </p>
        <h1 className="text-2xl font-bold text-foreground mb-1">Precision Playground</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          High-fidelity analytical instruments for strategic scenario modeling.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-medium text-foreground numeric">{TOTAL_LIVE}</span> live
          <span className="text-border">·</span>
          <span className="font-medium text-foreground numeric">{TOTAL_PLANNED - TOTAL_LIVE}</span> planned
        </div>
      </header>

      <div className="space-y-8">
        {CATEGORIES.map((category) => (
          <section key={category.title} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
                {category.title}
              </p>
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <CalculatorCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function CalculatorCard({ item }: { item: CalculatorMeta }) {
  const Icon = item.icon;

  const inner = (
    <div
      className={[
        'h-full bg-card rounded-lg border border-border shadow-card p-5 flex flex-col transition-all duration-200',
        item.live
          ? 'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated cursor-pointer'
          : 'opacity-60 cursor-not-allowed',
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={[
            'rounded-md p-2',
            item.live ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          ].join(' ')}
        >
          <Icon className="h-4 w-4" />
        </div>
        {!item.live && (
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            Coming Soon
          </Badge>
        )}
      </div>
      <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5">{item.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.description}</p>
      {item.live && (
        <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          Open Calculator <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );

  if (item.live && item.href) {
    return (
      <Link to={item.href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return <div className="h-full">{inner}</div>;
}

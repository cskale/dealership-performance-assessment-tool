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
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
        live: false,
      },
      {
        id: 'lead-quality',
        name: 'Lead Quality Auditor',
        description: 'Score lead sources by close rate, time-to-close, and gross profit contribution.',
        icon: Target,
        live: false,
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
        live: false,
      },
      {
        id: 'cac-payback',
        name: 'CAC Payback Calculator',
        description: 'Determine months to recover customer acquisition cost from average GP per unit.',
        icon: PiggyBank,
        live: false,
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
        id: 'service-capacity',
        name: 'Service Capacity Planner',
        description: 'Match technician hours and bays to projected RO demand and absorption targets.',
        icon: Wrench,
        live: false,
      },
      {
        id: 'inventory-turnover',
        name: 'Inventory Turnover Simulator',
        description: 'Project days supply, ageing risk, and holding cost across stock-mix scenarios.',
        icon: Package,
        live: false,
      },
      {
        id: 'absorption-rate',
        name: 'Absorption Rate Modeler',
        description: 'Model how service and parts gross profit cover fixed dealership overhead.',
        icon: ShieldCheck,
        live: false,
      },
      {
        id: 'appointment-density',
        name: 'Appointment Density Optimizer',
        description: 'Optimize workshop scheduling for maximum throughput and minimum wait time.',
        icon: Clock,
        live: false,
      },
      {
        id: 'fi-penetration',
        name: 'F&I Penetration Calculator',
        description: 'Model finance, insurance, and warranty attach rates against gross profit uplift.',
        icon: Sparkles,
        live: false,
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
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <header className="mb-10">
        <h1 className="font-serif text-3xl text-foreground">Precision Playground</h1>
        <p className="text-muted-foreground mt-2 text-base max-w-2xl">
          High-fidelity analytical instruments for strategic scenario modeling.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-muted-foreground border rounded-full px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {TOTAL_LIVE} live · {TOTAL_PLANNED - TOTAL_LIVE} planned
        </div>
      </header>

      <div className="space-y-10">
        {CATEGORIES.map((category) => (
          <section key={category.title}>
            <div className="mb-4">
              <h2 className="font-serif text-xl text-foreground">{category.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
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
    <Card
      className={
        item.live
          ? 'h-full transition-all hover:border-brand-500/50 hover:shadow-md cursor-pointer'
          : 'h-full opacity-60 cursor-not-allowed'
      }
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`rounded-md p-2 ${
              item.live
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          {!item.live && (
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
              Coming Soon
            </Badge>
          )}
        </div>
        <h3 className="font-serif text-base text-foreground leading-snug mb-1.5">
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
          {item.description}
        </p>
        {item.live && (
          <div className="mt-4 text-xs font-medium text-brand-600 dark:text-brand-300">
            Open Calculator →
          </div>
        )}
      </CardContent>
    </Card>
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

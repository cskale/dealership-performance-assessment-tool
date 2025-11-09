import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LayoutDashboard, 
  Car, 
  RotateCw, 
  Wrench, 
  Package, 
  TrendingUp, 
  Download,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Settings,
  User,
  Target,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  benchmark: string;
  change: number;
  status: 'excellent' | 'on-track' | 'needs-focus';
  unit?: string;
}

const KPICard = ({ title, value, benchmark, change, status, unit = '' }: KPICardProps) => {
  const statusColors = {
    'excellent': 'bg-success/10 text-success-foreground border-success/30',
    'on-track': 'bg-warning/10 text-warning-foreground border-warning/30',
    'needs-focus': 'bg-destructive/10 text-destructive-foreground border-destructive/30'
  };

  const statusLabels = {
    'excellent': 'Excellent',
    'on-track': 'On Track',
    'needs-focus': 'Needs Focus'
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          <Badge variant="outline" className={cn("text-xs", statusColors[status])}>
            {statusLabels[status]}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground">{unit}</div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Benchmark: {benchmark}</span>
            <div className={cn(
              "flex items-center gap-1 font-medium",
              change >= 0 ? "text-success-foreground" : "text-destructive-foreground"
            )}>
              {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(change)}%
            </div>
          </div>
          
          <Progress 
            value={Math.min(100, Math.max(0, 50 + change))} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  score: number;
}

const SectionHeader = ({ icon, title, score }: SectionHeaderProps) => {
  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-success text-success-foreground' };
    if (score >= 60) return { label: 'Good', color: 'bg-warning text-warning-foreground' };
    return { label: 'Needs Focus', color: 'bg-destructive text-destructive-foreground' };
  };

  const status = getScoreStatus(score);

  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Performance Score: {score}/100</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{score}</div>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </div>
        <Progress value={score} className="mt-4 h-2" />
      </CardHeader>
    </Card>
  );
};

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedDealer, setSelectedDealer] = useState("main");

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Car, label: "New Sales" },
    { icon: RotateCw, label: "Used Sales" },
    { icon: Wrench, label: "Service" },
    { icon: Package, label: "Parts" },
    { icon: TrendingUp, label: "Financials" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 bg-card border-r border-border flex flex-col items-center py-6 gap-4 z-50">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        
        {navItems.map((item, idx) => (
          <button
            key={idx}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
              item.active 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
          </button>
        ))}

        <div className="mt-auto">
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <User className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-20">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <Select value={selectedDealer} onValueChange={setSelectedDealer}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Dealership</SelectItem>
                  <SelectItem value="north">North Branch</SelectItem>
                  <SelectItem value="south">South Branch</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8 space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Performance Dashboard</h1>
            <p className="text-muted-foreground">Real-time analytics and insights for your dealership operations</p>
          </div>

          {/* New Vehicle Sales KPIs */}
          <div className="space-y-4">
            <SectionHeader 
              icon={<Car className="h-6 w-6 text-primary" />}
              title="New Vehicle Sales KPIs"
              score={72}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard 
                title="Monthly Revenue"
                value="€385,000"
                benchmark="€420,000"
                change={-8.3}
                status="needs-focus"
              />
              <KPICard 
                title="Average Margin"
                value="9.1%"
                benchmark="9.2%"
                change={-1.1}
                status="on-track"
              />
              <KPICard 
                title="Customer Satisfaction"
                value="87%"
                benchmark="84%"
                change={3.6}
                status="excellent"
              />
              <KPICard 
                title="Lead Conversion"
                value="24%"
                benchmark="23%"
                change={4.3}
                status="excellent"
              />
            </div>
          </div>

          {/* Used Vehicle Sales KPIs */}
          <div className="space-y-4">
            <SectionHeader 
              icon={<RotateCw className="h-6 w-6 text-primary" />}
              title="Used Vehicle Sales KPIs"
              score={68}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard 
                title="Monthly Revenue"
                value="€245,000"
                benchmark="€290,000"
                change={-15.5}
                status="needs-focus"
              />
              <KPICard 
                title="Average Margin"
                value="14.2%"
                benchmark="15.8%"
                change={-10.1}
                status="needs-focus"
              />
              <KPICard 
                title="Turnover Rate"
                value="7.8x"
                benchmark="8.5x"
                change={-8.2}
                status="on-track"
                unit="/year"
              />
              <KPICard 
                title="Customer Satisfaction"
                value="83%"
                benchmark="81%"
                change={2.5}
                status="excellent"
              />
            </div>
          </div>

          {/* Service Performance KPIs */}
          <div className="space-y-4">
            <SectionHeader 
              icon={<Wrench className="h-6 w-6 text-primary" />}
              title="Service Performance KPIs"
              score={81}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard 
                title="Monthly Revenue"
                value="€178,000"
                benchmark="€185,000"
                change={-3.8}
                status="on-track"
              />
              <KPICard 
                title="Labor Efficiency"
                value="85%"
                benchmark="78%"
                change={9.0}
                status="excellent"
              />
              <KPICard 
                title="Customer Retention"
                value="76%"
                benchmark="72%"
                change={5.6}
                status="excellent"
              />
              <KPICard 
                title="Average RO"
                value="€268"
                benchmark="€245"
                change={9.4}
                status="excellent"
              />
            </div>
          </div>

          {/* AI Insights Panel */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">AI-Powered Insights & Recommendations</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/50">
                <Target className="h-5 w-5 text-success-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Optimize Test Drive Conversion</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your lead conversion rate is strong, but test drive follow-up speed could improve by 30%. 
                    Implement automated SMS reminders within 2 hours of test drives.
                  </p>
                  <Badge variant="outline" className="bg-success/10 text-success-foreground border-success/30">
                    Expected Impact: +€45k monthly
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/50">
                <Target className="h-5 w-5 text-warning-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Used Vehicle Inventory Optimization</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stock turnover is below benchmark. Consider reducing aged inventory (90+ days) by 15% 
                    and focusing on high-demand models with faster turnover rates.
                  </p>
                  <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30">
                    Expected Impact: +€28k monthly
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/50">
                <Target className="h-5 w-5 text-info-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Service Department Excellence</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your service department is performing excellently. Consider expanding capacity by 20% 
                    to capture additional demand and reduce wait times from 3 to 2 days.
                  </p>
                  <Badge variant="outline" className="bg-info/10 text-info-foreground border-info/30">
                    Expected Impact: +€18k monthly
                  </Badge>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                View All Recommendations
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Overall Performance Summary */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Overall Dealership Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                  <div className="text-5xl font-bold text-primary mb-2">74</div>
                  <div className="text-sm text-muted-foreground font-medium">Overall Score</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-xl">
                  <div className="text-5xl font-bold text-success-foreground mb-2">2</div>
                  <div className="text-sm text-muted-foreground font-medium">Strong Areas</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl">
                  <div className="text-5xl font-bold text-warning-foreground mb-2">1</div>
                  <div className="text-sm text-muted-foreground font-medium">Needs Attention</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl">
                  <div className="text-5xl font-bold text-accent-foreground mb-2">€91k</div>
                  <div className="text-sm text-muted-foreground font-medium">Monthly Opportunity</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

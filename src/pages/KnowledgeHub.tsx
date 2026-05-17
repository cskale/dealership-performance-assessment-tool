import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecommendedTab } from '@/components/knowledge/RecommendedTab';
import { KpiEncyclopediaTab } from '@/components/knowledge/KpiEncyclopediaTab';
import { LearningPathsTab } from '@/components/knowledge/LearningPathsTab';
import { DownloadsTab } from '@/components/knowledge/DownloadsTab';

const VALID_TABS = ['recommended', 'kpi', 'learning', 'downloads'] as const;
type TabValue = (typeof VALID_TABS)[number];

function isValidTab(v: string | null): v is TabValue {
  return VALID_TABS.includes(v as TabValue);
}

export default function KnowledgeHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isValidTab(tabParam) ? tabParam : 'recommended';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Knowledge & Resources
        </p>
        <h1 className="text-2xl font-semibold">Knowledge Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Curated resources, KPI references, and learning paths matched to your dealership.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="kpi">KPI Encyclopedia</TabsTrigger>
          <TabsTrigger value="learning">Learning Paths</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          <RecommendedTab />
        </TabsContent>
        <TabsContent value="kpi">
          <KpiEncyclopediaTab />
        </TabsContent>
        <TabsContent value="learning">
          <LearningPathsTab />
        </TabsContent>
        <TabsContent value="downloads">
          <DownloadsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

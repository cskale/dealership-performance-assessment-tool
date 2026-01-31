import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, BookOpen, Star, Bookmark, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppHeader } from '@/components/AppHeader';
import { ResourceCard } from '@/components/ResourceCard';
import { toast } from 'sonner';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: 'video' | 'article' | 'course' | 'webinar' | 'tool';
  url: string;
  thumbnail_url: string | null;
  duration: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  topics: string[];
  related_kpis: string[];
  is_featured: boolean;
}

interface SavedResource {
  resource_id: string;
}

const ResourceHub = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [weakTopics, setWeakTopics] = useState<string[]>([]);

  // Translation keys
  const translations: Record<string, Record<string, string>> = {
    en: {
      title: 'Resource Hub',
      subtitle: 'Curated learning resources to improve your dealership performance',
      recommended: 'Recommended',
      allResources: 'All Resources',
      saved: 'Saved',
      searchPlaceholder: 'Search resources...',
      allTopics: 'All Topics',
      allTypes: 'All Types',
      video: 'Video',
      article: 'Article',
      course: 'Course',
      webinar: 'Webinar',
      tool: 'Tool',
      noResources: 'No resources found',
      noSavedResources: 'No saved resources yet',
      noRecommendations: 'Complete an assessment to get personalized recommendations',
      recommendedFor: 'Based on your assessment results',
      featured: 'Featured',
    },
    de: {
      title: 'Ressourcen-Hub',
      subtitle: 'Kuratierte Lernressourcen zur Verbesserung Ihrer Händlerleistung',
      recommended: 'Empfohlen',
      allResources: 'Alle Ressourcen',
      saved: 'Gespeichert',
      searchPlaceholder: 'Ressourcen suchen...',
      allTopics: 'Alle Themen',
      allTypes: 'Alle Typen',
      video: 'Video',
      article: 'Artikel',
      course: 'Kurs',
      webinar: 'Webinar',
      tool: 'Werkzeug',
      noResources: 'Keine Ressourcen gefunden',
      noSavedResources: 'Noch keine gespeicherten Ressourcen',
      noRecommendations: 'Schließen Sie eine Bewertung ab, um personalisierte Empfehlungen zu erhalten',
      recommendedFor: 'Basierend auf Ihren Bewertungsergebnissen',
      featured: 'Empfohlen',
    },
  };

  const tr = (key: string) => translations[language]?.[key] || translations.en[key] || key;

  useEffect(() => {
    loadResources();
    if (user) {
      loadSavedResources();
      loadWeakTopicsFromAssessment();
    }
  }, [user]);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources((data as Resource[]) || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedResources = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_saved_resources')
        .select('resource_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setSavedResourceIds(new Set((data as SavedResource[])?.map(r => r.resource_id) || []));
    } catch (error) {
      console.error('Error loading saved resources:', error);
    }
  };

  const loadWeakTopicsFromAssessment = async () => {
    if (!user) return;
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('answers')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !assessment) return;

      const answers = assessment.answers as Record<string, number>;
      const topics: string[] = [];

      // Map weak scores to topics
      Object.entries(answers).forEach(([questionId, score]) => {
        if (score <= 3) {
          // Map question IDs to topics based on section
          if (questionId.startsWith('nvs')) topics.push('sales');
          if (questionId.startsWith('uvs')) topics.push('used-vehicles');
          if (questionId.startsWith('aftersales') || questionId.startsWith('service')) topics.push('service');
          if (questionId.startsWith('parts')) topics.push('parts', 'inventory');
          if (questionId.includes('customer')) topics.push('customer-experience');
        }
      });

      setWeakTopics([...new Set(topics)]);
    } catch (error) {
      console.error('Error loading assessment:', error);
    }
  };

  const toggleSaveResource = async (resourceId: string) => {
    if (!user) {
      toast.error(language === 'de' ? 'Bitte anmelden' : 'Please log in');
      return;
    }

    const isSaved = savedResourceIds.has(resourceId);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('user_saved_resources')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId);

        if (error) throw error;
        setSavedResourceIds(prev => {
          const next = new Set(prev);
          next.delete(resourceId);
          return next;
        });
        toast.success(language === 'de' ? 'Ressource entfernt' : 'Resource removed');
      } else {
        const { error } = await supabase
          .from('user_saved_resources')
          .insert([{ user_id: user.id, resource_id: resourceId }]);

        if (error) throw error;
        setSavedResourceIds(prev => new Set([...prev, resourceId]));
        toast.success(language === 'de' ? 'Ressource gespeichert' : 'Resource saved');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update saved resources');
    }
  };

  // Get unique topics from resources
  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    resources.forEach(r => r.topics.forEach(t => topics.add(t)));
    return Array.from(topics).sort();
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = !searchQuery || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = topicFilter === 'all' || resource.topics.includes(topicFilter);
      const matchesType = typeFilter === 'all' || resource.resource_type === typeFilter;
      return matchesSearch && matchesTopic && matchesType;
    });
  }, [resources, searchQuery, topicFilter, typeFilter]);

  // Recommended resources (based on weak assessment areas)
  const recommendedResources = useMemo(() => {
    if (weakTopics.length === 0) return [];
    
    return resources
      .filter(resource => 
        resource.topics.some(topic => weakTopics.includes(topic))
      )
      .sort((a, b) => {
        // Sort by number of matching topics
        const aMatches = a.topics.filter(t => weakTopics.includes(t)).length;
        const bMatches = b.topics.filter(t => weakTopics.includes(t)).length;
        return bMatches - aMatches;
      })
      .slice(0, 8);
  }, [resources, weakTopics]);

  // Saved resources
  const savedResources = useMemo(() => {
    return resources.filter(r => savedResourceIds.has(r.id));
  }, [resources, savedResourceIds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AppHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">{tr('title')}</h1>
          </div>
          <p className="text-lg text-muted-foreground">{tr('subtitle')}</p>
        </div>

        <Tabs defaultValue="recommended" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {tr('recommended')}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {tr('allResources')}
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              {tr('saved')}
              {savedResourceIds.size > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {savedResourceIds.size}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Recommended Tab */}
          <TabsContent value="recommended">
            {recommendedResources.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-amber-500" />
                  {tr('recommendedFor')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedResources.map(resource => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      isSaved={savedResourceIds.has(resource.id)}
                      onToggleSave={toggleSaveResource}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{tr('noRecommendations')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Resources Tab */}
          <TabsContent value="all">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={tr('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={topicFilter} onValueChange={setTopicFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder={tr('allTopics')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{tr('allTopics')}</SelectItem>
                      {allTopics.map(topic => (
                        <SelectItem key={topic} value={topic}>
                          {topic.charAt(0).toUpperCase() + topic.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder={tr('allTypes')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{tr('allTypes')}</SelectItem>
                      <SelectItem value="video">{tr('video')}</SelectItem>
                      <SelectItem value="article">{tr('article')}</SelectItem>
                      <SelectItem value="course">{tr('course')}</SelectItem>
                      <SelectItem value="webinar">{tr('webinar')}</SelectItem>
                      <SelectItem value="tool">{tr('tool')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isSaved={savedResourceIds.has(resource.id)}
                    onToggleSave={toggleSaveResource}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{tr('noResources')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            {savedResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isSaved={true}
                    onToggleSave={toggleSaveResource}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{tr('noSavedResources')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResourceHub;

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, BookOpen, GraduationCap, Radio, Wrench, Bookmark, BookmarkCheck, ExternalLink, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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

interface ResourceCardProps {
  resource: Resource;
  isSaved: boolean;
  onToggleSave: (resourceId: string) => void;
}

const typeConfig = {
  video: { icon: Video, label: 'Video' },
  article: { icon: BookOpen, label: 'Article' },
  course: { icon: GraduationCap, label: 'Course' },
  webinar: { icon: Radio, label: 'Webinar' },
  tool: { icon: Wrench, label: 'Tool' },
};

const difficultyConfig = {
  beginner: { color: 'bg-[hsl(var(--dd-green-light))] text-[hsl(var(--dd-green))]', label: 'Beginner' },
  intermediate: { color: 'bg-[hsl(var(--dd-amber-light))] text-[hsl(var(--dd-amber))]', label: 'Intermediate' },
  advanced: { color: 'bg-[hsl(var(--dd-red-light))] text-[hsl(var(--dd-red))]', label: 'Advanced' },
};

export function ResourceCard({ resource, isSaved, onToggleSave }: ResourceCardProps) {
  const { language } = useLanguage();
  const TypeIcon = typeConfig[resource.resource_type]?.icon || Video;
  const diffStyle = resource.difficulty ? difficultyConfig[resource.difficulty] : null;

  const difficultyLabels: Record<string, Record<string, string>> = {
    en: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
    de: { beginner: 'Anfänger', intermediate: 'Fortgeschritten', advanced: 'Experte' },
  };

  const typeLabels: Record<string, Record<string, string>> = {
    en: { video: 'Video', article: 'Article', course: 'Course', webinar: 'Webinar', tool: 'Tool' },
    de: { video: 'Video', article: 'Artikel', course: 'Kurs', webinar: 'Webinar', tool: 'Werkzeug' },
  };

  return (
    <Card className="group bg-card border-border/50 rounded-xl hover:border-primary/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-4 space-y-3">
        {/* Top row: icon + type badge + recommended */}
        <div className="flex items-start justify-between gap-2">
          <div className="p-2 rounded-lg bg-[hsl(var(--dd-accent-light))]">
            <TypeIcon className="h-4 w-4 text-[hsl(var(--dd-accent))]" />
          </div>
          {resource.is_featured && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {language === 'de' ? 'Empfohlen' : 'Featured'}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h4>

        {/* Description */}
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
        )}

        {/* Topics */}
        {resource.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {/* Bottom row: duration + difficulty + type */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            {resource.duration && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {resource.duration}
              </span>
            )}
            {diffStyle && resource.difficulty && (
              <Badge className={cn("border-0 text-xs", diffStyle.color)}>
                {difficultyLabels[language]?.[resource.difficulty] || diffStyle.label}
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {typeLabels[language]?.[resource.resource_type] || typeConfig[resource.resource_type]?.label}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleSave(resource.id)}
            className="flex-shrink-0 h-8 w-8 p-0"
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8"
            onClick={() => window.open(resource.url, '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            {resource.resource_type === 'video' || resource.resource_type === 'webinar'
              ? (language === 'de' ? 'Ansehen' : 'Watch')
              : (language === 'de' ? 'Öffnen' : 'Open')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

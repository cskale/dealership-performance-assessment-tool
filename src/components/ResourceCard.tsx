import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Video, BookOpen, GraduationCap, Radio, Wrench, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  video: { icon: Video, color: 'bg-blue-100 text-blue-700', label: 'Video' },
  article: { icon: BookOpen, color: 'bg-green-100 text-green-700', label: 'Article' },
  course: { icon: GraduationCap, color: 'bg-purple-100 text-purple-700', label: 'Course' },
  webinar: { icon: Radio, color: 'bg-orange-100 text-orange-700', label: 'Webinar' },
  tool: { icon: Wrench, color: 'bg-slate-100 text-slate-700', label: 'Tool' },
};

const difficultyConfig = {
  beginner: { color: 'bg-emerald-100 text-emerald-700', label: 'Beginner' },
  intermediate: { color: 'bg-amber-100 text-amber-700', label: 'Intermediate' },
  advanced: { color: 'bg-red-100 text-red-700', label: 'Advanced' },
};

export function ResourceCard({ resource, isSaved, onToggleSave }: ResourceCardProps) {
  const { t, language } = useLanguage();
  const TypeIcon = typeConfig[resource.resource_type]?.icon || Video;
  const typeStyle = typeConfig[resource.resource_type] || typeConfig.video;
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
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Thumbnail */}
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <img
            src={resource.thumbnail_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'}
            alt={resource.title}
            className="object-cover w-full h-full"
          />
        </AspectRatio>
        {/* Type badge overlay */}
        <div className="absolute top-3 left-3">
          <Badge className={`${typeStyle.color} border-0 flex items-center gap-1`}>
            <TypeIcon className="h-3 w-3" />
            {typeLabels[language]?.[resource.resource_type] || typeStyle.label}
          </Badge>
        </div>
        {resource.duration && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-black/70 text-white border-0">
              {resource.duration}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
        )}
        
        {/* Topics */}
        <div className="flex flex-wrap gap-1.5">
          {resource.topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>

        {/* Difficulty */}
        {diffStyle && resource.difficulty && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {language === 'de' ? 'Niveau:' : 'Level:'}
            </span>
            <Badge className={`${diffStyle.color} border-0 text-xs`}>
              {difficultyLabels[language]?.[resource.difficulty] || diffStyle.label}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleSave(resource.id)}
          className="flex-shrink-0"
        >
          {isSaved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => window.open(resource.url, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {resource.resource_type === 'video' || resource.resource_type === 'webinar'
            ? (language === 'de' ? 'Ansehen' : 'Watch')
            : (language === 'de' ? 'Öffnen' : 'Open')}
        </Button>
      </CardFooter>
    </Card>
  );
}

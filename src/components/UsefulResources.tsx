import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, GraduationCap, Globe } from "lucide-react";

interface UsefulResourcesProps {
  scores: Record<string, number>;
}

interface Resource {
  title: string;
  type: 'Article' | 'Video' | 'Course' | 'Webinar';
  description: string;
  department: string;
}

export function UsefulResources({ scores }: UsefulResourcesProps) {
  const generateResources = (): Resource[] => {
    const resources: Resource[] = [];

    Object.entries(scores).forEach(([department, score]) => {
      if (score < 75) {
        switch (department) {
          case 'new-vehicle-sales':
            resources.push(
              { title: 'Modern Sales Techniques in Automotive Industry', type: 'Course', description: 'Comprehensive training on contemporary sales methodologies', department: 'New Vehicle Sales' },
              { title: 'Customer Psychology and Buying Behavior', type: 'Article', description: 'Understanding customer decision-making processes', department: 'New Vehicle Sales' },
              { title: 'Closing Techniques That Work', type: 'Video', description: 'Practical demonstrations of effective closing strategies', department: 'New Vehicle Sales' },
              { title: 'Building Long-term Customer Relationships', type: 'Webinar', description: 'Strategies for customer retention and loyalty', department: 'New Vehicle Sales' }
            );
            break;

          case 'used-vehicle-sales':
            resources.push(
              { title: 'Used Vehicle Inventory Best Practices', type: 'Course', description: 'Optimize your used vehicle operations', department: 'Used Vehicle Sales' },
              { title: 'Market-Based Pricing Strategies', type: 'Article', description: 'Data-driven approach to vehicle pricing', department: 'Used Vehicle Sales' },
              { title: 'Technology Solutions for Dealers', type: 'Video', description: 'Overview of modern dealership technology', department: 'Used Vehicle Sales' },
              { title: 'Inventory Optimization Workshop', type: 'Webinar', description: 'Live session on inventory management', department: 'Used Vehicle Sales' }
            );
            break;

          case 'service-performance':
            resources.push(
              { title: 'Digital Service Management', type: 'Course', description: 'Modernizing service department operations', department: 'Service Performance' },
              { title: 'Customer Experience in Service', type: 'Article', description: 'Enhancing service customer satisfaction', department: 'Service Performance' },
              { title: 'Technician Productivity Tools', type: 'Video', description: 'Tools to improve workshop efficiency', department: 'Service Performance' },
              { title: 'Service Department Innovation', type: 'Webinar', description: 'Latest trends in automotive service', department: 'Service Performance' }
            );
            break;

          case 'parts-inventory':
            resources.push(
              { title: 'Parts Inventory Management Best Practices', type: 'Course', description: 'Optimize parts operations and profitability', department: 'Parts & Inventory' },
              { title: 'Predictive Analytics in Automotive', type: 'Article', description: 'Using data to forecast parts demand', department: 'Parts & Inventory' },
              { title: 'Inventory Optimization Techniques', type: 'Video', description: 'Practical inventory management strategies', department: 'Parts & Inventory' },
              { title: 'Parts Department Efficiency', type: 'Webinar', description: 'Maximizing parts department performance', department: 'Parts & Inventory' }
            );
            break;

          case 'financial-operations':
            resources.push(
              { title: 'Financial Process Automation', type: 'Course', description: 'Streamline financial workflows', department: 'Financial Operations' },
              { title: 'Dealership Financial Management', type: 'Article', description: 'Best practices in dealer finance', department: 'Financial Operations' },
              { title: 'Automation Tools Overview', type: 'Video', description: 'Technology for financial efficiency', department: 'Financial Operations' },
              { title: 'Financial Efficiency Strategies', type: 'Webinar', description: 'Improving financial performance', department: 'Financial Operations' }
            );
            break;
        }
      }
    });

    return resources;
  };

  const resources = generateResources();
  const getIcon = (type: string) => {
    switch (type) {
      case 'Article': return <BookOpen className="h-5 w-5" />;
      case 'Video': return <Video className="h-5 w-5" />;
      case 'Course': return <GraduationCap className="h-5 w-5" />;
      case 'Webinar': return <Globe className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Article': return 'bg-blue-500';
      case 'Video': return 'bg-purple-500';
      case 'Course': return 'bg-green-500';
      case 'Webinar': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            Useful Resources & Learning Materials
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Curated learning resources to support your improvement initiatives based on your assessment results.
          </p>
        </CardContent>
      </Card>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Great job! Your scores are excellent. No specific resources needed at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, index) => (
            <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg text-white ${getTypeColor(resource.type)}`}>
                    {getIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{resource.department}</Badge>
                      <Badge className={`text-white text-xs ${getTypeColor(resource.type)}`}>
                        {resource.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Video, FileText, Globe, Target, TrendingUp, Wrench, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsefulResourcesProps {
  scores: Record<string, number>;
}

interface DepartmentResource {
  department: string;
  score: number;
  implementationGuide: {
    phase: string;
    duration: string;
    activities: string[];
    deliverables: string[];
  }[];
  keyMetrics: string[];
  learningResources: {
    title: string;
    type: 'Article' | 'Video' | 'Course' | 'Webinar';
  }[];
}

export function UsefulResources({ scores }: UsefulResourcesProps) {
  const generateDepartmentResources = (): DepartmentResource[] => {
    const resources: DepartmentResource[] = [];

    Object.entries(scores).forEach(([department, score]) => {
      if (score < 75) {
        switch (department) {
          case 'new-vehicle-sales':
            resources.push({
              department: 'New Vehicle Sales',
              score,
              implementationGuide: [
                {
                  phase: 'Assessment & Planning',
                  duration: '2 weeks',
                  activities: ['Evaluate current sales performance', 'Identify skill gaps', 'Design training curriculum'],
                  deliverables: ['Skills assessment report', 'Training plan', 'Resource list']
                },
                {
                  phase: 'Training Implementation',
                  duration: '4 weeks',
                  activities: ['Conduct training sessions', 'Practice scenarios', 'Implement coaching'],
                  deliverables: ['Trained sales team', 'Performance benchmarks', 'Coaching framework']
                },
                {
                  phase: 'Monitoring & Optimization',
                  duration: '2 weeks',
                  activities: ['Track performance metrics', 'Gather feedback', 'Make adjustments'],
                  deliverables: ['Performance reports', 'Optimization plan', 'Ongoing support structure']
                }
              ],
              keyMetrics: ['Closing ratio improvement', 'Customer satisfaction scores', 'Average deal size', 'Lead conversion rate'],
              learningResources: [
                { title: 'Modern Sales Techniques in Automotive Industry', type: 'Course' },
                { title: 'Customer Psychology and Buying Behavior', type: 'Article' },
                { title: 'Closing Techniques That Work', type: 'Video' },
                { title: 'Building Long-term Customer Relationships', type: 'Webinar' }
              ]
            });
            break;

          case 'used-vehicle-sales':
            resources.push({
              department: 'Used Vehicle Sales',
              score,
              implementationGuide: [
                {
                  phase: 'System Selection & Planning',
                  duration: '3 weeks',
                  activities: ['Evaluate current processes', 'Research solutions', 'Plan implementation'],
                  deliverables: ['Vendor selection', 'Implementation timeline', 'Training plan']
                },
                {
                  phase: 'Implementation & Integration',
                  duration: '6 weeks',
                  activities: ['Install software', 'Integrate systems', 'Configure workflows'],
                  deliverables: ['Functional system', 'Integrated processes', 'Trained team']
                },
                {
                  phase: 'Optimization & Monitoring',
                  duration: '3 weeks',
                  activities: ['Monitor performance', 'Fine-tune settings', 'Measure results'],
                  deliverables: ['Performance reports', 'Optimization recommendations', 'ROI analysis']
                }
              ],
              keyMetrics: ['Inventory turnover rate', 'Days in inventory', 'Gross profit per unit', 'Market pricing accuracy'],
              learningResources: [
                { title: 'Used Vehicle Inventory Best Practices', type: 'Course' },
                { title: 'Market-Based Pricing Strategies', type: 'Article' },
                { title: 'Technology Solutions for Dealers', type: 'Video' },
                { title: 'Inventory Optimization Workshop', type: 'Webinar' }
              ]
            });
            break;

          case 'service-performance':
            resources.push({
              department: 'Service Performance',
              score,
              implementationGuide: [
                {
                  phase: 'Process Analysis & Planning',
                  duration: '4 weeks',
                  activities: ['Map current processes', 'Identify improvement areas', 'Select technology solutions'],
                  deliverables: ['Process map', 'Technology roadmap', 'Implementation plan']
                },
                {
                  phase: 'Technology Implementation',
                  duration: '8 weeks',
                  activities: ['Install systems', 'Configure workflows', 'Train staff'],
                  deliverables: ['Deployed technology', 'Trained workforce', 'Updated processes']
                },
                {
                  phase: 'Performance Monitoring',
                  duration: '2 weeks',
                  activities: ['Track KPIs', 'Gather feedback', 'Make adjustments'],
                  deliverables: ['Performance dashboard', 'Feedback reports', 'Continuous improvement plan']
                }
              ],
              keyMetrics: ['Labor efficiency rate', 'Customer satisfaction scores', 'Technician productivity', 'Service retention rate'],
              learningResources: [
                { title: 'Digital Service Management', type: 'Course' },
                { title: 'Customer Experience in Service', type: 'Article' },
                { title: 'Technician Productivity Tools', type: 'Video' },
                { title: 'Service Department Innovation', type: 'Webinar' }
              ]
            });
            break;

          case 'parts-inventory':
            resources.push({
              department: 'Parts & Inventory',
              score,
              implementationGuide: [
                {
                  phase: 'Data Analysis & Planning',
                  duration: '2 weeks',
                  activities: ['Analyze inventory data', 'Identify patterns', 'Select technology'],
                  deliverables: ['Data analysis report', 'Technology selection', 'Implementation plan']
                },
                {
                  phase: 'System Implementation',
                  duration: '6 weeks',
                  activities: ['Deploy analytics platform', 'Configure forecasting', 'Train team'],
                  deliverables: ['Operational system', 'Trained staff', 'Optimized processes']
                },
                {
                  phase: 'Monitoring & Optimization',
                  duration: '2 weeks',
                  activities: ['Track performance', 'Fine-tune models', 'Measure ROI'],
                  deliverables: ['Performance metrics', 'Optimized models', 'ROI report']
                }
              ],
              keyMetrics: ['Inventory turnover rate', 'Fill rate percentage', 'Carrying cost reduction', 'Obsolete parts percentage'],
              learningResources: [
                { title: 'Parts Inventory Management Best Practices', type: 'Course' },
                { title: 'Predictive Analytics in Automotive', type: 'Article' },
                { title: 'Inventory Optimization Techniques', type: 'Video' },
                { title: 'Parts Department Efficiency', type: 'Webinar' }
              ]
            });
            break;

          case 'financial-operations':
            resources.push({
              department: 'Financial Operations',
              score,
              implementationGuide: [
                {
                  phase: 'Process Mapping & Analysis',
                  duration: '3 weeks',
                  activities: ['Document current processes', 'Identify bottlenecks', 'Plan automation'],
                  deliverables: ['Process documentation', 'Automation roadmap', 'Platform selection']
                },
                {
                  phase: 'Automation Implementation',
                  duration: '7 weeks',
                  activities: ['Deploy platform', 'Configure workflows', 'Test processes'],
                  deliverables: ['Automated processes', 'Trained team', 'Quality assurance']
                },
                {
                  phase: 'Monitoring & Expansion',
                  duration: '2 weeks',
                  activities: ['Monitor performance', 'Identify additional opportunities', 'Plan expansion'],
                  deliverables: ['Performance reports', 'Expansion plan', 'ROI analysis']
                }
              ],
              keyMetrics: ['Process automation rate', 'Error reduction percentage', 'Time savings', 'Cost efficiency improvement'],
              learningResources: [
                { title: 'Financial Process Automation', type: 'Course' },
                { title: 'Dealership Financial Management', type: 'Article' },
                { title: 'Automation Tools Overview', type: 'Video' },
                { title: 'Financial Efficiency Strategies', type: 'Webinar' }
              ]
            });
            break;
        }
      }
    });

    return resources;
  };

  const departmentResources = generateDepartmentResources();
  const getIcon = (type: string) => {
    switch (type) {
      case 'Course': return BookOpen;
      case 'Video': return Video;
      case 'Article': return FileText;
      case 'Webinar': return Globe;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Course': return 'bg-blue-500';
      case 'Video': return 'bg-purple-500';
      case 'Article': return 'bg-green-500';
      case 'Webinar': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            Useful Resources & Learning Materials
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Comprehensive guides, metrics, and learning resources tailored to your assessment results. 
            Each section provides implementation guides, key performance metrics, and curated learning materials.
          </p>
        </CardContent>
      </Card>

      {/* Department Resources */}
      {departmentResources.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Great job! All departments are performing above 75%. No additional resources needed at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {departmentResources.map((resource, index) => (
            <Card key={index} className="border shadow-md">
              <CardHeader className="bg-gradient-to-r from-background to-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{resource.department}</CardTitle>
                  <Badge variant="outline">Score: {resource.score}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Implementation Guide */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Implementation Guide
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    {resource.implementationGuide.map((phase, phaseIndex) => (
                      <AccordionItem key={phaseIndex} value={`phase-${phaseIndex}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{phase.duration}</Badge>
                            <span>{phase.phase}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Activities:</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {phase.activities.map((activity, actIndex) => (
                                  <li key={actIndex}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2">Deliverables:</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {phase.deliverables.map((deliverable, delIndex) => (
                                  <li key={delIndex}>{deliverable}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                {/* Key Performance Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Key Performance Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resource.keyMetrics.map((metric, metricIndex) => (
                      <Card key={metricIndex} className="border-primary/20">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            {metric}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Learning Resources */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Learning Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resource.learningResources.map((learningResource, lrIndex) => {
                      const Icon = getIcon(learningResource.type);
                      return (
                        <Card key={lrIndex} className="border hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn("p-2 rounded-lg", getTypeColor(learningResource.type))}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <Badge variant="outline" className="mb-2">{learningResource.type}</Badge>
                                <p className="text-sm font-medium">{learningResource.title}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, BookOpen, Users, Wrench, Target, Zap } from "lucide-react";

interface InteractiveRecommendationsProps {
  scores: Record<string, number>;
  answers: Record<string, any>;
}

interface Recommendation {
  id: string;
  department: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedROI: string;
  effortLevel: 'Low' | 'Medium' | 'High';
  timeframe: string;
  checklist: {
    id: string;
    task: string;
    completed: boolean;
    category: 'Planning' | 'Implementation' | 'Monitoring';
  }[];
  learningResources: {
    title: string;
    type: 'Article' | 'Video' | 'Course' | 'Webinar';
    url?: string;
  }[];
  keyMetrics: string[];
  implementationGuide: {
    phase: string;
    duration: string;
    activities: string[];
    deliverables: string[];
  }[];
}

export function InteractiveRecommendations({ scores, answers }: InteractiveRecommendationsProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<string, boolean>>>({});
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    Object.entries(scores).forEach(([department, score]) => {
      if (score < 75) {
        const priority: Recommendation['priority'] = 
          score < 50 ? 'Critical' : 
          score < 60 ? 'High' : 
          score < 70 ? 'Medium' : 'Low';

        switch (department) {
          case 'new-vehicle-sales':
            recommendations.push({
              id: 'nvs-training',
              department: 'New Vehicle Sales',
              title: 'Comprehensive Sales Training Program',
              description: 'Implement a structured training program to enhance sales team performance, customer engagement, and closing techniques.',
              priority,
              estimatedROI: score < 60 ? '$150,000-$200,000 annually' : '$75,000-$125,000 annually',
              effortLevel: 'Medium',
              timeframe: '6-8 weeks',
              checklist: [
                { id: 'nvs-1', task: 'Conduct skills assessment for all sales staff', completed: false, category: 'Planning' },
                { id: 'nvs-2', task: 'Develop customized training curriculum', completed: false, category: 'Planning' },
                { id: 'nvs-3', task: 'Source training materials and resources', completed: false, category: 'Planning' },
                { id: 'nvs-4', task: 'Schedule training sessions', completed: false, category: 'Implementation' },
                { id: 'nvs-5', task: 'Execute role-playing exercises', completed: false, category: 'Implementation' },
                { id: 'nvs-6', task: 'Implement peer mentoring system', completed: false, category: 'Implementation' },
                { id: 'nvs-7', task: 'Track performance improvements', completed: false, category: 'Monitoring' },
                { id: 'nvs-8', task: 'Gather feedback and adjust program', completed: false, category: 'Monitoring' }
              ],
              learningResources: [
                { title: 'Modern Sales Techniques in Automotive Industry', type: 'Course' },
                { title: 'Customer Psychology and Buying Behavior', type: 'Article' },
                { title: 'Closing Techniques That Work', type: 'Video' },
                { title: 'Building Long-term Customer Relationships', type: 'Webinar' }
              ],
              keyMetrics: ['Closing ratio improvement', 'Customer satisfaction scores', 'Average deal size', 'Lead conversion rate'],
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
              ]
            });
            break;

          case 'used-vehicle-sales':
            recommendations.push({
              id: 'uvs-inventory',
              department: 'Used Vehicle Sales',
              title: 'Advanced Inventory Management System',
              description: 'Implement data-driven inventory management to optimize vehicle acquisition, pricing, and turnover rates.',
              priority,
              estimatedROI: score < 60 ? '$120,000-$180,000 annually' : '$60,000-$100,000 annually',
              effortLevel: 'High',
              timeframe: '8-12 weeks',
              checklist: [
                { id: 'uvs-1', task: 'Evaluate current inventory tracking methods', completed: false, category: 'Planning' },
                { id: 'uvs-2', task: 'Research and select inventory management software', completed: false, category: 'Planning' },
                { id: 'uvs-3', task: 'Integrate with existing DMS systems', completed: false, category: 'Implementation' },
                { id: 'uvs-4', task: 'Train staff on new system', completed: false, category: 'Implementation' },
                { id: 'uvs-5', task: 'Implement automated pricing tools', completed: false, category: 'Implementation' },
                { id: 'uvs-6', task: 'Set up performance dashboards', completed: false, category: 'Implementation' },
                { id: 'uvs-7', task: 'Monitor inventory turnover rates', completed: false, category: 'Monitoring' },
                { id: 'uvs-8', task: 'Optimize based on performance data', completed: false, category: 'Monitoring' }
              ],
              learningResources: [
                { title: 'Used Vehicle Inventory Best Practices', type: 'Course' },
                { title: 'Market-Based Pricing Strategies', type: 'Article' },
                { title: 'Technology Solutions for Dealers', type: 'Video' },
                { title: 'Inventory Optimization Workshop', type: 'Webinar' }
              ],
              keyMetrics: ['Inventory turnover rate', 'Days in inventory', 'Gross profit per unit', 'Market pricing accuracy'],
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
              ]
            });
            break;

          case 'service-performance':
            recommendations.push({
              id: 'svc-efficiency',
              department: 'Service Performance',
              title: 'Service Department Digital Transformation',
              description: 'Modernize service operations with digital tools to improve efficiency, customer communication, and technician productivity.',
              priority,
              estimatedROI: score < 60 ? '$200,000-$300,000 annually' : '$100,000-$175,000 annually',
              effortLevel: 'High',
              timeframe: '10-14 weeks',
              checklist: [
                { id: 'svc-1', task: 'Audit current service processes', completed: false, category: 'Planning' },
                { id: 'svc-2', task: 'Select digital service platform', completed: false, category: 'Planning' },
                { id: 'svc-3', task: 'Implement digital check-in system', completed: false, category: 'Implementation' },
                { id: 'svc-4', task: 'Deploy customer communication tools', completed: false, category: 'Implementation' },
                { id: 'svc-5', task: 'Install technician productivity tools', completed: false, category: 'Implementation' },
                { id: 'svc-6', task: 'Train service advisors and technicians', completed: false, category: 'Implementation' },
                { id: 'svc-7', task: 'Monitor efficiency metrics', completed: false, category: 'Monitoring' },
                { id: 'svc-8', task: 'Collect customer feedback', completed: false, category: 'Monitoring' }
              ],
              learningResources: [
                { title: 'Digital Service Management', type: 'Course' },
                { title: 'Customer Experience in Service', type: 'Article' },
                { title: 'Technician Productivity Tools', type: 'Video' },
                { title: 'Service Department Innovation', type: 'Webinar' }
              ],
              keyMetrics: ['Labor efficiency rate', 'Customer satisfaction scores', 'Technician productivity', 'Service retention rate'],
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
              ]
            });
            break;

          case 'parts-inventory':
            recommendations.push({
              id: 'pts-optimization',
              department: 'Parts & Inventory',
              title: 'Predictive Parts Inventory System',
              description: 'Implement advanced analytics and forecasting to optimize parts inventory levels, reduce carrying costs, and improve fill rates.',
              priority,
              estimatedROI: score < 60 ? '$80,000-$120,000 annually' : '$40,000-$70,000 annually',
              effortLevel: 'Medium',
              timeframe: '6-10 weeks',
              checklist: [
                { id: 'pts-1', task: 'Analyze current parts usage patterns', completed: false, category: 'Planning' },
                { id: 'pts-2', task: 'Select predictive analytics platform', completed: false, category: 'Planning' },
                { id: 'pts-3', task: 'Implement automated ordering system', completed: false, category: 'Implementation' },
                { id: 'pts-4', task: 'Configure demand forecasting models', completed: false, category: 'Implementation' },
                { id: 'pts-5', task: 'Train parts staff on new system', completed: false, category: 'Implementation' },
                { id: 'pts-6', task: 'Set up performance monitoring', completed: false, category: 'Implementation' },
                { id: 'pts-7', task: 'Monitor inventory turnover', completed: false, category: 'Monitoring' },
                { id: 'pts-8', task: 'Optimize inventory levels', completed: false, category: 'Monitoring' }
              ],
              learningResources: [
                { title: 'Parts Inventory Management Best Practices', type: 'Course' },
                { title: 'Predictive Analytics in Automotive', type: 'Article' },
                { title: 'Inventory Optimization Techniques', type: 'Video' },
                { title: 'Parts Department Efficiency', type: 'Webinar' }
              ],
              keyMetrics: ['Inventory turnover rate', 'Fill rate percentage', 'Carrying cost reduction', 'Obsolete parts percentage'],
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
              ]
            });
            break;

          case 'financial-operations':
            recommendations.push({
              id: 'fin-automation',
              department: 'Financial Operations',
              title: 'Financial Process Automation Platform',
              description: 'Streamline financial processes through automation, improving accuracy, reducing manual work, and enhancing reporting capabilities.',
              priority,
              estimatedROI: score < 60 ? '$100,000-$150,000 annually' : '$50,000-$85,000 annually',
              effortLevel: 'Medium',
              timeframe: '8-12 weeks',
              checklist: [
                { id: 'fin-1', task: 'Map current financial processes', completed: false, category: 'Planning' },
                { id: 'fin-2', task: 'Identify automation opportunities', completed: false, category: 'Planning' },
                { id: 'fin-3', task: 'Select automation platform', completed: false, category: 'Planning' },
                { id: 'fin-4', task: 'Configure automated workflows', completed: false, category: 'Implementation' },
                { id: 'fin-5', task: 'Integrate with existing systems', completed: false, category: 'Implementation' },
                { id: 'fin-6', task: 'Train finance team', completed: false, category: 'Implementation' },
                { id: 'fin-7', task: 'Monitor process efficiency', completed: false, category: 'Monitoring' },
                { id: 'fin-8', task: 'Optimize and expand automation', completed: false, category: 'Monitoring' }
              ],
              learningResources: [
                { title: 'Financial Process Automation', type: 'Course' },
                { title: 'Dealership Financial Management', type: 'Article' },
                { title: 'Automation Tools Overview', type: 'Video' },
                { title: 'Financial Efficiency Strategies', type: 'Webinar' }
              ],
              keyMetrics: ['Process automation rate', 'Error reduction percentage', 'Time savings', 'Cost efficiency improvement'],
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
              ]
            });
            break;
        }
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const handleCheckboxChange = (recommendationId: string, taskId: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [recommendationId]: {
        ...prev[recommendationId],
        [taskId]: checked
      }
    }));
  };

  const getCompletionPercentage = (recommendationId: string, checklist: Recommendation['checklist']): number => {
    const completed = checklist.filter(task => checkedItems[recommendationId]?.[task.id]).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const getPriorityColor = (priority: Recommendation['priority']): string => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getEffortColor = (effort: Recommendation['effortLevel']): string => {
    switch (effort) {
      case 'High': return 'bg-red-50 text-red-700';
      case 'Medium': return 'bg-yellow-50 text-yellow-700';
      case 'Low': return 'bg-green-50 text-green-700';
    }
  };

  const recommendations = generateRecommendations();

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Target className="h-6 w-6" />
            Recommendation Engine Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
              <div className="text-sm text-blue-700">Active Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {recommendations.filter(r => r.priority === 'Critical').length}
              </div>
              <div className="text-sm text-red-700">Critical Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recommendations.reduce((sum, r) => {
                  const roi = parseInt(r.estimatedROI.match(/\$(\d+),?(\d+)?/)?.[1] + (r.estimatedROI.match(/\$(\d+),?(\d+)?/)?.[2] || '') || '0');
                  return sum + roi;
                }, 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Est. Total ROI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(recommendations.reduce((sum, r) => sum + getCompletionPercentage(r.id, r.checklist), 0) / recommendations.length) || 0}%
              </div>
              <div className="text-sm text-purple-700">Avg. Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Cards */}
      <div className="space-y-6">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${getPriorityColor(rec.priority)} font-medium`} variant="outline">
                      {rec.priority === 'Critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {rec.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rec.department}
                    </Badge>
                    <Badge className={getEffortColor(rec.effortLevel)} variant="outline">
                      {rec.effortLevel} Effort
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{rec.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{rec.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">{rec.estimatedROI}</div>
                  <div className="text-xs text-gray-500">ROI Estimate</div>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Clock className="h-3 w-3" />
                    <span>{rec.timeframe}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Overview */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Implementation Progress</span>
                  <span className="text-sm font-bold text-blue-600">
                    {getCompletionPercentage(rec.id, rec.checklist)}%
                  </span>
                </div>
                <Progress value={getCompletionPercentage(rec.id, rec.checklist)} className="mb-2" />
                <div className="text-xs text-gray-600">
                  {rec.checklist.filter(task => checkedItems[rec.id]?.[task.id]).length} of {rec.checklist.length} tasks completed
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="implementation">
                  <AccordionTrigger className="text-sm font-medium">
                    📋 Implementation Guide
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {rec.implementationGuide.map((phase, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
                            <h4 className="font-medium">{phase.phase}</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Key Activities</h5>
                              <ul className="space-y-1">
                                {phase.activities.map((activity, actIndex) => (
                                  <li key={actIndex} className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span className="text-gray-600">{activity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Deliverables</h5>
                              <ul className="space-y-1">
                                {phase.deliverables.map((deliverable, delIndex) => (
                                  <li key={delIndex} className="flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                                    <span className="text-gray-600">{deliverable}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="checklist">
                  <AccordionTrigger className="text-sm font-medium">
                    ✅ Interactive Checklist
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {['Planning', 'Implementation', 'Monitoring'].map(category => {
                        const categoryTasks = rec.checklist.filter(task => task.category === category);
                        if (categoryTasks.length === 0) return null;
                        
                        return (
                          <div key={category} className="border rounded-lg p-3">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                              {category === 'Planning' && <Target className="h-4 w-4" />}
                              {category === 'Implementation' && <Wrench className="h-4 w-4" />}
                              {category === 'Monitoring' && <TrendingUp className="h-4 w-4" />}
                              {category} Phase
                            </h4>
                            <div className="space-y-2">
                              {categoryTasks.map(task => (
                                <div key={task.id} className="flex items-start gap-3">
                                  <Checkbox
                                    id={task.id}
                                    checked={checkedItems[rec.id]?.[task.id] || false}
                                    onCheckedChange={(checked) => 
                                      handleCheckboxChange(rec.id, task.id, !!checked)
                                    }
                                    className="mt-1"
                                  />
                                  <label htmlFor={task.id} className="text-sm text-gray-700 cursor-pointer">
                                    {task.task}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="metrics">
                  <AccordionTrigger className="text-sm font-medium">
                    📊 Key Performance Metrics
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {rec.keyMetrics.map((metric, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-3 text-center">
                          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                          <div className="text-xs text-blue-800 font-medium">{metric}</div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="resources">
                  <AccordionTrigger className="text-sm font-medium">
                    📚 Learning Resources
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rec.learningResources.map((resource, index) => (
                        <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                          </div>
                          <h4 className="font-medium text-sm mt-2">{resource.title}</h4>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
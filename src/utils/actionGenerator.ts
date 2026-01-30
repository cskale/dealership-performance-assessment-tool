import { Question, Section } from '@/data/questionnaire';

/**
 * Intelligent Action Generator
 * 
 * Analyzes assessment answers at the question level to generate
 * specific, actionable improvement items instead of generic suggestions.
 */

export interface ActionContext {
  questionId: string;
  questionText: string;
  score: number;
  weight: number;
  purpose?: string;
  situationAnalysis?: string;
  linkedKPIs?: string[];
  benefits?: string;
  category: string;
  department: string;
}

export interface GeneratedAction {
  department: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action_title: string;
  action_description: string;
  implementation_steps: string[];
  timeline_estimate: string;
  expected_impact: string;
  linked_kpis: string[];
  support_required_from: string[];
}

/**
 * Extract weak points from assessment answers
 */
export function analyzeAssessmentAnswers(
  sections: Section[],
  answers: Record<string, number>
): ActionContext[] {
  const weakPoints: ActionContext[] = [];

  sections.forEach((section) => {
    section.questions.forEach((question) => {
      const score = answers[question.id];
      
      // Consider questions with score 1-3 as needing attention
      if (score && score <= 3) {
        weakPoints.push({
          questionId: question.id,
          questionText: question.text,
          score,
          weight: question.weight || 1,
          purpose: question.purpose,
          situationAnalysis: question.situationAnalysis,
          linkedKPIs: question.linkedKPIs,
          benefits: question.benefits,
          category: question.category,
          department: section.title,
        });
      }
    });
  });

  // Sort by priority: lowest score * highest weight first
  return weakPoints.sort((a, b) => {
    const priorityA = a.score * (1 / a.weight);
    const priorityB = b.score * (1 / b.weight);
    return priorityA - priorityB;
  });
}

/**
 * Generate specific action items from weak points
 */
export function generateActionsFromContext(
  weakPoints: ActionContext[],
  maxActions: number = 10
): GeneratedAction[] {
  const actions: GeneratedAction[] = [];
  const processedDepartments = new Set<string>();

  // Group weak points by department
  const departmentGroups = weakPoints.reduce((acc, point) => {
    if (!acc[point.department]) {
      acc[point.department] = [];
    }
    acc[point.department].push(point);
    return acc;
  }, {} as Record<string, ActionContext[]>);

  // Generate actions for each department
  Object.entries(departmentGroups).forEach(([department, points]) => {
    if (actions.length >= maxActions) return;

    // Take top 2-3 weakest points per department
    const topWeakPoints = points.slice(0, 3);

    topWeakPoints.forEach((point) => {
      if (actions.length >= maxActions) return;

      const action = createSpecificAction(point, department);
      actions.push(action);
    });
  });

  return actions;
}

/**
 * Create a specific action from question context
 */
function createSpecificAction(
  context: ActionContext,
  department: string
): GeneratedAction {
  // Determine priority based on score and weight
  let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
  const urgency = context.score * (1 / context.weight);
  
  if (urgency <= 1.5) priority = 'critical';
  else if (urgency <= 2.5) priority = 'high';
  else if (urgency <= 3.5) priority = 'medium';
  else priority = 'low';

  // Extract actionable insight from question text
  const actionTitle = generateActionTitle(context);
  const actionDescription = generateActionDescription(context);
  const implementationSteps = generateImplementationSteps(context);
  const timeline = estimateTimeline(priority, context);

  return {
    department,
    priority,
    action_title: actionTitle,
    action_description: actionDescription,
    implementation_steps: implementationSteps,
    timeline_estimate: timeline,
    expected_impact: context.benefits || `Improve ${context.category} performance`,
    linked_kpis: context.linkedKPIs || [`${context.category} metrics`],
    support_required_from: determineSupportNeeded(context),
  };
}

/**
 * Generate specific action title from question context
 */
function generateActionTitle(context: ActionContext): string {
  // Extract key action from question text
  const questionLower = context.questionText.toLowerCase();
  
  // Common patterns in assessment questions
  if (questionLower.includes('lead time') || questionLower.includes('response time')) {
    return `Reduce ${context.category} response time to industry standard`;
  }
  if (questionLower.includes('inventory') || questionLower.includes('stock')) {
    return `Optimize ${context.category} inventory management`;
  }
  if (questionLower.includes('customer satisfaction') || questionLower.includes('csi')) {
    return `Improve ${context.category} customer satisfaction scores`;
  }
  if (questionLower.includes('training') || questionLower.includes('development')) {
    return `Implement comprehensive ${context.category} training program`;
  }
  if (questionLower.includes('process') || questionLower.includes('workflow')) {
    return `Streamline ${context.category} processes and workflows`;
  }
  if (questionLower.includes('digital') || questionLower.includes('technology')) {
    return `Digitalize ${context.category} operations`;
  }
  if (questionLower.includes('communication') || questionLower.includes('coordination')) {
    return `Enhance ${context.category} communication and coordination`;
  }
  
  // Fallback: use purpose or generic action
  if (context.purpose) {
    return `Address: ${context.purpose.substring(0, 60)}...`;
  }
  
  return `Improve ${context.category} - ${context.questionText.substring(0, 40)}...`;
}

/**
 * Generate detailed action description
 */
function generateActionDescription(context: ActionContext): string {
  let description = `Current assessment score: ${context.score}/5 (Priority: ${context.weight}x)\n\n`;
  
  if (context.situationAnalysis) {
    description += `Situation: ${context.situationAnalysis}\n\n`;
  }
  
  description += `Focus Area: ${context.questionText}\n\n`;
  
  if (context.benefits) {
    description += `Expected Benefits: ${context.benefits}`;
  }
  
  return description;
}

/**
 * Generate implementation steps based on context
 */
function generateImplementationSteps(context: ActionContext): string[] {
  const steps: string[] = [];
  const questionLower = context.questionText.toLowerCase();
  
  // Generic first steps
  steps.push('Conduct detailed gap analysis of current state');
  steps.push('Define measurable success criteria and KPIs');
  
  // Context-specific steps
  if (questionLower.includes('training')) {
    steps.push('Develop comprehensive training curriculum');
    steps.push('Schedule and conduct training sessions');
    steps.push('Implement ongoing coaching and mentoring');
  } else if (questionLower.includes('process')) {
    steps.push('Map current processes and identify bottlenecks');
    steps.push('Design improved workflow with stakeholder input');
    steps.push('Implement changes with pilot program');
  } else if (questionLower.includes('technology') || questionLower.includes('digital')) {
    steps.push('Evaluate and select appropriate technology solutions');
    steps.push('Implement technology with proper change management');
    steps.push('Train staff on new systems and tools');
  } else {
    steps.push('Develop and implement improvement plan');
    steps.push('Monitor progress with regular check-ins');
  }
  
  steps.push('Review results and adjust approach as needed');
  
  return steps;
}

/**
 * Estimate timeline based on priority and complexity
 */
function estimateTimeline(priority: string, context: ActionContext): string {
  const questionLower = context.questionText.toLowerCase();
  
  // Quick wins
  if (questionLower.includes('communication') || questionLower.includes('meeting')) {
    return '2-4 weeks';
  }
  
  // Medium complexity
  if (questionLower.includes('process') || questionLower.includes('training')) {
    return priority === 'critical' ? '4-6 weeks' : '6-8 weeks';
  }
  
  // High complexity
  if (questionLower.includes('technology') || questionLower.includes('system')) {
    return priority === 'critical' ? '8-12 weeks' : '12-16 weeks';
  }
  
  // Default estimates
  if (priority === 'critical') return '2-4 weeks';
  if (priority === 'high') return '4-8 weeks';
  if (priority === 'medium') return '8-12 weeks';
  return '12-16 weeks';
}

/**
 * Determine who needs to support this action
 */
function determineSupportNeeded(context: ActionContext): string[] {
  const support: string[] = [];
  const questionLower = context.questionText.toLowerCase();
  
  // Always need management for critical items
  if (context.score <= 2) {
    support.push('Senior Management');
  }
  
  if (questionLower.includes('training') || questionLower.includes('development')) {
    support.push('HR Department', 'Training Team');
  }
  
  if (questionLower.includes('technology') || questionLower.includes('digital') || questionLower.includes('system')) {
    support.push('IT Department', 'Technology Vendors');
  }
  
  if (questionLower.includes('financial') || questionLower.includes('budget')) {
    support.push('Finance Department', 'CFO');
  }
  
  if (questionLower.includes('customer') || questionLower.includes('service')) {
    support.push('Customer Service Team', 'Marketing');
  }
  
  // Default support
  if (support.length === 0) {
    support.push('Department Manager', 'Coach');
  }
  
  return support;
}

/**
 * Format actions for database insertion
 */
export function formatActionsForDatabase(
  actions: GeneratedAction[],
  userId: string,
  assessmentId?: string
): any[] {
  return actions.map((action) => ({
    user_id: userId,
    assessment_id: assessmentId || null,
    department: action.department,
    priority: action.priority,
    action_title: action.action_title,
    action_description: action.action_description,
    status: 'Open',
    support_required_from: action.support_required_from,
    kpis_linked_to: action.linked_kpis,
    responsible_person: null,
    target_completion_date: null,
  }));
}

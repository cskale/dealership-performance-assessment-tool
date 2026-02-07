import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DealershipInfo, AssessmentData, BenchmarkData, ImprovementAction } from '@/types/dealership';
import { useAuth } from './useAuth';

// Error types for proper error handling
export class OnboardingError extends Error {
  constructor(
    message: string,
    public readonly type: 'organization' | 'dealership'
  ) {
    super(message);
    this.name = 'OnboardingError';
  }
}

interface AssessmentContext {
  organizationId: string;
  dealershipId: string;
}

interface SavedAssessment extends AssessmentData {
  dbId: string; // Real database ID - never client-generated
}

export const useAssessmentData = () => {
  const { user } = useAuth();
  const [dealership, setDealership] = useState<DealershipInfo | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate or retrieve session ID
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('dealership_assessment_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('dealership_assessment_session', sessionId);
    }
    return sessionId;
  }, []);

  /**
   * CRITICAL: Validate user has proper org/dealership context
   * Throws OnboardingError if validation fails
   */
  const validateAssessmentContext = useCallback(async (): Promise<AssessmentContext> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('active_organization_id, active_dealership_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to load profile');
    }

    // HARD VALIDATION: Organization is required
    if (!profile?.active_organization_id) {
      throw new OnboardingError(
        'No organization selected. Please complete onboarding.',
        'organization'
      );
    }

    // HARD VALIDATION: Dealership is required
    if (!profile?.active_dealership_id) {
      throw new OnboardingError(
        'No dealership selected. Please select or create a dealership.',
        'dealership'
      );
    }

    // Validate dealership belongs to organization
    const { data: dealershipData, error: dealershipError } = await supabase
      .from('dealerships')
      .select('id, name, brand, country, location, organization_id')
      .eq('id', profile.active_dealership_id)
      .single();

    if (dealershipError || !dealershipData) {
      throw new OnboardingError(
        'Selected dealership not found. Please select a valid dealership.',
        'dealership'
      );
    }

    if (dealershipData.organization_id !== profile.active_organization_id) {
      throw new OnboardingError(
        'Dealership does not belong to current organization. Please re-select.',
        'dealership'
      );
    }

    // Set dealership state for other operations
    setDealership({
      id: dealershipData.id,
      name: dealershipData.name,
      brand: dealershipData.brand,
      country: dealershipData.country,
      location: dealershipData.location,
    });

    return {
      organizationId: profile.active_organization_id,
      dealershipId: profile.active_dealership_id,
    };
  }, [user]);

  // Save dealership information
  const saveDealership = useCallback(async (dealershipData: DealershipInfo) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Extract contact info before saving dealership
      const { contactEmail, phone, ...dealershipFields } = dealershipData;
      
      // Get user's active organization (required)
      const context = await validateAssessmentContext();
        
      const dealershipWithUser = {
        ...dealershipFields,
        user_id: user.id,
        organization_id: context.organizationId
      };

      // Save dealership (without contact info) - use DB-generated ID
      const { data: dealershipResult, error: dealershipError } = await supabase
        .from('dealerships')
        .upsert(dealershipWithUser, { onConflict: 'id' })
        .select('id, name, brand, country, location')
        .single();

      if (dealershipError) throw dealershipError;
      
      // Save contact info to protected table if provided
      if (contactEmail || phone) {
        const { error: contactError } = await supabase
          .from('dealership_contacts')
          .upsert({
            dealership_id: dealershipResult.id,
            contact_email: contactEmail || null,
            phone: phone || null
          }, { onConflict: 'dealership_id' });
        
        if (contactError) throw contactError;
      }
      
      // Combine data for local state (include contact info for form)
      const fullDealershipData = {
        ...dealershipResult,
        contactEmail,
        phone
      };
      
      setDealership(fullDealershipData);
      localStorage.setItem('dealership_info', JSON.stringify(fullDealershipData));
      return fullDealershipData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save dealership information';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, validateAssessmentContext]);

  /**
   * Save assessment progress (in-progress) or complete (completed)
   * CRITICAL: 
   * - For in_progress: Uses localStorage + DB with temp client ID
   * - For completed: MUST use DB-generated ID, validates org/dealership first
   */
  const saveAssessment = useCallback(async (
    assessmentData: Partial<AssessmentData>
  ): Promise<SavedAssessment> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const sessionId = getSessionId();
      const isCompleting = assessmentData.status === 'completed';

      // CRITICAL: For completed assessments, hard-validate context
      let context: AssessmentContext;
      
      if (isCompleting) {
        // This will throw OnboardingError if validation fails
        context = await validateAssessmentContext();
        
        if (import.meta.env.DEV) {
          console.log('[Assessment] Saving completed assessment:', {
            organizationId: context.organizationId,
            dealershipId: context.dealershipId,
          });
        }
      } else {
        // For in-progress saves, try to get context but don't fail
        try {
          context = await validateAssessmentContext();
        } catch (err) {
          // Allow in-progress saves without full context for backwards compatibility
          // but log a warning
          if (import.meta.env.DEV) {
            console.warn('[Assessment] Saving in-progress without full context');
          }
          
          // Still save to localStorage for recovery
          const localData: AssessmentData = {
            id: assessment?.id,
            sessionId,
            dealershipId: undefined,
            answers: assessmentData.answers || {},
            scores: assessmentData.scores || {},
            overallScore: assessmentData.overallScore || 0,
            status: assessmentData.status || 'in_progress',
            completedAt: assessmentData.completedAt || undefined
          };
          
          setAssessment(localData);
          localStorage.setItem('assessment_data', JSON.stringify(localData));
          
          return { ...localData, dbId: '' };
        }
      }

      // Build database insert/update data
      // DO NOT use client-generated UUIDs for the primary key when completing
      const dbData: Record<string, unknown> = {
        session_id: sessionId,
        dealership_id: context.dealershipId,
        organization_id: context.organizationId,
        user_id: user.id,
        answers: assessmentData.answers || {},
        scores: assessmentData.scores || {},
        overall_score: assessmentData.overallScore || 0,
        status: assessmentData.status || 'in_progress',
        completed_at: assessmentData.completedAt || null
      };

      // For existing in-progress assessments, include the ID for upsert
      if (assessment?.id && !isCompleting) {
        dbData.id = assessment.id;
      }

      let result: { id: string };
      
      if (isCompleting) {
        // CRITICAL: For completion, always INSERT to get a fresh DB-generated ID
        // This ensures we never use a client-generated ID for the final record
        const { data, error: insertError } = await supabase
          .from('assessments')
          .insert(dbData as any)
          .select('id, organization_id, dealership_id, created_at')
          .single();

        if (insertError) throw insertError;
        result = data;
        
        if (import.meta.env.DEV) {
          console.log('[Assessment] Completed assessment saved with DB ID:', result.id);
        }
      } else {
        // For in-progress, use upsert
        const { data, error: upsertError } = await supabase
          .from('assessments')
          .upsert(dbData as any, { onConflict: 'id' })
          .select('id')
          .single();

        if (upsertError) throw upsertError;
        result = data;
      }

      const savedData: SavedAssessment = {
        id: result.id,
        dbId: result.id, // This is the real DB ID
        sessionId,
        dealershipId: context.dealershipId,
        answers: assessmentData.answers || {},
        scores: assessmentData.scores || {},
        overallScore: assessmentData.overallScore || 0,
        status: assessmentData.status || 'in_progress',
        completedAt: assessmentData.completedAt || undefined
      };

      setAssessment(savedData);
      
      // Only cache in-progress assessments to localStorage
      if (!isCompleting) {
        localStorage.setItem('assessment_data', JSON.stringify(savedData));
      }
      
      return savedData;
    } catch (err) {
      // Rethrow OnboardingError for proper handling upstream
      if (err instanceof OnboardingError) {
        throw err;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to save assessment';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [assessment, user, getSessionId, validateAssessmentContext]);

  // Load assessment data
  const loadAssessment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load from localStorage
      const cachedAssessment = localStorage.getItem('assessment_data');
      if (cachedAssessment) {
        const parsedAssessment = JSON.parse(cachedAssessment);
        setAssessment(parsedAssessment);
        return parsedAssessment;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assessment';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load benchmark data
  const loadBenchmarks = useCallback(async (brand?: string, country?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('benchmarks').select('*');
      
      if (brand) {
        query = query.eq('brand', brand);
      }
      if (country) {
        query = query.eq('country', country);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map database fields to component format
      const mappedBenchmarks: BenchmarkData[] = (data || []).map(item => ({
        brand: item.brand,
        country: item.country,
        segment: item.segment,
        metricName: item.metric_name,
        averageScore: item.average_score,
        percentile25: item.percentile_25 || undefined,
        percentile75: item.percentile_75 || undefined,
        sampleSize: item.sample_size
      }));
      
      setBenchmarks(mappedBenchmarks);
      return mappedBenchmarks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load benchmarks';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate improvement actions
  const generateImprovementActions = useCallback(async (assessmentId: string, scores: Record<string, number>) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Validate that assessmentId is a real DB ID (not empty, not temp)
    if (!assessmentId || assessmentId === '' || assessmentId.startsWith('temp')) {
      throw new Error('Invalid assessment ID - cannot generate actions without a saved assessment');
    }

    const actions: Record<string, unknown>[] = [];
    
    // Get organization ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('active_organization_id')
      .eq('user_id', user.id)
      .single();
    
    if (!profile?.active_organization_id) {
      throw new Error('No organization context');
    }
    
    // Analyze scores and generate targeted actions
    Object.entries(scores).forEach(([section, score]) => {
      if (score < 70) {
        let priority: ImprovementAction['priority'] = 'medium';
        if (score < 50) priority = 'critical';
        else if (score < 60) priority = 'high';

        switch (section) {
          case 'new_vehicle_sales':
            actions.push({
              assessment_id: assessmentId,
              user_id: user.id,
              organization_id: profile.active_organization_id,
              department: 'New Vehicle Sales',
              priority,
              action_title: 'Enhance Sales Process Training',
              action_description: 'Implement comprehensive training program focusing on customer engagement, product knowledge, and closing techniques.',
              expected_impact: 'Improve conversion rates by 15-20%',
              estimated_effort: '2-3 weeks implementation'
            });
            break;
          case 'used_vehicle_sales':
            actions.push({
              assessment_id: assessmentId,
              user_id: user.id,
              organization_id: profile.active_organization_id,
              department: 'Used Vehicle Sales',
              priority,
              action_title: 'Optimize Used Vehicle Inventory Management',
              action_description: 'Implement data-driven inventory management system and improve vehicle reconditioning processes.',
              expected_impact: 'Reduce inventory days and increase margins by 10%',
              estimated_effort: '3-4 weeks implementation'
            });
            break;
          case 'service_performance':
            actions.push({
              assessment_id: assessmentId,
              user_id: user.id,
              organization_id: profile.active_organization_id,
              department: 'Service',
              priority,
              action_title: 'Service Efficiency Improvement Program',
              action_description: 'Streamline service processes, implement digital check-in, and enhance technician productivity.',
              expected_impact: 'Increase service bay utilization by 20%',
              estimated_effort: '4-6 weeks implementation'
            });
            break;
          case 'parts_inventory':
            actions.push({
              assessment_id: assessmentId,
              user_id: user.id,
              organization_id: profile.active_organization_id,
              department: 'Parts',
              priority,
              action_title: 'Parts Inventory Optimization',
              action_description: 'Implement predictive inventory management and improve supplier relationships.',
              expected_impact: 'Reduce parts cost by 8-12%',
              estimated_effort: '2-3 weeks implementation'
            });
            break;
          case 'financial_operations':
            actions.push({
              assessment_id: assessmentId,
              user_id: user.id,
              organization_id: profile.active_organization_id,
              department: 'Finance',
              priority,
              action_title: 'Financial Process Automation',
              action_description: 'Implement automated reporting and improve cash flow management processes.',
              expected_impact: 'Reduce administrative time by 30%',
              estimated_effort: '3-5 weeks implementation'
            });
            break;
        }
      }
    });

    try {
      const { data, error } = await supabase
        .from('improvement_actions')
        .insert(actions as any)
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate improvement actions';
      setError(errorMessage);
      return [];
    }
  }, [user]);

  // Load cached data on mount
  useEffect(() => {
    const cachedDealership = localStorage.getItem('dealership_info');
    const cachedAssessment = localStorage.getItem('assessment_data');
    
    if (cachedDealership) {
      try {
        setDealership(JSON.parse(cachedDealership));
      } catch (e) {
        localStorage.removeItem('dealership_info');
      }
    }
    
    if (cachedAssessment) {
      try {
        setAssessment(JSON.parse(cachedAssessment));
      } catch (e) {
        localStorage.removeItem('assessment_data');
      }
    }
  }, []);

  return {
    dealership,
    assessment,
    benchmarks,
    isLoading,
    error,
    saveDealership,
    saveAssessment,
    loadAssessment,
    loadBenchmarks,
    generateImprovementActions,
    getSessionId,
    validateAssessmentContext // Export for use in Assessment page
  };
};

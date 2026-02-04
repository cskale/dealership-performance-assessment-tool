import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DealershipInfo, AssessmentData, BenchmarkData, ImprovementAction } from '@/types/dealership';
import { useAuth } from './useAuth';

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
      
      // Get user's active organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_organization_id')
        .eq('user_id', user.id)
        .single();
        
      const dealershipWithUser = {
        ...dealershipFields,
        user_id: user.id,
        organization_id: profile?.active_organization_id || dealershipFields.id || crypto.randomUUID()
      };

      // Save dealership (without contact info)
      const { data: dealershipResult, error: dealershipError } = await supabase
        .from('dealerships')
        .upsert(dealershipWithUser, { onConflict: 'id' })
        .select()
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
  }, [user]);

  // Save assessment progress
  const saveAssessment = useCallback(async (assessmentData: Partial<AssessmentData>) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const sessionId = getSessionId();
      
      // Create assessment data with minimal required fields
      const mappedData: AssessmentData = {
        id: assessment?.id || crypto.randomUUID(),
        sessionId: sessionId,
        dealershipId: dealership?.id || 'temp-id',
        answers: assessmentData.answers || {},
        scores: assessmentData.scores || {},
        overallScore: assessmentData.overallScore || 0,
        status: assessmentData.status || 'in_progress',
        completedAt: assessmentData.completedAt || undefined
      };

      // Save to database if we have a dealership
      if (dealership?.id) {
        const dbData = {
          id: mappedData.id,
          session_id: mappedData.sessionId,
          dealership_id: dealership.id,
          user_id: user.id,
          answers: mappedData.answers,
          scores: mappedData.scores,
          overall_score: mappedData.overallScore,
          status: mappedData.status,
          completed_at: mappedData.completedAt
        };

        const { error } = await supabase
          .from('assessments')
          .upsert(dbData, { onConflict: 'id' });

        if (error) throw error;
      }
      
      setAssessment(mappedData);
      localStorage.setItem('assessment_data', JSON.stringify(mappedData));
      return mappedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save assessment';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [assessment, dealership, user, getSessionId]);

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

    const actions: any[] = [];
    
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
        .insert(actions)
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
    getSessionId
  };
};
/**
 * useAutoActionGeneration Hook
 * 
 * Automatically generates actions when an assessment is completed.
 * Uses deterministic signal engine - same answers always produce same actions.
 * 
 * CRITICAL CONSTRAINTS:
 * - ONLY uses real DB-generated assessment IDs
 * - NEVER uses client-generated UUIDs
 * - Includes idempotency check to prevent duplicates
 * - Validates org context before insertion
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { questionnaire } from '@/data/questionnaire';
import { 
  generateActionsFromAssessment, 
  formatActionsForDatabaseInsert,
  SignalEngineConfig 
} from '@/lib/signalEngine';

// Feature flag - can be disabled via environment variable
const ENABLE_AUTO_ACTIONS = import.meta.env.VITE_ENABLE_AUTO_ACTIONS !== 'false';

interface AutoActionResult {
  success: boolean;
  actionsGenerated: number;
  error?: string;
}

export function useAutoActionGeneration() {
  const { user } = useAuth();

  /**
   * Build question weights map from questionnaire
   */
  const getQuestionWeights = useCallback((): Record<string, number> => {
    const weights: Record<string, number> = {};
    
    for (const section of questionnaire.sections) {
      for (const question of section.questions) {
        weights[question.id] = question.weight;
      }
    }
    
    return weights;
  }, []);

  /**
   * Check if actions already exist for this assessment (idempotency)
   * CRITICAL: assessmentId MUST be a real DB ID
   */
  const checkExistingActions = useCallback(async (assessmentId: string): Promise<boolean> => {
    if (!user) return false;
    
    // Validate assessmentId format (must be UUID, not temp ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(assessmentId)) {
      console.error('[AutoActions] Invalid assessment ID format:', assessmentId);
      return false;
    }

    try {
      const { count, error } = await supabase
        .from('improvement_actions')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', assessmentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[AutoActions] Error checking existing actions:', error);
        return false;
      }

      return (count ?? 0) > 0;
    } catch (err) {
      console.error('[AutoActions] Error checking existing actions:', err);
      return false;
    }
  }, [user]);

  /**
   * Generate and persist actions for a completed assessment
   * 
   * CRITICAL CONSTRAINTS:
   * - assessmentId MUST be a real Supabase-generated UUID (returned from INSERT)
   * - organizationId MUST be valid and not null
   * - Will fail gracefully if preconditions not met
   * 
   * @param assessmentId - UUID of the completed assessment (MUST be DB-generated)
   * @param answers - Map of questionId → score (1-5)
   * @param organizationId - User's active organization ID
   * @returns Result object with success status and count
   */
  const generateActions = useCallback(async (
    assessmentId: string,
    answers: Record<string, number>,
    organizationId: string
  ): Promise<AutoActionResult> => {
    // Check feature flag
    if (!ENABLE_AUTO_ACTIONS) {
      if (import.meta.env.DEV) {
        console.log('[AutoActions] Feature disabled via VITE_ENABLE_AUTO_ACTIONS');
      }
      return { success: true, actionsGenerated: 0 };
    }

    if (!user) {
      return { success: false, actionsGenerated: 0, error: 'User not authenticated' };
    }

    // CRITICAL: Validate assessmentId is a real UUID, not client-generated or temp
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!assessmentId || !uuidRegex.test(assessmentId)) {
      console.error('[AutoActions] REJECTED: Invalid assessment ID format:', assessmentId);
      return { 
        success: false, 
        actionsGenerated: 0, 
        error: 'Invalid assessment ID - must be a valid database UUID' 
      };
    }

    // CRITICAL: Validate organizationId
    if (!organizationId || !uuidRegex.test(organizationId)) {
      console.error('[AutoActions] REJECTED: Invalid organization ID:', organizationId);
      return { 
        success: false, 
        actionsGenerated: 0, 
        error: 'Invalid organization ID' 
      };
    }

    // Verify assessment exists in database
    const { data: assessmentCheck, error: checkError } = await supabase
      .from('assessments')
      .select('id')
      .eq('id', assessmentId)
      .single();
    
    if (checkError || !assessmentCheck) {
      console.error('[AutoActions] REJECTED: Assessment not found in database:', assessmentId);
      return { 
        success: false, 
        actionsGenerated: 0, 
        error: 'Assessment not found in database' 
      };
    }

    try {
      // Idempotency check: don't regenerate if actions exist
      const hasExisting = await checkExistingActions(assessmentId);
      if (hasExisting) {
        if (import.meta.env.DEV) {
          console.log('[AutoActions] Actions already exist for assessment:', assessmentId);
        }
        return { success: true, actionsGenerated: 0 };
      }

      // Get question weights
      const questionWeights = getQuestionWeights();

      // Configuration
      const config: SignalEngineConfig = {
        enableAutoActions: true,
        weakScoreThreshold: 3,
        criticalScoreThreshold: 2
      };

      // Generate actions using deterministic signal engine
      const actions = generateActionsFromAssessment(answers, questionWeights, config);

      if (actions.length === 0) {
        if (import.meta.env.DEV) {
          console.log('[AutoActions] No weak areas detected - no actions generated');
        }
        return { success: true, actionsGenerated: 0 };
      }

      // Format for database insertion - uses REAL IDs
      const dbActions = formatActionsForDatabaseInsert(
        actions,
        user.id,
        assessmentId,  // This is the real DB-generated ID
        organizationId // This is the real organization ID
      );

      // Insert actions into database
      const { data: insertedActions, error: insertError } = await supabase
        .from('improvement_actions')
        .insert(dbActions)
        .select('id');

      if (insertError) {
        console.error('[AutoActions] Insert error:', insertError);
        return { success: false, actionsGenerated: 0, error: insertError.message };
      }

      if (import.meta.env.DEV) {
        console.log(`[AutoActions] Successfully generated ${insertedActions?.length || 0} actions for assessment:`, assessmentId);
      }
      
      return { success: true, actionsGenerated: insertedActions?.length || 0 };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[AutoActions] Generation failed:', errorMessage);
      return { success: false, actionsGenerated: 0, error: errorMessage };
    }
  }, [user, checkExistingActions, getQuestionWeights]);

  return {
    generateActions,
    isEnabled: ENABLE_AUTO_ACTIONS
  };
}

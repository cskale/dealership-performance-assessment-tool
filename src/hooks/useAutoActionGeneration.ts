/**
 * useAutoActionGeneration Hook
 * 
 * Automatically generates actions when an assessment is completed.
 * Uses deterministic signal engine - same answers always produce same actions.
 * 
 * Includes idempotency check: if actions already exist for an assessment, 
 * no new actions are generated.
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
   */
  const checkExistingActions = useCallback(async (assessmentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { count, error } = await supabase
        .from('improvement_actions')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', assessmentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking existing actions:', error);
        return false;
      }

      return (count ?? 0) > 0;
    } catch (err) {
      console.error('Error checking existing actions:', err);
      return false;
    }
  }, [user]);

  /**
   * Generate and persist actions for a completed assessment
   * 
   * @param assessmentId - UUID of the completed assessment
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
      console.log('[AutoActions] Feature disabled via VITE_ENABLE_AUTO_ACTIONS');
      return { success: true, actionsGenerated: 0 };
    }

    if (!user) {
      return { success: false, actionsGenerated: 0, error: 'User not authenticated' };
    }

    try {
      // Idempotency check: don't regenerate if actions exist
      const hasExisting = await checkExistingActions(assessmentId);
      if (hasExisting) {
        console.log('[AutoActions] Actions already exist for assessment:', assessmentId);
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
        console.log('[AutoActions] No weak areas detected - no actions generated');
        return { success: true, actionsGenerated: 0 };
      }

      // Format for database insertion
      const dbActions = formatActionsForDatabaseInsert(
        actions,
        user.id,
        assessmentId,
        organizationId
      );

      // Insert actions into database
      const { error: insertError } = await supabase
        .from('improvement_actions')
        .insert(dbActions);

      if (insertError) {
        console.error('[AutoActions] Insert error:', insertError);
        return { success: false, actionsGenerated: 0, error: insertError.message };
      }

      console.log(`[AutoActions] Successfully generated ${actions.length} actions`);
      return { success: true, actionsGenerated: actions.length };

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

import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * TestRole Context
 * 
 * IMPORTANT PRODUCTION NOTE:
 * This context provides a UI-based role switcher for testing and consulting demos.
 * It does NOT replace actual authentication or server-side role enforcement.
 * 
 * For production security:
 * - Real role checks should use useUserRole() which queries Supabase user_roles table
 * - RLS policies on the database enforce actual data access controls
 * - This context is for UI filtering and demo purposes only
 * 
 * Usage: Only use for UI presentation layer decisions, NOT for security gates.
 */

export type TestRole = 'coach' | 'dealer';

interface RoleContextType {
  /**
   * Current test role for UI presentation.
   * WARNING: Do not use for security decisions. Use useUserRole() for actual auth.
   */
  testRole: TestRole;
  setTestRole: (role: TestRole) => void;
  /**
   * Selected dealer ID for filtering (used in coach view)
   */
  selectedDealerId: string | null;
  setSelectedDealerId: (id: string | null) => void;
  /**
   * Flag indicating this is UI-only role switching, not production auth
   */
  isTestMode: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

/**
 * RoleProvider - Provides UI-level role context for demo/testing
 * 
 * PRODUCTION NOTE: This is intentionally separate from actual auth.
 * Real permission enforcement happens at:
 * 1. Supabase RLS policies (database level)
 * 2. useUserRole() hook (queries actual role from user_roles table)
 * 3. Backend/edge function checks
 */
export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [testRole, setTestRole] = useState<TestRole>('dealer');
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);

  return (
    <RoleContext.Provider 
      value={{ 
        testRole, 
        setTestRole, 
        selectedDealerId, 
        setSelectedDealerId,
        isTestMode: true // Always true - indicates this is UI-only role switching
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

/**
 * useRoleContext - Access UI-level test role
 * 
 * WARNING: Only use for UI presentation decisions.
 * For actual permission checks, use useUserRole() hook.
 */
export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within RoleProvider');
  }
  return context;
};

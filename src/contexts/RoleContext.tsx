import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * TestRole Context
 * 
 * IMPORTANT: This is a DEV-ONLY UI role switcher for testing/demos.
 * In production, role comes from memberships.role enforced by RLS.
 */

export type TestRole = 'coach' | 'dealer';

interface RoleContextType {
  testRole: TestRole;
  setTestRole: (role: TestRole) => void;
  selectedDealerId: string | null;
  setSelectedDealerId: (id: string | null) => void;
  isTestMode: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const noopContext: RoleContextType = {
  testRole: 'dealer',
  setTestRole: () => {},
  selectedDealerId: null,
  setSelectedDealerId: () => {},
  isTestMode: false,
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [testRole, setTestRole] = useState<TestRole>('dealer');
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);

  // In production, provide a static no-op context
  if (!import.meta.env.DEV) {
    return (
      <RoleContext.Provider value={noopContext}>
        {children}
      </RoleContext.Provider>
    );
  }

  return (
    <RoleContext.Provider 
      value={{ 
        testRole, 
        setTestRole, 
        selectedDealerId, 
        setSelectedDealerId,
        isTestMode: true,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within RoleProvider');
  }
  return context;
};

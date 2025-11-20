import { createContext, useContext, useState, ReactNode } from 'react';

export type TestRole = 'coach' | 'dealer';

interface RoleContextType {
  testRole: TestRole;
  setTestRole: (role: TestRole) => void;
  selectedDealerId: string | null;
  setSelectedDealerId: (id: string | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [testRole, setTestRole] = useState<TestRole>('coach');
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);

  return (
    <RoleContext.Provider value={{ testRole, setTestRole, selectedDealerId, setSelectedDealerId }}>
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

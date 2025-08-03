export interface DealershipInfo {
  id?: string;
  name: string;
  brand: string;
  country: string;
  location: string;
  contactEmail?: string;
  phone?: string;
}

export interface AssessmentData {
  id?: string;
  dealershipId?: string;
  sessionId: string;
  answers: Record<string, any>;
  scores: Record<string, number>;
  overallScore?: number;
  status: 'in_progress' | 'completed' | 'archived';
  completedAt?: string;
}

export interface BenchmarkData {
  brand: string;
  country: string;
  segment: string;
  metricName: string;
  averageScore: number;
  percentile25?: number;
  percentile75?: number;
  sampleSize: number;
}

export interface ImprovementAction {
  id?: string;
  assessmentId?: string;
  department: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionTitle: string;
  actionDescription: string;
  expectedImpact?: string;
  estimatedEffort?: string;
}

export const AUTOMOTIVE_BRANDS = [
  'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Honda', 
  'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 
  'Subaru', 'Lexus', 'Acura', 'Infiniti', 'Volvo', 'Jaguar', 
  'Land Rover', 'Porsche', 'Ferrari', 'Lamborghini', 'Bentley',
  'Rolls-Royce', 'Tesla', 'Lucid', 'Rivian', 'Polestar',
  'Genesis', 'Cadillac', 'Lincoln', 'Buick', 'GMC', 'Jeep',
  'Ram', 'Chrysler', 'Dodge', 'Fiat', 'Alfa Romeo', 'Maserati',
  'Mitsubishi', 'Suzuki', 'Isuzu', 'Tata', 'Mahindra',
  'Maruti Suzuki', 'Other'
] as const;

export const COUNTRIES = [
  'Germany', 'United States', 'Japan', 'United Kingdom', 'France',
  'Italy', 'Spain', 'Canada', 'Australia', 'South Korea',
  'China', 'India', 'Brazil', 'Mexico', 'Russia', 'Netherlands',
  'Sweden', 'Norway', 'Switzerland', 'Austria', 'Belgium',
  'Denmark', 'Finland', 'Ireland', 'Portugal', 'Greece',
  'Turkey', 'Poland', 'Czech Republic', 'Hungary', 'Romania',
  'Bulgaria', 'Croatia', 'Slovenia', 'Slovakia', 'Lithuania',
  'Latvia', 'Estonia', 'Other'
] as const;
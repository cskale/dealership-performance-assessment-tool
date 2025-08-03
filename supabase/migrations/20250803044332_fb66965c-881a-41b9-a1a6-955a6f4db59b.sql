-- Create dealerships table for basic information
CREATE TABLE public.dealerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  country TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessments table for storing assessment results
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  scores JSONB NOT NULL DEFAULT '{}',
  overall_score DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benchmark data table for cross-brand comparisons
CREATE TABLE public.benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  country TEXT NOT NULL,
  segment TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  average_score DECIMAL(5,2) NOT NULL,
  percentile_25 DECIMAL(5,2),
  percentile_75 DECIMAL(5,2),
  sample_size INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create improvement actions table
CREATE TABLE public.improvement_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  action_title TEXT NOT NULL,
  action_description TEXT NOT NULL,
  expected_impact TEXT,
  estimated_effort TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.improvement_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public assessment tool)
CREATE POLICY "Dealerships are publicly accessible" 
ON public.dealerships 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Assessments are publicly accessible" 
ON public.assessments 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Benchmarks are publicly readable" 
ON public.benchmarks 
FOR SELECT 
USING (true);

CREATE POLICY "Improvement actions are publicly accessible" 
ON public.improvement_actions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_dealerships_updated_at
  BEFORE UPDATE ON public.dealerships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample benchmark data
INSERT INTO public.benchmarks (brand, country, segment, metric_name, average_score, percentile_25, percentile_75, sample_size) VALUES
('BMW', 'Germany', 'Luxury', 'new_vehicle_sales', 75.5, 68.2, 82.8, 45),
('Mercedes', 'Germany', 'Luxury', 'new_vehicle_sales', 78.2, 71.5, 85.0, 38),
('Audi', 'Germany', 'Luxury', 'new_vehicle_sales', 76.8, 69.8, 83.5, 42),
('VW', 'Germany', 'Mass Market', 'new_vehicle_sales', 72.3, 65.1, 79.5, 67),
('Toyota', 'Japan', 'Mass Market', 'new_vehicle_sales', 74.1, 67.2, 81.0, 89),
('Honda', 'Japan', 'Mass Market', 'new_vehicle_sales', 73.5, 66.8, 80.2, 78),
('BMW', 'Germany', 'Luxury', 'service_performance', 80.2, 73.5, 87.0, 45),
('Mercedes', 'Germany', 'Luxury', 'service_performance', 82.1, 75.8, 88.5, 38),
('Audi', 'Germany', 'Luxury', 'service_performance', 79.8, 72.9, 86.7, 42),
('VW', 'Germany', 'Mass Market', 'service_performance', 76.5, 69.8, 83.2, 67),
('BMW', 'Germany', 'Luxury', 'parts_inventory', 77.8, 70.5, 85.1, 45),
('Mercedes', 'Germany', 'Luxury', 'parts_inventory', 79.5, 72.8, 86.3, 38),
('Audi', 'Germany', 'Luxury', 'parts_inventory', 78.2, 71.2, 85.8, 42),
('VW', 'Germany', 'Mass Market', 'parts_inventory', 74.9, 68.1, 81.7, 67);

-- Create indexes for better performance
CREATE INDEX idx_assessments_dealership_id ON public.assessments(dealership_id);
CREATE INDEX idx_assessments_session_id ON public.assessments(session_id);
CREATE INDEX idx_benchmarks_brand_country ON public.benchmarks(brand, country);
CREATE INDEX idx_improvement_actions_assessment_id ON public.improvement_actions(assessment_id);
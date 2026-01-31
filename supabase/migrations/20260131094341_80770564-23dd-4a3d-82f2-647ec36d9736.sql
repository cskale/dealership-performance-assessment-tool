-- Create resources table for learning content
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'article', 'course', 'webinar', 'tool')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  topics TEXT[] NOT NULL DEFAULT '{}',
  related_kpis TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user saved resources table
CREATE TABLE public.user_saved_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_resources ENABLE ROW LEVEL SECURITY;

-- Resources are publicly readable
CREATE POLICY "Resources are publicly readable" ON public.resources
  FOR SELECT USING (true);

-- Users can view their own saved resources
CREATE POLICY "Users can view their saved resources" ON public.user_saved_resources
  FOR SELECT USING (auth.uid() = user_id);

-- Users can save resources
CREATE POLICY "Users can save resources" ON public.user_saved_resources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unsave resources
CREATE POLICY "Users can unsave resources" ON public.user_saved_resources
  FOR DELETE USING (auth.uid() = user_id);

-- Seed sample resource data
INSERT INTO public.resources (title, description, resource_type, url, thumbnail_url, duration, difficulty, topics, related_kpis, is_featured) VALUES
('Mastering the Customer Journey', 'Learn how to optimize every customer touchpoint for maximum satisfaction and retention', 'video', 'https://www.youtube.com/watch?v=example1', 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400', '15 min', 'intermediate', ARRAY['sales', 'customer-experience'], ARRAY['customer_satisfaction', 'service_retention'], true),
('Digital Service Management', 'Modern digital tools and strategies for efficient service department operations', 'course', 'https://example.com/course1', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', '2 hours', 'intermediate', ARRAY['service', 'digital'], ARRAY['labor_efficiency', 'technician_productivity'], true),
('Technician Productivity Best Practices', 'Scheduling and workflow optimization for service technicians', 'video', 'https://www.youtube.com/watch?v=example2', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', '20 min', 'beginner', ARRAY['service', 'efficiency'], ARRAY['technician_productivity'], false),
('Customer Experience Excellence Guide', 'Comprehensive guide to building customer loyalty and driving referrals', 'article', 'https://example.com/article1', 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400', '10 min read', 'beginner', ARRAY['customer-experience', 'sales'], ARRAY['customer_satisfaction', 'service_retention'], false),
('Parts Inventory Optimization', 'Data-driven approaches to managing parts inventory efficiently', 'webinar', 'https://example.com/webinar1', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400', '45 min', 'advanced', ARRAY['parts', 'inventory'], ARRAY['inventory_turnover', 'parts_margin'], true),
('Sales Performance Metrics Deep Dive', 'Understanding and improving key sales KPIs', 'video', 'https://www.youtube.com/watch?v=example3', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', '25 min', 'intermediate', ARRAY['sales', 'metrics'], ARRAY['conversion_rate', 'gross_profit'], false),
('Used Vehicle Appraisal Techniques', 'Modern approaches to accurate used car valuations', 'course', 'https://example.com/course2', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400', '1.5 hours', 'intermediate', ARRAY['used-vehicles', 'appraisal'], ARRAY['used_car_margin', 'days_in_stock'], false),
('F&I Product Presentation Mastery', 'Ethical and effective F&I product presentations', 'video', 'https://www.youtube.com/watch?v=example4', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', '30 min', 'advanced', ARRAY['finance', 'sales'], ARRAY['fi_penetration', 'backend_gross'], true);
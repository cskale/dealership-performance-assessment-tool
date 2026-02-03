-- Create dealer_contexts table for collecting dealership information
CREATE TABLE IF NOT EXISTS dealer_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Dealer profile
  brand_represented TEXT NOT NULL,
  brand_tier TEXT NOT NULL CHECK (brand_tier IN ('premium', 'volume', 'luxury')),
  market_type TEXT NOT NULL CHECK (market_type IN ('urban', 'suburban', 'rural')),
  
  -- Business metrics
  annual_unit_sales INTEGER NOT NULL CHECK (annual_unit_sales > 0),
  avg_gross_profit_per_unit DECIMAL(10,2),
  avg_monthly_leads INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One context per user
  CONSTRAINT unique_user_context UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE dealer_contexts ENABLE ROW LEVEL SECURITY;

-- Policies for user access
CREATE POLICY "Users can view own context"
  ON dealer_contexts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context"
  ON dealer_contexts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context"
  ON dealer_contexts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own context"
  ON dealer_contexts FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_dealer_contexts_user_id ON dealer_contexts(user_id);
CREATE INDEX idx_dealer_contexts_brand_tier ON dealer_contexts(brand_tier);
CREATE INDEX idx_dealer_contexts_market_type ON dealer_contexts(market_type);

-- Update timestamp trigger
CREATE TRIGGER update_dealer_contexts_updated_at
  BEFORE UPDATE ON dealer_contexts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
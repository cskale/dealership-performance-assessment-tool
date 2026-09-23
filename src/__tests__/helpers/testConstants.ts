// Stable UUIDs matching Supabase test user (test@dealerperformance.dev / TestUser123!)
export const TEST_USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
export const TEST_ORG_ID = 'aaaa1111-bbbb-cccc-dddd-eeee11111111';
export const TEST_DEALERSHIP_ID = 'dddd1111-eeee-ffff-0000-111122223333';
export const TEST_USER_EMAIL = 'test@dealerperformance.dev';

export const TEST_USER = {
  id: TEST_USER_ID,
  email: TEST_USER_EMAIL,
  full_name: 'Test User',
  actor_type: 'dealer' as const,
};

export const TEST_ORG = {
  id: TEST_ORG_ID,
  name: 'Test Dealership GmbH',
  slug: 'test-dealership-gmbh',
  business_model: '3s' as const,
};

export const TEST_DEALERSHIP = {
  id: TEST_DEALERSHIP_ID,
  name: 'Test Motors München',
  brand: 'BMW',
  country: 'Germany',
  location: 'Munich, Germany',
  organization_id: TEST_ORG_ID,
};

export const TEST_MEMBERSHIP = {
  user_id: TEST_USER_ID,
  organization_id: TEST_ORG_ID,
  role: 'owner' as const,
};

// Secondary test user for multi-user scenarios
export const TEST_USER_2_ID = 'b2c3d4e5-f6a7-8901-bcde-f23456789012';
export const TEST_USER_2_EMAIL = 'coach@dealerperformance.dev';

export const TEST_COACH = {
  id: TEST_USER_2_ID,
  email: TEST_USER_2_EMAIL,
  full_name: 'Test Coach',
  actor_type: 'coach' as const,
};

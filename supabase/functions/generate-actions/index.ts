import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://dealership-performance-assessment-t.vercel.app',
  'https://dealership-performance-assessment-tool.lovable.app',
  'https://dealership-performance-assessment-tool-cskales-projects.vercel.app',
  'https://775c0250-c831-4186-9520-28df4d940ca2.lovableproject.com',
  'http://localhost:8080',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

serve(async (req) => {
  const origin = req.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 50000) {
    return new Response(
      JSON.stringify({ error: 'Request payload too large' }),
      { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  let body: { assessmentId?: string; organizationId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { assessmentId, organizationId } = body;

  if (!assessmentId || !organizationId) {
    return new Response(
      JSON.stringify({ error: 'assessmentId and organizationId are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: recentCalls, error: rateError } = await supabaseAdmin
    .from('action_generation_log')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())

  if (rateError) {
    return new Response(JSON.stringify({ error: 'Rate limit check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  if (recentCalls && recentCalls.length >= 5) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Maximum 5 generations per hour.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  await supabaseAdmin.from('action_generation_log').insert({
    user_id: user.id,
    assessment_id: assessmentId,
    organization_id: organizationId,
  })

  return new Response(
    JSON.stringify({ success: true, allowed: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})

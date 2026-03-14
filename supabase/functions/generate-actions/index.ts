import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

  const { assessmentId, organizationId } = await req.json()

  // Server-side rate limit: max 5 generations per user per hour
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

  // Log this generation call
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

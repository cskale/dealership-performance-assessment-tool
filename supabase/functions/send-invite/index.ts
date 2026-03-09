import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { invited_email, dealership_id, organization_id, role } = await req.json()
    const normalizedEmail = invited_email?.toLowerCase()?.trim()

    if (!normalizedEmail || !dealership_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 255) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Verify caller has permission — server-side only
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organization_id)
      .eq('is_active', true)
      .single()

    if (!membership || !['owner', 'admin', 'manager'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Validate role is a valid membership_role
    const validRoles = ['owner', 'admin', 'manager', 'analyst', 'viewer']
    const inviteRole = role && validRoles.includes(role) ? role : 'viewer'

    // Check for existing pending invite (resend case)
    const { data: existingInvite } = await supabaseAdmin
      .from('dealership_invites')
      .select('id, token')
      .eq('dealership_id', dealership_id)
      .eq('invited_email', normalizedEmail)
      .eq('status', 'pending')
      .maybeSingle()

    let inviteToken: string

    if (existingInvite) {
      // Extend expiry, reuse token
      await supabaseAdmin
        .from('dealership_invites')
        .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
        .eq('id', existingInvite.id)
      inviteToken = existingInvite.token
    } else {
      const { data: newInvite, error: insertError } = await supabaseAdmin
        .from('dealership_invites')
        .insert({
          dealership_id,
          organization_id,
          invited_email: normalizedEmail,
          invited_by: user.id,
          membership_role: inviteRole,
        })
        .select('token')
        .single()

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      inviteToken = newInvite.token
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://dealership-performance-assessment-tool.lovable.app'
    const inviteUrl = `${siteUrl}/invite/${inviteToken}`

    return new Response(
      JSON.stringify({ success: true, invite_url: inviteUrl, email_sent: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

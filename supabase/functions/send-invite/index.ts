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

function buildInviteEmailHtml(dealershipName: string, inviterName: string, inviteUrl: string, role: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>You're invited to join ${dealershipName}</title></head><body style="margin:0;padding:0;background-color:#ffffff;font-family:'Roboto',Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background-color:#0052CC;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Dealership Performance Assessment</h1></td></tr><tr><td style="background-color:#f8f9fa;padding:40px;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;"><h2 style="margin:0 0 16px;color:#172B4D;font-size:20px;font-weight:600;">You've been invited!</h2><p style="margin:0 0 24px;color:#44546F;font-size:15px;line-height:1.6;"><strong>${inviterName}</strong> has invited you to join <strong>${dealershipName}</strong> as a <strong>${role}</strong>.</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background-color:#0052CC;border-radius:8px;"><a href="${inviteUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Accept Invitation</a></td></tr></table></td></tr><tr><td style="background-color:#f0f1f3;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;border:1px solid #e0e0e0;"><p style="margin:0;color:#8993A4;font-size:12px;">This invitation expires in 7 days. If you didn't expect this, ignore this email.</p></td></tr></table></td></tr></table></body></html>`
}

serve(async (req) => {
  const origin = req.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 50000) {
    return new Response(JSON.stringify({ error: 'Request payload too large' }), { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let body: { invited_email?: string; dealership_id?: string; organization_id?: string; role?: string };
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { invited_email, dealership_id, organization_id, role } = body;
    const normalizedEmail = invited_email?.toLowerCase()?.trim()

    if (!normalizedEmail || !dealership_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 255) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: membership } = await supabaseAdmin.from('memberships').select('role').eq('user_id', user.id).eq('organization_id', organization_id).eq('is_active', true).single()
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const validRoles = ['owner', 'admin', 'member', 'viewer']
    const inviteRole = role && validRoles.includes(role) ? role : 'viewer'

    const { data: existingInvite } = await supabaseAdmin.from('dealership_invites').select('id, token').eq('dealership_id', dealership_id).eq('invited_email', normalizedEmail).eq('status', 'pending').maybeSingle()

    let inviteToken: string
    if (existingInvite) {
      await supabaseAdmin.from('dealership_invites').update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }).eq('id', existingInvite.id)
      inviteToken = existingInvite.token
    } else {
      const { data: newInvite, error: insertError } = await supabaseAdmin.from('dealership_invites').insert({ dealership_id, organization_id, invited_email: normalizedEmail, invited_by: user.id, membership_role: inviteRole }).select('token').single()
      if (insertError) return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      inviteToken = newInvite.token
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://dealership-performance-assessment-tool.lovable.app'
    const inviteUrl = `${siteUrl}/invite/${inviteToken}`

    let emailSent = false
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      try {
        const [dealershipRes, profileRes] = await Promise.all([
          supabaseAdmin.from('dealerships').select('name').eq('id', dealership_id).single(),
          supabaseAdmin.from('profiles').select('display_name, full_name').eq('user_id', user.id).single(),
        ])
        const dealershipName = dealershipRes.data?.name || 'your dealership'
        const inviterName = profileRes.data?.display_name || profileRes.data?.full_name || user.email || 'A team member'
        const roleLabel = inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1)
        const resendRes = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'Dealership Assessment <invites@notify.performance-assessment.com>', to: [normalizedEmail], subject: `You're invited to join ${dealershipName}`, html: buildInviteEmailHtml(dealershipName, inviterName, inviteUrl, roleLabel) }) })
        if (resendRes.ok) emailSent = true
      } catch (e) { console.error('Email error:', e) }
    }

    return new Response(JSON.stringify({ success: true, invite_url: inviteUrl, email_sent: emailSent }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

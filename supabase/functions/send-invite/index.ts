import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function buildInviteEmailHtml(dealershipName: string, inviterName: string, inviteUrl: string, role: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${dealershipName}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Roboto',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0052CC;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;font-family:'Roboto',Arial,sans-serif;">
                Dealership Performance Assessment
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#f8f9fa;padding:40px;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;">
              <h2 style="margin:0 0 16px;color:#172B4D;font-size:20px;font-weight:600;font-family:'Roboto',Arial,sans-serif;">
                You've been invited!
              </h2>
              <p style="margin:0 0 24px;color:#44546F;font-size:15px;line-height:1.6;font-family:'Roboto',Arial,sans-serif;">
                <strong>${inviterName}</strong> has invited you to join <strong>${dealershipName}</strong> as a <strong>${role}</strong> on the Dealership Performance Assessment platform.
              </p>
              <p style="margin:0 0 32px;color:#44546F;font-size:15px;line-height:1.6;font-family:'Roboto',Arial,sans-serif;">
                Click the button below to accept the invitation and get started.
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#0052CC;border-radius:8px;">
                    <a href="${inviteUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;font-family:'Roboto',Arial,sans-serif;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f1f3;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;border-bottom:1px solid #e0e0e0;">
              <p style="margin:0 0 8px;color:#8993A4;font-size:13px;font-family:'Roboto',Arial,sans-serif;">
                This invitation expires in 7 days.
              </p>
              <p style="margin:0;color:#8993A4;font-size:12px;font-family:'Roboto',Arial,sans-serif;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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

    // Fetch dealership name and inviter profile for the email
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

        const emailHtml = buildInviteEmailHtml(dealershipName, inviterName, inviteUrl, roleLabel)

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Dealership Assessment <invites@notify.performance-assessment.com>',
            to: [normalizedEmail],
            subject: `You're invited to join ${dealershipName}`,
            html: emailHtml,
          }),
        })

        if (resendRes.ok) {
          emailSent = true
        } else {
          const errBody = await resendRes.text()
          console.error('Resend API error:', resendRes.status, errBody)
        }
      } catch (emailErr) {
        console.error('Failed to send email via Resend:', emailErr)
      }
    }

    return new Response(
      JSON.stringify({ success: true, invite_url: inviteUrl, email_sent: emailSent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

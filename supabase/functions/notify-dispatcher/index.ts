import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://dealership-performance-assessment-t.vercel.app',
  'https://dealership-performance-assessment-tool.lovable.app',
  'https://dealership-performance-assessment-tool-cskales-projects.vercel.app',
  'https://775c0250-c831-4186-9520-28df4d940ca2.lovableproject.com',
  'http://localhost:8080',
  'http://localhost:3000',
]

function getCorsHeaders(origin: string) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function buildNotificationEmailHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title></head><body style="margin:0;padding:0;background-color:#ffffff;font-family:'Inter',Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background-color:#1D7AFC;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Dealer Diagnostic Platform</h1></td></tr><tr><td style="background-color:#f8f9fa;padding:40px;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;"><h2 style="margin:0 0 12px;color:#172d4d;font-size:18px;font-weight:600;">${title}</h2><p style="margin:0 0 24px;color:#445166;font-size:14px;line-height:1.6;">${body}</p></td></tr><tr><td style="background-color:#f0f1f3;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;border:1px solid #e0e0e0;"><p style="margin:0;color:#8993A4;font-size:12px;">You are receiving this because you have notifications enabled. Manage preferences in Account Settings.</p></td></tr></table></td></tr></table></body></html>`
}

interface NotificationPayload {
  user_id: string
  organization_id: string
  type: string
  channel: 'in_app' | 'email'
  entity_type?: string
  entity_id?: string
  title: string
  body: string
  email_to?: string
}

serve(async (req) => {
  const origin = req.headers.get('Origin') || ''
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let payload: NotificationPayload
    try {
      payload = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { user_id, organization_id, type, channel, entity_type, entity_id, title, body, email_to } = payload

    if (!user_id || !organization_id || !type || !channel || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, organization_id, type, channel, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check preferences - skip if user has disabled this channel or type
    const { data: prefs } = await supabaseAdmin
      .from('notification_preferences')
      .select('email_enabled, in_app_enabled, stale_action_nudge, weekly_digest, milestone_alerts')
      .eq('user_id', user_id)
      .maybeSingle()

    if (prefs) {
      if (channel === 'email' && !prefs.email_enabled) {
        return new Response(JSON.stringify({ skipped: true, reason: 'email_disabled' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      if (channel === 'in_app' && !prefs.in_app_enabled) {
        return new Response(JSON.stringify({ skipped: true, reason: 'in_app_disabled' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      if (type === 'stale_action' && !prefs.stale_action_nudge) {
        return new Response(JSON.stringify({ skipped: true, reason: 'stale_action_nudge_disabled' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      if (type === 'digest' && !prefs.weekly_digest) {
        return new Response(JSON.stringify({ skipped: true, reason: 'weekly_digest_disabled' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      if (type === 'milestone' && !prefs.milestone_alerts) {
        return new Response(JSON.stringify({ skipped: true, reason: 'milestone_alerts_disabled' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    // Insert notification record
    const { data: notification, error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id,
        organization_id,
        type,
        channel,
        entity_type: entity_type ?? null,
        entity_id: entity_id ?? null,
        title,
        body,
        read: false,
        sent_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Notification insert failed:', insertError.message)
      return new Response(
        JSON.stringify({ error: 'Failed to store notification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email if requested
    let emailSent = false
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (channel === 'email' && email_to && resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Dealership Assessment <notifications@notify.performance-assessment.com>',
            to: [email_to],
            subject: title,
            html: buildNotificationEmailHtml(title, body),
          }),
        })
        if (resendRes.ok) emailSent = true
        else console.error('Resend error:', await resendRes.text())
      } catch (e) {
        console.error('Email send error:', e)
      }
    }

    return new Response(
      JSON.stringify({ success: true, notification_id: notification.id, email_sent: emailSent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notify-dispatcher error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

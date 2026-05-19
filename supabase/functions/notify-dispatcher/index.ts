import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import React from 'https://esm.sh/react@18'
import { render } from 'https://esm.sh/@react-email/render@0.0.10'
import { StaleActionEmail } from '../_templates/StaleActionEmail.tsx'
import { WeeklyDigestEmail } from '../_templates/WeeklyDigestEmail.tsx'
import type { DigestAction } from '../_templates/WeeklyDigestEmail.tsx'
import { MilestoneEmail } from '../_templates/MilestoneEmail.tsx'
import { CoachCommentEmail } from '../_templates/CoachCommentEmail.tsx'

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
        let emailHtml: string
        const siteUrl = Deno.env.get('SITE_URL') || 'https://dealership-performance-assessment-tool.lovable.app'
        const actionsUrl = `${siteUrl}/app/actions`

        if (type === 'digest') {
          try {
            const digestData = JSON.parse(body) as {
              open_count: number
              overdue_count: number
              top_actions: DigestAction[]
            }
            emailHtml = render(React.createElement(WeeklyDigestEmail, {
              openCount: digestData.open_count,
              overdueCount: digestData.overdue_count,
              topActions: digestData.top_actions,
              actionsUrl,
            }))
          } catch {
            emailHtml = render(React.createElement(StaleActionEmail, {
              actionTitle: title,
              priority: 'medium',
              daysStale: 0,
              actionsUrl,
            }))
          }
        } else if (type === 'stale_action') {
          const daysMatch = body.match(/(\d+) day/)
          const daysStale = daysMatch ? parseInt(daysMatch[1]) : 1
          const priorityMatch = body.match(/Priority: (\w+)/)
          const priority = (priorityMatch?.[1]?.toLowerCase() ?? 'medium') as 'critical' | 'high' | 'medium' | 'low'
          emailHtml = render(React.createElement(StaleActionEmail, {
            actionTitle: title.replace('Action overdue: ', ''),
            priority,
            daysStale,
            actionsUrl,
          }))
        } else if (type === 'milestone') {
          const percentMatch = body.match(/(\d+)%/)
          const milestonePercent = (percentMatch ? parseInt(percentMatch[1]) : 25) as 25 | 50 | 75 | 100
          const countMatch = body.match(/(\d+) of (\d+)/)
          emailHtml = render(React.createElement(MilestoneEmail, {
            milestonePercent,
            completedCount: countMatch ? parseInt(countMatch[1]) : 0,
            totalCount: countMatch ? parseInt(countMatch[2]) : 0,
            actionsUrl,
            reassessUrl: milestonePercent === 100 ? `${siteUrl}/app/assessment` : undefined,
          }))
        } else if (type === 'coach_comment') {
          emailHtml = render(React.createElement(CoachCommentEmail, {
            coachName: 'Your coach',
            notePreview: body,
            dealershipName: 'your dealership',
            dashboardUrl: `${siteUrl}/app/dashboard#coach-notes`,
          }))
        } else {
          emailHtml = render(React.createElement(StaleActionEmail, {
            actionTitle: title,
            priority: 'medium',
            daysStale: 0,
            actionsUrl,
          }))
        }

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
            html: emailHtml,
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

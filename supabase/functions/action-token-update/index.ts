// supabase/functions/action-token-update/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VALID_STATUSES = ['In Progress', 'Completed'] as const
type ValidStatus = typeof VALID_STATUSES[number]

const STATUS_LABEL_MAP: Record<string, ValidStatus> = {
  'in_progress': 'In Progress',
  'completed':   'Completed',
}

// ── HMAC helpers (Web Crypto API — available in Deno) ───────────────────────

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function verifyToken(
  token: string,
  secret: string
): Promise<{ action_id: string; user_id: string; status: string; exp: number } | null> {
  try {
    const decoded = JSON.parse(atob(token))
    const { sig, ...payload } = decoded
    if (!sig) return null

    const key = await importHmacKey(secret)
    const data = new TextEncoder().encode(JSON.stringify(payload))
    const expectedSig = await crypto.subtle.sign('HMAC', key, data)
    const expectedSigB64 = btoa(String.fromCharCode(...new Uint8Array(expectedSig)))

    if (sig !== expectedSigB64) return null
    return payload
  } catch {
    return null
  }
}

// ── HTML response helpers ───────────────────────────────────────────────────

function htmlPage(title: string, body: string, isError = false): Response {
  const color = isError ? '#dc2626' : '#16a34a'
  const siteUrl = Deno.env.get('SITE_URL') ?? ''
  const html = `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb}.card{max-width:480px;padding:40px;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center}h1{color:${color};font-size:22px;margin:0 0 12px}p{color:#44546f;font-size:15px;line-height:1.6;margin:0 0 24px}a{display:inline-block;padding:12px 28px;background:#1D7AFC;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}</style>
</head>
<body><div class="card">
<h1>${title}</h1><p>${body}</p>
<a href="${siteUrl}/app/actions">View Action Plan</a>
</div></body></html>`
  return new Response(html, {
    status: isError ? 400 : 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// ── Main handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method !== 'GET') {
    return htmlPage('Invalid request', 'This link only supports GET requests.', true)
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const rawStatus = url.searchParams.get('status')

  if (!token || !rawStatus) {
    return htmlPage('Invalid link', 'This link is missing required parameters. Please use the link from your notification email.', true)
  }

  const newStatus = STATUS_LABEL_MAP[rawStatus]
  if (!newStatus) {
    return htmlPage('Invalid status', `"${rawStatus}" is not a valid status.`, true)
  }

  const secret = Deno.env.get('SUPABASE_JWT_SECRET')
  if (!secret) {
    console.error('SUPABASE_JWT_SECRET not set')
    return htmlPage('Server error', 'Configuration error. Please contact support.', true)
  }

  const payload = await verifyToken(token, secret)
  if (!payload) {
    return htmlPage('Invalid link', 'This link is invalid or has been tampered with.', true)
  }

  if (Date.now() / 1000 > payload.exp) {
    return htmlPage('Link expired', 'This link expired 72 hours after it was sent. Log in to update your action plan directly.', true)
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: action, error: fetchError } = await supabaseAdmin
    .from('improvement_actions')
    .select('id, status, token_nonce, token_expires_at')
    .eq('id', payload.action_id)
    .maybeSingle()

  if (fetchError || !action) {
    return htmlPage('Action not found', 'This action no longer exists.', true)
  }

  if (!action.token_nonce) {
    return htmlPage('Link already used', 'This link has already been used. Log in to view current status.', true)
  }

  if (action.status === newStatus) {
    await supabaseAdmin
      .from('improvement_actions')
      .update({ token_nonce: null, token_expires_at: null })
      .eq('id', payload.action_id)
    return htmlPage(
      'Already up to date',
      `This action is already marked as "${newStatus}". No changes made.`
    )
  }

  const { error: updateError } = await supabaseAdmin
    .from('improvement_actions')
    .update({
      status: newStatus,
      token_nonce: null,
      token_expires_at: null,
      last_status_updated_at: new Date().toISOString(),
    })
    .eq('id', payload.action_id)
    .eq('token_nonce', action.token_nonce)

  if (updateError) {
    console.error('Status update failed:', updateError.message)
    return htmlPage('Update failed', 'Something went wrong updating your action. Please log in and update manually.', true)
  }

  return htmlPage(
    `Action marked ${newStatus}`,
    `Your action has been updated to "${newStatus}". You can view your full action plan by clicking below.`
  )
})

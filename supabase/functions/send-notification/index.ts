import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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

interface NotificationPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: missing RESEND_API_KEY' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  let payload: NotificationPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Malformed request: body must be valid JSON' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const { to, subject, html, text } = payload;
  if (!to || !subject || !html) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const resendBody: Record<string, unknown> = {
    from: 'Dealership Tool <onboarding@resend.dev>',
    to,
    subject,
    html,
  };
  if (text) resendBody.text = text;

  let resendRes: Response;
  try {
    resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendBody),
    });
  } catch (err) {
    console.error('Network error calling Resend:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to reach Resend API', detail: String(err) }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const resendData = await resendRes.json();

  if (!resendRes.ok) {
    console.error('Resend API error:', resendRes.status, resendData);
    return new Response(
      JSON.stringify({ error: 'Resend API error', detail: resendData }),
      { status: resendRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ success: true, data: resendData }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});

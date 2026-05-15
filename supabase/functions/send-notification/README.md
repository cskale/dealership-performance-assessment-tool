# send-notification

Standalone Edge Function. Sends transactional email via [Resend](https://resend.com).

## Payload

`POST /functions/v1/send-notification`

```json
{
  "to": "recipient@example.com",
  "subject": "Your subject line",
  "html": "<p>HTML body</p>",
  "text": "Plain text fallback (optional)"
}
```

All fields except `text` are required.

Sender is fixed to `onboarding@resend.dev` until a custom domain is verified in Resend.

## Set the secret

```bash
supabase secrets set RESEND_API_KEY=re_xxxx
```

Verify it is set:

```bash
supabase secrets list
```

## Deploy

```bash
supabase functions deploy send-notification
```

## Test with curl

Local (after `supabase start`):

```bash
curl -i -X POST http://localhost:54321/functions/v1/send-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon-key>" \
  -d '{
    "to": "test@example.com",
    "subject": "Test email",
    "html": "<p>Hello from the Edge Function</p>"
  }'
```

Production:

```bash
curl -i -X POST https://xrypgosuyfdkkqafftae.supabase.co/functions/v1/send-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon-key>" \
  -d '{
    "to": "test@example.com",
    "subject": "Test email",
    "html": "<p>Hello from the Edge Function</p>"
  }'
```

## Error responses

| Status | Meaning |
|--------|---------|
| 400 | Missing/invalid payload fields |
| 405 | Non-POST request |
| 500 | `RESEND_API_KEY` not configured |
| 502 | Network failure reaching Resend |
| 4xx/5xx from Resend | Forwarded with Resend's error body |

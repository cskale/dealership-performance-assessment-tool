

## Fix: Remove iframe-blocking security headers

The previous edit attempt did not persist. Both `vercel.json` and `netlify.toml` still contain the original blocking values.

### Changes

**File 1: `vercel.json` (line 7-8)**
- CSP: change `frame-ancestors 'none'` to `frame-ancestors 'self' https://*.lovableproject.com https://*.lovable.app`
- X-Frame-Options: change `DENY` to `SAMEORIGIN`

**File 2: `netlify.toml` (line 4-5)**
- CSP: change `frame-ancestors 'none'` to `frame-ancestors 'self' https://*.lovableproject.com https://*.lovable.app`
- X-Frame-Options: change `DENY` to `SAMEORIGIN`

No other files affected. These are deployment config files only.


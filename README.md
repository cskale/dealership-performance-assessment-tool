# Enterprise Dealership Assessment Platform

A comprehensive, enterprise-grade dealership performance assessment platform with advanced authentication, multi-tenancy, and GDPR compliance features.

## 🚀 Features

### Assessment Engine
- **61-question assessment** across 5 modules (NVS, UVS, SVC, PTS, FIN) with weighted scoring
- **Question-driven signal architecture** — adding questions requires zero engine changes; each question carries `primarySignalCode`, `secondarySignalCode`, `rootCauseDimension` directly
- **Three-tier signal resolution**: question metadata → SIGNAL_MAPPINGS lookup → category-based derivation
- **OEM network leaderboard** — cross-dealership benchmarking with programme tier tracking
- **Coach portal** — assigned dealer dashboards and cross-dealer action tracking
- **PDF + Excel export** of assessment results and action plans

### Known Issues (non-blocking)
- `action_audit_log` direct REST call returns 403 — inserts should be trigger-only
- ActionSheet PATCH URL encoding bug — `new_value` serialised as query param instead of body
- `DialogContent` missing `DialogTitle` — accessibility warnings in dev (non-breaking)

### Architecture Notes
- **RLS policy rule**: any policy joining `dealer_network_memberships` inside a `dealerships` or `assessments` policy must use a `SECURITY DEFINER` function — direct joins cause infinite recursion
- **File ownership**: `src/data/questionnaire.ts`, `signalTypes.ts`, `signalMappings.ts`, `signalEngine.ts` are Claude Code owned — do not edit via Lovable

### Authentication & Security
- **Multiple Sign-in Methods**: Email/password, magic links, Google OAuth, Apple Sign In, Facebook Login
- **Enterprise Session Management**: Track and manage active sessions across devices
- **Multi-Factor Authentication**: Ready for 2FA implementation
- **Secure Callback Handling**: Single callback route handles all OAuth flows with proper redirects

### Multi-Tenancy & RBAC
- **Role-Based Access Control**: Five permission levels (owner, admin, manager, analyst, viewer)
- **Organization Management**: Auto-created organizations on first login
- **Scoped Data Access**: All data properly scoped to active organization
- **Organization Switching**: Seamless switching between organizations

### GDPR Compliance
- **Data Export**: Complete JSON export of user data
- **Account Deletion**: Two-step confirmation with cascade delete
- **Consent Management**: Granular consent toggles for analytics and marketing
- **Privacy by Design**: Default OFF for all tracking consent

### Account Center
- **Profile Management**: Editable display name, email verification status
- **Security Dashboard**: Active session monitoring with device details
- **Privacy Controls**: Consent management and data export/deletion

## 🛠 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Environment Configuration

Create a Supabase project and configure the following in your Supabase dashboard:

#### Required Supabase Settings

1. **Authentication Configuration**
   - Enable Email authentication
   - Configure OAuth providers (see sections below)
   - Set Site URL and Redirect URLs in Authentication > URL Configuration

2. **Site URL**: `https://your-domain.com` (or your preview/local URL)
3. **Redirect URLs**: Add all URLs where users can be redirected after authentication

### OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: Your site URLs
   - **Authorized redirect URIs**: `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Add Client ID and Secret to Supabase Auth > Providers > Google

#### Apple Sign In
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a Services ID for Sign in with Apple
3. Configure domains and redirect URLs
4. Generate a private key for Apple Sign In
5. Add configuration to Supabase Auth > Providers > Apple

#### Facebook Login
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing
3. Add Facebook Login product
4. Configure Valid OAuth Redirect URIs: `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Add App ID and Secret to Supabase Auth > Providers > Facebook

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch

# Run with coverage report
npm run test:coverage
```

The test suite covers authentication flows, multi-tenant functionality, GDPR compliance, and accessibility standards.

## 📝 License

MIT License - see LICENSE file for details.
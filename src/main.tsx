import './instrument';
import '@/lib/i18n';
import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<p style={{padding:'2rem',textAlign:'center'}}>Something went wrong. Please refresh the page.</p>}>
    <App />
  </Sentry.ErrorBoundary>
);

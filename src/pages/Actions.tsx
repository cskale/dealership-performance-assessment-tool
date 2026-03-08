import { Navigate } from 'react-router-dom';

/**
 * Legacy Actions page - now redirects to the unified Action Plan
 * in the Results page. All action management is consolidated there.
 */
export default function Actions() {
  return <Navigate to="/app/results?tab=action-plan" replace />;
}

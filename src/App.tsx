import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLanding } from './views/AuthLanding';
import { AuthForm } from './views/AuthForm';
import { OnboardingFlow } from './views/OnboardingFlow';
import { MainShell } from './views/MainShell';
import { useAuthSession } from './supabase/AuthSessionProvider';

export default function App() {
  const { session, onboardingComplete } = useAuthSession();

  return (
    <Routes>
      {!session && (
        <>
          <Route path="/" element={<AuthLanding />} />
          <Route path="/auth/:mode" element={<AuthForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
      {session && !onboardingComplete && (
        <>
          <Route path="/onboarding/*" element={<OnboardingFlow />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </>
      )}
      {session && onboardingComplete && (
        <>
          <Route path="/*" element={<MainShell />} />
        </>
      )}
    </Routes>
  );
}

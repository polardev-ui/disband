import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function LogoutView() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    };
    run();
  }, [navigate]);

  return (
    <div className="view view-animated">
      <h1 className="view-title">Logging out…</h1>
      <p className="view-subtitle">Closing your session safely.</p>
    </div>
  );
}

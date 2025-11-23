import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './onboarding.css';

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUsernameNext = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setError('Username is taken');
      } else {
        setStep(1);
      }
    } catch (err: any) {
      setError(err.message ?? 'Could not check username');
    } finally {
      setLoading(false);
    }
  };

  const finishOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      let avatarUrl: string | null = null;
      if (avatarFile) {
        const filePath = `${session.user.id}/${Date.now()}-${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        username,
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        onboarding_complete: true,
      });
      if (error) throw error;

      window.location.href = '/';
    } catch (err: any) {
      setError(err.message ?? 'Could not finish onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {step === 0 && (
          <>
            <h2>Choose your @username</h2>
            <p>This is how friends will find you.</p>
            <input
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase())}
              placeholder="@aethera"
            />
            {error && <p className="error-text">{error}</p>}
            <button onClick={handleUsernameNext} disabled={!username || loading} className="btn primary fill">
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Display name</h2>
            <p>What should we call you?</p>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Aethera"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!displayName}
              className="btn primary fill"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Profile picture</h2>
            <p>Optional, you can change this later.</p>
            <input
              type="file"
              accept="image/*"
              onChange={e => setAvatarFile(e.target.files?.[0] ?? null)}
            />
            <button onClick={() => setStep(3)} className="btn primary fill">
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Bio</h2>
            <p>Tell others a bit about you (optional).</p>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Dreaming among the stars."
            />
            {error && <p className="error-text">{error}</p>}
            <button
              onClick={finishOnboarding}
              disabled={loading || !username || !displayName}
              className="btn primary fill"
            >
              {loading ? 'Preparing your space…' : 'Finish'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

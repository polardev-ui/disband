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
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      setError('Pick a username first');
      return;
    }
    setUsername(trimmed);
    setError(null);
    setStep(1);
  };

  const finishOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('No active session – please log in again.');

      let avatarUrl: string | null = null;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);

        const response = await fetch('https://api.wsgpolar.me/v1/images', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload avatar');
        }

        const payload = (await response.json()) as { url?: string; success?: boolean; message?: string };
        if (!payload.url) {
          throw new Error(payload.message || 'Image API did not return a URL');
        }
        avatarUrl = payload.url;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        username,
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        onboarding_complete: true,
      });
      if (error) {
        // Handle unique username collisions gracefully.
        if ((error as any).code === '23505') {
          setStep(0);
          setError('That username is already taken. Try another one.');
          return;
        }
        throw error;
      }
      // Let AuthSessionProvider pick up the updated onboarding flag via auth state.
      await supabase.auth.refreshSession();
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
          <div className="onboarding-step fade-in">
            <h2>Choose your @username</h2>
            <p>This is how friends will find you.</p>
            <div className="field-group">
              <label className="field-label">Username</label>
              <div className="field-shell">
                <span className="field-prefix">@</span>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  placeholder="aethera"
                />
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button onClick={handleUsernameNext} disabled={!username || loading} className="btn primary fill">
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding-step fade-in">
            <h2>Display name</h2>
            <p>What should we call you?</p>
            <div className="field-group">
              <label className="field-label">Display name</label>
              <div className="field-shell">
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Aethera"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!displayName}
              className="btn primary fill"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step fade-in">
            <h2>Profile picture</h2>
            <p>Optional, you can change this later.</p>
            <label className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={e => setAvatarFile(e.target.files?.[0] ?? null)}
              />
              <span>{avatarFile ? avatarFile.name : 'Tap to choose an image'}</span>
            </label>
            <button onClick={() => setStep(3)} className="btn primary fill">
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step fade-in">
            <h2>Bio</h2>
            <p>Tell others a bit about you (optional).</p>
            <div className="field-group">
              <label className="field-label">Bio</label>
              <div className="field-shell textarea-shell">
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Dreaming among the stars."
                />
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button
              onClick={finishOnboarding}
              disabled={loading || !username || !displayName}
              className="btn primary fill"
            >
              {loading ? 'Preparing your space…' : 'Finish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuthSession } from '../supabase/AuthSessionProvider';

interface ProfileRow {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export function ProfileView() {
  const { session } = useAuthSession();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();
      setProfile((data as ProfileRow) || null);
    };
    load();
  }, [session]);

  return (
    <div className="view view-animated">
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Profile</h1>
          <p className="view-subtitle">You, across Disband.</p>
        </div>
        <button
          type="button"
          className="btn secondary small settings-button"
          onClick={() => setShowSettings(s => !s)}
        >
          Settings
        </button>
      </div>

      {!profile ? (
        <p className="view-hint">Loading profile…</p>
      ) : (
        <>
          <div className="profile-card fade-in">
            <div className="profile-header">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || ''}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar fallback" />
              )}
              <div className="profile-main">
                <div className="profile-name">
                  {profile.display_name || profile.username || 'User'}
                </div>
                {profile.username && (
                  <div className="profile-handle">@{profile.username}</div>
                )}
              </div>
            </div>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          </div>

          {showSettings && (
            <div className="profile-card fade-in settings-panel">
              <h2 className="section-title">Settings</h2>
              <h3 className="section-subtitle">Profile</h3>
              <p className="view-hint">Profile editing will come here – name, avatar, bio.</p>
              <h3 className="section-subtitle">App</h3>
              <p className="view-hint">Theme, motion, and notification controls will live here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

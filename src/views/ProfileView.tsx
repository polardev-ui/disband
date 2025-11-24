import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const [serverCount, setServerCount] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();
      setProfile((data as ProfileRow) || null);

      const { count: friends } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`);
      setFriendCount(friends ?? null);

      const { count: servers } = await supabase
        .from('server_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      setServerCount(servers ?? null);
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
        <div className="profile-header-actions">
            <button
              type="button"
              className="btn secondary small"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
            >
              Log out
            </button>
          <button
            type="button"
            className="btn secondary small"
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
        </div>
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
            <div className="profile-stats-row">
              {friendCount !== null && (
                <div className="profile-stat">
                  <div className="profile-stat-number">{friendCount}</div>
                  <div className="profile-stat-label">Friends</div>
                </div>
              )}
              {serverCount !== null && (
                <div className="profile-stat">
                  <div className="profile-stat-number">{serverCount}</div>
                  <div className="profile-stat-label">Servers</div>
                </div>
              )}
            </div>
            <div className="profile-actions-row">
              <button type="button" className="btn primary small">
                Customize
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

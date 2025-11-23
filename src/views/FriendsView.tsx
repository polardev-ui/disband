import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuthSession } from '../supabase/AuthSessionProvider';

interface FriendRow {
  id: string;
  display_name: string | null;
  username: string | null;
}

interface RequestRow {
  id: string;
  from_user: string;
  to_user: string;
  status: string;
  from_profile?: { display_name: string | null; username: string | null };
}

export function FriendsView() {
  const { session } = useAuthSession();
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [incoming, setIncoming] = useState<RequestRow[]>([]);
  const [outgoing, setOutgoing] = useState<RequestRow[]>([]);
  const [usernameQuery, setUsernameQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const load = async () => {
      // load friends
      const { data: friendsData } = await supabase.rpc('get_user_friends', {
        p_user_id: session.user.id,
      });
      setFriends((friendsData as FriendRow[]) || []);

      // incoming and outgoing requests
      const { data: incomingData } = await supabase.rpc(
        'get_incoming_friend_requests',
        { p_user_id: session.user.id },
      );
      setIncoming((incomingData as RequestRow[]) || []);

      const { data: outgoingData } = await supabase.rpc(
        'get_outgoing_friend_requests',
        { p_user_id: session.user.id },
      );
      setOutgoing((outgoingData as RequestRow[]) || []);
    };

    load();
  }, [session]);

  const handleAddFriend = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!session || !usernameQuery.trim()) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', usernameQuery.trim().toLowerCase())
      .maybeSingle();

    if (!profile) {
      setMessage('No user with that username');
      return;
    }

    const { error } = await supabase.from('friend_requests').insert({
      from_user: session.user.id,
      to_user: profile.id,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Friend request sent');
      setUsernameQuery('');
    }
  };

  const handleRespond = async (id: string, accept: boolean) => {
    if (!session) return;
    const status = accept ? 'accepted' : 'declined';
    const { error } = await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', id);
    if (!error && accept) {
      // On accept, backend trigger should create friendship; for now
      // you can also manually insert if you prefer.
    }
  };

  return (
    <div className="view view-animated">
      <h1 className="view-title">Friends</h1>
      <p className="view-subtitle">Add friends and manage requests.</p>

      <form className="field-group" onSubmit={handleAddFriend}>
        <label className="field-label">Add friend by username</label>
        <div className="field-shell">
          <span className="field-prefix">@</span>
          <input
            value={usernameQuery}
            onChange={e => setUsernameQuery(e.target.value)}
            placeholder="friendname"
          />
        </div>
        <button type="submit" className="btn primary fill" disabled={!usernameQuery.trim()}>
          Send request
        </button>
        {message && <p className="view-hint">{message}</p>}
      </form>

      <h2 className="section-title">Friends</h2>
      {friends.length === 0 ? (
        <p className="view-hint">No friends yet.</p>
      ) : (
        <div className="card-list">
          {friends.map(f => (
            <div key={f.id} className="card-item fade-in">
              <div className="card-main">
                <div className="card-title">{f.display_name || f.username}</div>
                {f.username && <div className="card-body">@{f.username}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Pending</h2>
      {incoming.length === 0 && outgoing.length === 0 ? (
        <p className="view-hint">No pending requests.</p>
      ) : (
        <>
          {incoming.length > 0 && (
            <>
              <h3 className="section-subtitle">Incoming</h3>
              <div className="card-list">
                {incoming.map(r => (
                  <div key={r.id} className="card-item fade-in">
                    <div className="card-main">
                      <div className="card-title">
                        {r.from_profile?.display_name || r.from_profile?.username || 'User'}
                      </div>
                    </div>
                    <div className="card-meta card-actions">
                      <button
                        className="btn secondary small"
                        onClick={() => handleRespond(r.id, false)}
                      >
                        Decline
                      </button>
                      <button
                        className="btn primary small"
                        onClick={() => handleRespond(r.id, true)}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {outgoing.length > 0 && (
            <>
              <h3 className="section-subtitle">Outgoing</h3>
              <div className="card-list">
                {outgoing.map(r => (
                  <div key={r.id} className="card-item fade-in">
                    <div className="card-main">
                      <div className="card-title">Request sent</div>
                    </div>
                    <div className="card-meta">Pending</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

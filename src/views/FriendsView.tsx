import { FormEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuthSession } from '../supabase/AuthSessionProvider';

interface FriendRow {
  id: string;
  display_name: string | null;
  username: string | null;
}

interface IncomingRequestRow {
  id: string;
  from_user: string;
  to_user: string;
  status: string;
  from_profile_display_name: string | null;
  from_profile_username: string | null;
}

interface OutgoingRequestRow {
  id: string;
  from_user: string;
  to_user: string;
  status: string;
}

export function FriendsView() {
  const { session } = useAuthSession();
  const location = useLocation();
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [incoming, setIncoming] = useState<IncomingRequestRow[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingRequestRow[]>([]);
  const [usernameQuery, setUsernameQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [startDmMode, setStartDmMode] = useState(false);

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
      setIncoming((incomingData as IncomingRequestRow[]) || []);

      const { data: outgoingData } = await supabase.rpc(
        'get_outgoing_friend_requests',
        { p_user_id: session.user.id },
      );
      setOutgoing((outgoingData as OutgoingRequestRow[]) || []);
    };

    load();
  }, [session]);

  useEffect(() => {
    if ((location.state as any)?.startDm) {
      setStartDmMode(true);
    }
  }, [location.state]);

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

  const handleStartDmWith = async (friendId: string) => {
    if (!session) return;

    // For now, create a new DM thread with the chosen friend if one doesn't exist.
    const { data: existing } = await supabase
      .from('dm_threads')
      .select('id, dm_participants!inner(user_id)')
      .eq('dm_participants.user_id', session.user.id)
      .eq('dm_participants.user_id', friendId)
      .maybeSingle();

    let threadId = (existing as any)?.id as string | undefined;

    if (!threadId) {
      const { data, error } = await supabase
        .from('dm_threads')
        .insert({})
        .select('id')
        .maybeSingle();
      if (error || !data) return;
      threadId = data.id;

      await supabase.from('dm_participants').insert([
        { thread_id: threadId, user_id: session.user.id },
        { thread_id: threadId, user_id: friendId },
      ]);
    }

    // A future DM view could navigate to `/dm/${threadId}`.
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
      <p className="view-subtitle">
        {startDmMode ? 'Pick a friend to start a DM.' : 'Add friends and manage requests.'}
      </p>

      {!startDmMode && (
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
        <button
          type="submit"
          className="btn primary fill friend-submit"
          disabled={!usernameQuery.trim()}
        >
          Send request
        </button>
          {message && <p className="view-hint">{message}</p>}
        </form>
      )}

      <h2 className="section-title">Friends</h2>
      {friends.length === 0 ? (
        <p className="view-hint">No friends yet.</p>
      ) : (
        <div className="card-list">
          {friends.map(f => (
            <button
              key={f.id}
              className="card-item fade-in friend-row-button"
              type="button"
              onClick={startDmMode ? () => handleStartDmWith(f.id) : undefined}
            >
              <div className="card-main">
                <div className="card-title">{f.display_name || f.username}</div>
                {f.username && <div className="card-body">@{f.username}</div>}
              </div>
            </button>
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
                        {r.from_profile_display_name || r.from_profile_username || 'User'}
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

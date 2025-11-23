import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuthSession } from '../supabase/AuthSessionProvider';

interface SimpleThread {
  id: string;
  otherDisplayName: string;
  lastMessage: string | null;
  lastTimestamp: string | null;
}

export function HomeView() {
  const { session } = useAuthSession();
  const [threads, setThreads] = useState<SimpleThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_dm_threads', {
        p_user_id: session.user.id,
      });
      if (!error && data) {
        setThreads(data as SimpleThread[]);
      }
      setLoading(false);
    };

    load();
  }, [session]);

  return (
    <div className="view view-animated">
      <h1 className="view-title">Home</h1>
      <p className="view-subtitle">Your recent conversations and servers.</p>

      {loading ? (
        <p className="view-hint">Loading chats…</p>
      ) : threads.length === 0 ? (
        <p className="view-hint">No direct messages yet. Add a friend to start chatting.</p>
      ) : (
        <div className="card-list">
          {threads.map(t => (
            <div key={t.id} className="card-item fade-in">
              <div className="card-main">
                <div className="card-title">{t.otherDisplayName}</div>
                {t.lastMessage && <div className="card-body">{t.lastMessage}</div>}
              </div>
              {t.lastTimestamp && (
                <div className="card-meta">{new Date(t.lastTimestamp).toLocaleTimeString()}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

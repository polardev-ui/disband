import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuthSession } from '../supabase/AuthSessionProvider';

interface SimpleThread {
  id: string;
  other_display_name: string;
  last_message: string | null;
  last_timestamp: string | null;
}

export function HomeView() {
  const { session } = useAuthSession();
  const [threads, setThreads] = useState<SimpleThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverName, setServerName] = useState('');
  const [serverDescription, setServerDescription] = useState('');
  const [serverMessage, setServerMessage] = useState<string | null>(null);

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

  const handleCreateServer = async (e: FormEvent) => {
    e.preventDefault();
    setServerMessage(null);
    if (!session || !serverName.trim()) return;

    const { data, error } = await supabase
      .from('servers')
      .insert({
        owner_id: session.user.id,
        name: serverName.trim(),
        description: serverDescription.trim() || null,
      })
      .select('id')
      .maybeSingle();

    if (error || !data) {
      setServerMessage(error?.message ?? 'Could not create server');
      return;
    }

    await supabase.from('server_members').insert({
      server_id: data.id,
      user_id: session.user.id,
      role: 'owner',
    });

    setServerName('');
    setServerDescription('');
    setServerMessage('Server created');
  };

  return (
    <div className="view view-animated">
      <h1 className="view-title">Home</h1>
      <p className="view-subtitle">Create spaces and continue your conversations.</p>

      <form className="card-item home-create-server" onSubmit={handleCreateServer}>
        <div className="card-main">
          <div className="card-title">Create a new server</div>
          <div className="field-group">
            <label className="field-label">Server name</label>
            <div className="field-shell">
              <input
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                placeholder="Aethera Lounge"
              />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Description</label>
            <div className="field-shell textarea-shell">
              <textarea
                value={serverDescription}
                onChange={e => setServerDescription(e.target.value)}
                placeholder="A calm place for friends and experiments."
              />
            </div>
          </div>
          {serverMessage && <p className="view-hint">{serverMessage}</p>}
        </div>
        <div className="card-meta card-actions">
          <button
            type="submit"
            className="btn primary small"
            disabled={!serverName.trim()}
          >
            Create
          </button>
        </div>
      </form>

      <h2 className="section-title">Direct messages</h2>
      {loading ? (
        <p className="view-hint">Loading chats…</p>
      ) : threads.length === 0 ? (
        <p className="view-hint">No direct messages yet. Add a friend to start chatting.</p>
      ) : (
        <div className="card-list">
          {threads.map(t => (
            <div key={t.id} className="card-item fade-in">
              <div className="card-main">
                <div className="card-title">{t.other_display_name}</div>
                {t.last_message && <div className="card-body">{t.last_message}</div>}
              </div>
              {t.last_timestamp && (
                <div className="card-meta">{new Date(t.last_timestamp).toLocaleTimeString()}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

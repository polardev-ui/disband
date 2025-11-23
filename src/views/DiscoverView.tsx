import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuthSession } from '../supabase/AuthSessionProvider';

interface ServerRow {
  id: string;
  name: string;
  description: string | null;
}

const CATEGORIES = ['Gaming', 'Art', 'Entertainment', 'Tech', 'Music'];

export function DiscoverView() {
  const { session } = useAuthSession();
  const [selected, setSelected] = useState<string[]>([]);
  const [servers, setServers] = useState<ServerRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // initial fetch of some servers
    const fetchServers = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('servers')
        .select('id, name, description')
        .limit(10);
      setServers((data as ServerRow[]) || []);
      setLoading(false);
    };
    fetchServers();
  }, []);

  const toggleCategory = (label: string) => {
    setSelected(sel =>
      sel.includes(label) ? sel.filter(s => s !== label) : [...sel, label],
    );
  };

  const handleFilter = (e: FormEvent) => {
    e.preventDefault();
    // For now this just keeps the same servers; you can later add a tag
    // system and filter based on that.
  };

  return (
    <div className="view view-animated">
      <h1 className="view-title">Discover</h1>
      <p className="view-subtitle">Tell us what you like, we’ll suggest servers.</p>

      <form className="chip-row" onSubmit={handleFilter}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            className={
              'chip ' + (selected.includes(cat) ? 'chip-selected' : '')
            }
            onClick={() => toggleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </form>

      {loading ? (
        <p className="view-hint">Finding spaces for you…</p>
      ) : servers.length === 0 ? (
        <p className="view-hint">No servers yet. Be the first to create one.</p>
      ) : (
        <div className="card-list">
          {servers.map(s => (
            <div key={s.id} className="card-item fade-in">
              <div className="card-main">
                <div className="card-title">{s.name}</div>
                {s.description && (
                  <div className="card-body">{s.description}</div>
                )}
              </div>
              <div className="card-meta">
                <button className="btn secondary small">Join</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuthSession } from '../supabase/AuthSessionProvider';
import './dm.css';

interface MessageRow {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
}

export function DmView() {
  const { session } = useAuthSession();
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !threadId) return;

    const loadMessages = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('dm_messages')
        .select('id, content, created_at, author_id')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      setMessages((data as MessageRow[]) || []);
      setLoading(false);
    };

    loadMessages();
  }, [session, threadId]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || !threadId || !input.trim()) return;

    const payload = {
      thread_id: threadId,
      author_id: session.user.id,
      content: input.trim(),
    };

    setInput('');
    setMessages(prev => [
      ...prev,
      {
        id: 'local-' + Date.now().toString(),
        content: payload.content,
        created_at: new Date().toISOString(),
        author_id: session.user.id,
      },
    ]);

    await supabase.from('dm_messages').insert(payload);
  };

  const isMine = (authorId: string) => session && authorId === session.user.id;

  return (
    <div className="view view-animated dm-view">
      <div className="view-header-row">
        <button
          type="button"
          className="btn secondary small"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <div>
          <h1 className="view-title">Direct message</h1>
          <p className="view-subtitle">A quiet space to talk.</p>
        </div>
      </div>

      <div className="dm-messages">
        {loading ? (
          <p className="view-hint">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="view-hint">Say hi and start the conversation.</p>
        ) : (
          messages.map(m => (
            <div
              key={m.id}
              className={
                'dm-bubble ' + (isMine(m.author_id) ? 'dm-bubble-mine' : 'dm-bubble-theirs')
              }
            >
              <div className="dm-bubble-content">{m.content}</div>
            </div>
          ))
        )}
      </div>

      <form className="dm-input-row" onSubmit={handleSend}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Message"
        />
        <button type="submit" className="btn primary small" disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

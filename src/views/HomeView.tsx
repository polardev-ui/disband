"use client"

import { type FormEvent, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import { useAuthSession } from "../supabase/AuthSessionProvider"

interface SimpleThread {
  id: string
  other_display_name: string
  last_message: string | null
  last_timestamp: string | null
}

export function HomeView() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session } = useAuthSession()
  const [threads, setThreads] = useState<SimpleThread[]>([])
  const [loading, setLoading] = useState(true)
  const [serverName, setServerName] = useState("")
  const [serverDescription, setServerDescription] = useState("")
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!session) return

    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase.rpc("get_user_dm_threads", {
        p_user_id: session.user.id,
      })
      if (!error && data) {
        setThreads(data as SimpleThread[])
      }
      setLoading(false)
    }

    load()
  }, [session])

  useEffect(() => {
    if ((location.state as any)?.showComposer) {
      setShowComposer(true)
    }
  }, [location.state])

  const handleCreateServer = async (e: FormEvent) => {
    e.preventDefault()
    setServerMessage(null)
    if (!session || !serverName.trim()) return

    setCreating(true)
    const { data, error } = await supabase
      .from("servers")
      .insert({
        owner_id: session.user.id,
        name: serverName.trim(),
        description: serverDescription.trim() || null,
      })
      .select("id")
      .maybeSingle()

    if (error || !data) {
      setServerMessage(error?.message ?? "Could not create server")
      setCreating(false)
      return
    }

    await supabase.from("server_members").insert({
      server_id: data.id,
      user_id: session.user.id,
      role: "owner",
    })

    setServerName("")
    setServerDescription("")
    setServerMessage("Server created successfully!")
    setCreating(false)

    // Clear success message after 3 seconds
    setTimeout(() => setServerMessage(null), 3000)
  }

  return (
    <div className="view view-animated">
      <h1 className="view-title">Home</h1>
      <p className="view-subtitle">Create spaces and continue your conversations.</p>

      {showComposer && (
        <div className="composer-overlay" onClick={() => setShowComposer(false)}>
          <div className="composer-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="section-title">Start something new</h2>
            <p className="view-subtitle">Choose what you want to create.</p>
            <div className="composer-actions">
              <button
                type="button"
                className="btn primary fill"
                onClick={() => {
                  setShowComposer(false)
                  const el = document.querySelector(".home-create-server")
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                }}
              >
                Create server
              </button>
              <button
                type="button"
                className="btn secondary fill"
                onClick={() => {
                  setShowComposer(false)
                  navigate("/friends", { state: { startDm: true } })
                }}
              >
                New DM
              </button>
              <button type="button" className="btn ghost small" onClick={() => setShowComposer(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="card-item home-create-server fade-in" onSubmit={handleCreateServer}>
        <div className="card-main">
          <div className="card-title">Create a new server</div>
          <div className="field-group">
            <label className="field-label">Server name</label>
            <div className="field-shell">
              <input
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="Aethera Lounge"
                disabled={creating}
              />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Description (optional)</label>
            <div className="field-shell textarea-shell">
              <textarea
                value={serverDescription}
                onChange={(e) => setServerDescription(e.target.value)}
                placeholder="A calm place for friends and experiments."
                rows={3}
                disabled={creating}
              />
            </div>
          </div>
          {serverMessage && (
            <p className={`view-hint ${serverMessage.includes("success") ? "success-text" : "error-text"}`}>
              {serverMessage}
            </p>
          )}
        </div>
        <div className="card-meta card-actions">
          <button type="submit" className="btn primary small" disabled={!serverName.trim() || creating}>
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      <h2 className="section-title">Direct messages</h2>
      {loading ? (
        <div className="loading-state">
          <div className="spinner-large" />
          <p className="view-hint">Loading chats...</p>
        </div>
      ) : threads.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-icon">💬</div>
          <p className="empty-title">No conversations yet</p>
          <p className="empty-subtitle">Add a friend to start chatting</p>
          <button className="btn secondary small" onClick={() => navigate("/friends")}>
            Find friends
          </button>
        </div>
      ) : (
        <div className="card-list">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              className="card-item fade-in dm-thread-item"
              onClick={() => navigate(`/dm/${t.id}`)}
            >
              <div className="card-main">
                <div className="card-title">{t.other_display_name}</div>
                {t.last_message && <div className="card-body">{t.last_message}</div>}
              </div>
              {t.last_timestamp && (
                <div className="card-meta">
                  {new Date(t.last_timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

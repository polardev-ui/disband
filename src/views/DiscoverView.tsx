"use client"

import { type FormEvent, useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { useAuthSession } from "../supabase/AuthSessionProvider"

interface ServerRow {
  id: string
  name: string
  description: string | null
}

const CATEGORIES = ["Gaming", "Art", "Entertainment", "Tech", "Music"]

export function DiscoverView() {
  const { session } = useAuthSession()
  const [selected, setSelected] = useState<string[]>([])
  const [servers, setServers] = useState<ServerRow[]>([])
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)

  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true)
      const { data } = await supabase.from("servers").select("id, name, description").limit(10)
      setServers((data as ServerRow[]) || [])
      setLoading(false)
    }
    fetchServers()
  }, [])

  const toggleCategory = (label: string) => {
    setSelected((sel) => (sel.includes(label) ? sel.filter((s) => s !== label) : [...sel, label]))
  }

  const handleFilter = (e: FormEvent) => {
    e.preventDefault()
  }

  const handleJoin = async (serverId: string) => {
    if (!session) return
    setJoining(serverId)

    await supabase.from("server_members").insert({
      server_id: serverId,
      user_id: session.user.id,
      role: "member",
    })

    setTimeout(() => setJoining(null), 1000)
  }

  return (
    <div className="view view-animated">
      <h1 className="view-title">Discover</h1>
      <p className="view-subtitle">Tell us what you like, we'll suggest servers.</p>

      <form className="chip-row" onSubmit={handleFilter}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={"chip " + (selected.includes(cat) ? "chip-selected" : "")}
            onClick={() => toggleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </form>

      {loading ? (
        <div className="loading-state">
          <div className="spinner-large" />
          <p className="view-hint">Finding spaces for you...</p>
        </div>
      ) : servers.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-icon">🌟</div>
          <p className="empty-title">No servers yet</p>
          <p className="empty-subtitle">Be the first to create one</p>
          <button className="btn primary small" onClick={() => (window.location.href = "/")}>
            Create server
          </button>
        </div>
      ) : (
        <div className="card-list">
          {servers.map((s) => (
            <div key={s.id} className="card-item fade-in server-card">
              <div className="card-main">
                <div className="card-title">{s.name}</div>
                {s.description && <div className="card-body">{s.description}</div>}
              </div>
              <div className="card-meta">
                <button className="btn secondary small" onClick={() => handleJoin(s.id)} disabled={joining === s.id}>
                  {joining === s.id ? "Joining..." : "Join"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

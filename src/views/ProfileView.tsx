"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import { useAuthSession } from "../supabase/AuthSessionProvider"

interface ProfileRow {
  id: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

export function ProfileView() {
  const { session } = useAuthSession()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [friendCount, setFriendCount] = useState<number | null>(null)
  const [serverCount, setServerCount] = useState<number | null>(null)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({ display_name: "", bio: "", avatar_url: "" })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) return
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .eq("id", session.user.id)
        .maybeSingle()
      setProfile((data as ProfileRow) || null)

      if (data) {
        setEditedProfile({
          display_name: data.display_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        })
      }

      const { count: friends } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`)
      setFriendCount(friends ?? null)

      const { count: servers } = await supabase
        .from("server_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
      setServerCount(servers ?? null)
    }
    load()
  }, [session])

  const handleSaveCustomization = async () => {
    if (!session || !profile) return

    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: editedProfile.display_name || null,
        bio: editedProfile.bio || null,
      })
      .eq("id", session.user.id)

    if (!error) {
      setProfile({
        ...profile,
        display_name: editedProfile.display_name || null,
        bio: editedProfile.bio || null,
      })
      setIsCustomizing(false)
    }
    setSaving(false)
  }

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
            className="btn ghost small"
            onClick={async () => {
              await supabase.auth.signOut()
              navigate("/")
            }}
          >
            Log out
          </button>
          <button type="button" className="btn secondary small" onClick={() => navigate("/settings")}>
            Settings
          </button>
        </div>
      </div>

      {!profile ? (
        <div className="loading-state">
          <div className="spinner-large" />
          <p className="view-hint">Loading profile...</p>
        </div>
      ) : (
        <>
          <div className="profile-card fade-in">
            <div className="profile-header">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={profile.display_name || ""}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar fallback">
                  <span className="avatar-initials">
                    {(profile.display_name || profile.username || "U")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="profile-main">
                {isCustomizing ? (
                  <input
                    type="text"
                    className="profile-name-edit"
                    value={editedProfile.display_name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, display_name: e.target.value })}
                    placeholder="Display name"
                  />
                ) : (
                  <div className="profile-name">{profile.display_name || profile.username || "User"}</div>
                )}
                {profile.username && <div className="profile-handle">@{profile.username}</div>}
              </div>
            </div>

            {isCustomizing ? (
              <div className="field-group">
                <label className="field-label">Bio</label>
                <div className="field-shell textarea-shell">
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    placeholder="Tell people about yourself..."
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              profile.bio && <p className="profile-bio">{profile.bio}</p>
            )}

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
              {isCustomizing ? (
                <>
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => {
                      setIsCustomizing(false)
                      if (profile) {
                        setEditedProfile({
                          display_name: profile.display_name || "",
                          bio: profile.bio || "",
                          avatar_url: profile.avatar_url || "",
                        })
                      }
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn primary small"
                    onClick={handleSaveCustomization}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </>
              ) : (
                <button type="button" className="btn primary small" onClick={() => setIsCustomizing(true)}>
                  Customize profile
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

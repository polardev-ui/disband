"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import "./onboarding.css"

export function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<number | null>(null)

  useEffect(() => {
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout)
    }

    const trimmed = username.trim().toLowerCase()
    if (!trimmed || trimmed.length < 3) {
      setUsernameStatus("idle")
      return
    }

    setUsernameStatus("checking")

    const timeout = setTimeout(async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("username").eq("username", trimmed).maybeSingle()

        if (error) throw error

        if (data) {
          setUsernameStatus("taken")
        } else {
          setUsernameStatus("available")
        }
      } catch (err) {
        console.error("Username check error:", err)
        setUsernameStatus("idle")
      }
    }, 500)

    setUsernameCheckTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [username])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUsernameNext = async () => {
    const trimmed = username.trim().toLowerCase()
    if (!trimmed) {
      setError("Pick a username first")
      return
    }
    if (trimmed.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }
    if (usernameStatus === "taken") {
      setError("This username is already taken")
      return
    }
    setUsername(trimmed)
    setError(null)
    setStep(1)
  }

  const finishOnboarding = async () => {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) throw new Error("No active session – please log in again.")

      let avatarUrl: string | null = null
      if (avatarFile) {
        try {
          const formData = new FormData()
          formData.append("file", avatarFile)

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000)

          const response = await fetch("https://api.wsgpolar.me/v1/images", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            const payload = (await response.json()) as {
              url?: string
              success?: boolean
              message?: string
            }
            if (payload.url) {
              avatarUrl = payload.url
            }
          } else {
            console.warn("Avatar upload failed", await response.text())
          }
        } catch (err) {
          console.warn("Avatar upload error (ignored)", err)
        }
      }

      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        username,
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        onboarding_complete: true,
      })

      if (error) {
        if ((error as any).code === "23505") {
          setStep(0)
          setError("That username is already taken. Try another one.")
          return
        }
        throw error
      }

      // Refresh the session to trigger AuthSessionProvider update
      await supabase.auth.refreshSession()
    } catch (err: any) {
      setError(err.message ?? "Could not finish onboarding")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="progress-dots">
          <div className={`progress-dot ${step >= 0 ? "active" : ""}`} />
          <div className={`progress-dot ${step >= 1 ? "active" : ""}`} />
          <div className={`progress-dot ${step >= 2 ? "active" : ""}`} />
        </div>

        {step === 0 && (
          <div className="onboarding-step step-fade-in">
            <div className="step-icon">@</div>
            <h2>Choose your username</h2>
            <p>This is how friends will find you on Disband.</p>
            <div className="field-group">
              <label className="field-label">Username</label>
              <div
                className={`field-shell ${usernameStatus === "available" ? "success" : usernameStatus === "taken" ? "error" : ""}`}
              >
                <span className="field-prefix">@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="aethera"
                  autoFocus
                />
                {usernameStatus === "checking" && (
                  <span className="field-status checking">
                    <div className="spinner" />
                  </span>
                )}
                {usernameStatus === "available" && <span className="field-status available">✓</span>}
                {usernameStatus === "taken" && <span className="field-status taken">✕</span>}
              </div>
              {username.length > 0 && username.length < 3 && (
                <p className="field-hint">Username must be at least 3 characters</p>
              )}
              {usernameStatus === "available" && <p className="field-hint success">Username is available!</p>}
              {usernameStatus === "taken" && <p className="field-hint error">This username is already taken</p>}
            </div>
            {error && <p className="error-text">{error}</p>}
            <button
              onClick={handleUsernameNext}
              disabled={!username || loading || usernameStatus !== "available"}
              className="btn primary fill"
            >
              Continue
            </button>
            <button onClick={() => setStep(1)} className="btn secondary ghost">
              Skip for now
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="onboarding-step step-fade-in">
            <div className="step-icon">✨</div>
            <h2>What should we call you?</h2>
            <p>Your display name is how you'll appear to others.</p>
            <div className="field-group">
              <label className="field-label">Display name</label>
              <div className="field-shell">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Aethera"
                  autoFocus
                />
              </div>
            </div>
            <div className="button-group">
              <button onClick={() => setStep(0)} className="btn secondary ghost">
                Back
              </button>
              <button onClick={() => setStep(2)} disabled={!displayName} className="btn primary fill">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step step-fade-in">
            <div className="step-icon">
              {avatarPreview ? (
                <img src={avatarPreview || "/placeholder.svg"} alt="Avatar" className="avatar-icon" />
              ) : (
                "👤"
              )}
            </div>
            <h2>Complete your profile</h2>
            <p>Add a bio and avatar to help friends recognize you.</p>

            <div className="avatar-upload-section">
              <label className="avatar-upload" htmlFor="avatar-input">
                {avatarPreview ? (
                  <img src={avatarPreview || "/placeholder.svg"} alt="Avatar preview" className="avatar-preview" />
                ) : (
                  <div className="avatar-placeholder">
                    <span>📷</span>
                    <span className="upload-text">Upload avatar</span>
                  </div>
                )}
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div className="field-group">
              <label className="field-label">Bio (optional)</label>
              <div className="field-shell textarea-shell">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="button-group">
              <button onClick={() => setStep(1)} className="btn secondary ghost" disabled={loading}>
                Back
              </button>
              <button onClick={finishOnboarding} disabled={loading} className="btn primary fill">
                {loading ? (
                  <>
                    <div className="spinner-inline" />
                    Finishing...
                  </>
                ) : (
                  "Finish"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

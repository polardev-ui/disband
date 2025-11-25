"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthSession } from "../supabase/AuthSessionProvider"
import "./settings.css"

type Theme = "midnight-glass" | "deep-ocean" | "cosmic-purple" | "forest-night"
type AccentColor = "blue" | "purple" | "green" | "pink"

export function SettingsView() {
  const navigate = useNavigate()
  const { session } = useAuthSession()
  const [theme, setTheme] = useState<Theme>("midnight-glass")
  const [accentColor, setAccentColor] = useState<AccentColor>("blue")
  const [reduceMotion, setReduceMotion] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load user preferences from localStorage
    const savedTheme = localStorage.getItem("disband-theme") as Theme
    const savedAccent = localStorage.getItem("disband-accent") as AccentColor
    const savedMotion = localStorage.getItem("disband-reduce-motion") === "true"

    if (savedTheme) setTheme(savedTheme)
    if (savedAccent) setAccentColor(savedAccent)
    setReduceMotion(savedMotion)

    // Apply theme to document
    applyTheme(savedTheme || "midnight-glass", savedAccent || "blue", savedMotion)
  }, [])

  const applyTheme = (newTheme: Theme, newAccent: AccentColor, motion: boolean) => {
    document.documentElement.setAttribute("data-theme", newTheme)
    document.documentElement.setAttribute("data-accent", newAccent)
    document.documentElement.setAttribute("data-reduce-motion", motion.toString())
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("disband-theme", newTheme)
    applyTheme(newTheme, accentColor, reduceMotion)
  }

  const handleAccentChange = (newAccent: AccentColor) => {
    setAccentColor(newAccent)
    localStorage.setItem("disband-accent", newAccent)
    applyTheme(theme, newAccent, reduceMotion)
  }

  const handleMotionToggle = () => {
    const newValue = !reduceMotion
    setReduceMotion(newValue)
    localStorage.setItem("disband-reduce-motion", newValue.toString())
    applyTheme(theme, accentColor, newValue)
  }

  const handleEditProfile = () => {
    navigate("/profile")
    // Trigger customize mode via state
    window.history.replaceState({ customize: true }, "")
  }

  return (
    <div className="view view-animated">
      <div className="view-header-row">
        <button type="button" className="btn secondary small" onClick={() => navigate(-1)}>
          Back
        </button>
        <div>
          <h1 className="view-title">Settings</h1>
          <p className="view-subtitle">Tune Disband to feel like you.</p>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-label">Profile</div>
        <button className="settings-row" type="button" onClick={handleEditProfile}>
          <div className="settings-main">
            <div className="settings-title">Edit profile</div>
            <div className="settings-subtitle">Name, avatar, bio</div>
          </div>
          <span className="settings-arrow">→</span>
        </button>
      </div>

      <div className="settings-group">
        <div className="settings-label">Appearance</div>

        <div className="settings-section-title">Theme</div>
        <div className="theme-grid">
          <button
            className={`theme-option ${theme === "midnight-glass" ? "selected" : ""}`}
            onClick={() => handleThemeChange("midnight-glass")}
          >
            <div className="theme-preview midnight-glass" />
            <span>Midnight Glass</span>
          </button>
          <button
            className={`theme-option ${theme === "deep-ocean" ? "selected" : ""}`}
            onClick={() => handleThemeChange("deep-ocean")}
          >
            <div className="theme-preview deep-ocean" />
            <span>Deep Ocean</span>
          </button>
          <button
            className={`theme-option ${theme === "cosmic-purple" ? "selected" : ""}`}
            onClick={() => handleThemeChange("cosmic-purple")}
          >
            <div className="theme-preview cosmic-purple" />
            <span>Cosmic Purple</span>
          </button>
          <button
            className={`theme-option ${theme === "forest-night" ? "selected" : ""}`}
            onClick={() => handleThemeChange("forest-night")}
          >
            <div className="theme-preview forest-night" />
            <span>Forest Night</span>
          </button>
        </div>

        <div className="settings-section-title">Accent Color</div>
        <div className="accent-grid">
          <button
            className={`accent-option ${accentColor === "blue" ? "selected" : ""}`}
            onClick={() => handleAccentChange("blue")}
          >
            <div className="accent-preview blue" />
          </button>
          <button
            className={`accent-option ${accentColor === "purple" ? "selected" : ""}`}
            onClick={() => handleAccentChange("purple")}
          >
            <div className="accent-preview purple" />
          </button>
          <button
            className={`accent-option ${accentColor === "green" ? "selected" : ""}`}
            onClick={() => handleAccentChange("green")}
          >
            <div className="accent-preview green" />
          </button>
          <button
            className={`accent-option ${accentColor === "pink" ? "selected" : ""}`}
            onClick={() => handleAccentChange("pink")}
          >
            <div className="accent-preview pink" />
          </button>
        </div>

        <button className="settings-row" type="button" onClick={handleMotionToggle}>
          <div className="settings-main">
            <div className="settings-title">Reduce motion</div>
            <div className="settings-subtitle">Softer animations, less motion</div>
          </div>
          <div className={`toggle ${reduceMotion ? "on" : "off"}`}>
            <div className="toggle-thumb" />
          </div>
        </button>
      </div>

      <div className="settings-group">
        <div className="settings-label">Notifications</div>
        <button className="settings-row" type="button" disabled>
          <div className="settings-main">
            <div className="settings-title">Push notifications</div>
            <div className="settings-subtitle">Coming soon</div>
          </div>
        </button>
      </div>
    </div>
  )
}

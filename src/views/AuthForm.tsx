"use client"

import { type FormEvent, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { supabase } from "../supabaseClient"
import "./auth.css"

export function AuthForm() {
  const { mode } = useParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSignup = mode === "signup"

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        if (data.session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_complete")
            .eq("id", data.session.user.id)
            .maybeSingle()

          if (profile && profile.onboarding_complete) {
            navigate("/")
            return
          }
        }
      }
      navigate("/onboarding")
    } catch (err: any) {
      setError(err.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background-subtle">
        <div className="stars-subtle" />
      </div>

      <div className="auth-card">
        <Link to="/" className="auth-back-button">
          ← Back
        </Link>

        <div className="auth-header">
          <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
          <p className="auth-hint">
            {isSignup ? "Join Disband and start connecting with friends" : "Log in to continue your conversations"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
            <p className="form-hint">Must be at least 6 characters</p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">!</span>
              <p className="error-text">{error}</p>
            </div>
          )}

          <button type="submit" className="btn primary fill" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-inline" />
                {isSignup ? "Creating account..." : "Logging in..."}
              </>
            ) : isSignup ? (
              "Create account"
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isSignup ? (
            <p>
              Already have an account?{" "}
              <Link to="/auth/login" className="auth-link">
                Log in
              </Link>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <Link to="/auth/signup" className="auth-link">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

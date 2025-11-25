import { Link } from "react-router-dom"
import "./auth.css"

export function AuthLanding() {
  return (
    <div className="auth-landing">
      <div className="auth-background">
        <div className="stars" />
        <div className="stars layer" />
      </div>
      <div className="auth-content">
        <div className="logo-stack">
          <div className="logo-container">
            <img src="/images/logo.png" alt="Disband" className="logo" />
          </div>
          <h1 className="app-name">Disband</h1>
          <p className="tagline">Establishing secure ways to communicate.</p>
          <p className="byline">Designed by Aethera Intelligence</p>
        </div>
        <div className="auth-actions">
          <Link to="/auth/signup" className="btn primary">
            Create an account
          </Link>
          <Link to="/auth/login" className="btn secondary">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

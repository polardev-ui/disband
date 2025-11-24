import { useNavigate } from 'react-router-dom';
import './settings.css';

export function SettingsView() {
  const navigate = useNavigate();

  return (
    <div className="view view-animated">
      <div className="view-header-row">
        <button
          type="button"
          className="btn secondary small"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <div>
          <h1 className="view-title">Settings</h1>
          <p className="view-subtitle">Tune Disband to feel like you.</p>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-label">Profile</div>
        <button className="settings-row" type="button">
          <div className="settings-main">
            <div className="settings-title">Edit profile</div>
            <div className="settings-subtitle">Name, avatar, bio</div>
          </div>
        </button>
      </div>

      <div className="settings-group">
        <div className="settings-label">Appearance</div>
        <button className="settings-row" type="button">
          <div className="settings-main">
            <div className="settings-title">Theme</div>
            <div className="settings-subtitle">Midnight glass (default)</div>
          </div>
        </button>
        <button className="settings-row" type="button">
          <div className="settings-main">
            <div className="settings-title">Reduce motion</div>
            <div className="settings-subtitle">Softer animations, less motion</div>
          </div>
        </button>
      </div>

      <div className="settings-group">
        <div className="settings-label">Notifications</div>
        <button className="settings-row" type="button">
          <div className="settings-main">
            <div className="settings-title">Push notifications</div>
            <div className="settings-subtitle">Coming soon</div>
          </div>
        </button>
      </div>
    </div>
  );
}

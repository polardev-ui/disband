import { NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { HomeView } from './HomeView';
import { DiscoverView } from './DiscoverView';
import { FriendsView } from './FriendsView';
import { ProfileView } from './ProfileView';
import { SettingsView } from './SettingsView';
import './shell.css';

export function MainShell() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div key={location.pathname} className="app-content page-transition">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/discover" element={<DiscoverView />} />
          <Route path="/friends" element={<FriendsView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
        <Outlet />
      </div>
      <button
        type="button"
        className="home-plus-button"
        onClick={() => navigate('/', { state: { showComposer: true } })}
      >
        <img src="/icons/plus.png" alt="New" />
      </button>
      <nav className="bottom-nav">
        <div className="nav-droplet" />
        <NavLink to="/" className="nav-item">
          <img src="/icons/home.png" alt="Home" className="nav-icon" />
          <span className="label">Home</span>
        </NavLink>
        <NavLink to="/discover" className="nav-item">
          <img src="/icons/discover.png" alt="Discover" className="nav-icon" />
          <span className="label">Discover</span>
        </NavLink>
        <NavLink to="/friends" className="nav-item">
          <img src="/icons/friends.png" alt="Friends" className="nav-icon" />
          <span className="label">Friends</span>
        </NavLink>
        <NavLink to="/profile" className="nav-item">
          <img src="/icons/profile.png" alt="Profile" className="nav-icon" />
          <span className="label">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}

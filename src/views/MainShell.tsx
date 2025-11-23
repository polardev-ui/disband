import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { HomeView } from './HomeView';
import { DiscoverView } from './DiscoverView';
import { FriendsView } from './FriendsView';
import { ProfileView } from './ProfileView';
import './shell.css';

export function MainShell() {
  return (
    <div className="app-shell">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/discover" element={<DiscoverView />} />
          <Route path="/friends" element={<FriendsView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
        <Outlet />
      </div>
      <nav className="bottom-nav">
        <NavLink to="/" className="nav-item">
          <span className="icon">🏠</span>
          <span className="label">Home</span>
        </NavLink>
        <NavLink to="/discover" className="nav-item">
          <span className="icon">✨</span>
          <span className="label">Discover</span>
        </NavLink>
        <NavLink to="/friends" className="nav-item">
          <span className="icon">👥</span>
          <span className="label">Friends</span>
        </NavLink>
        <NavLink to="/profile" className="nav-item">
          <span className="icon">👤</span>
          <span className="label">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}

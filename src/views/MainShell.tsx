import { NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { HomeView } from './HomeView';
import { DiscoverView } from './DiscoverView';
import { FriendsView } from './FriendsView';
import { ProfileView } from './ProfileView';
import './shell.css';

export function MainShell() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <div key={location.pathname} className="app-content page-transition">
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
          <span className="icon icon-home" />
          <span className="label">Home</span>
        </NavLink>
        <NavLink to="/discover" className="nav-item">
          <span className="icon icon-discover" />
          <span className="label">Discover</span>
        </NavLink>
        <NavLink to="/friends" className="nav-item">
          <span className="icon icon-friends" />
          <span className="label">Friends</span>
        </NavLink>
        <NavLink to="/profile" className="nav-item">
          <span className="icon icon-profile" />
          <span className="label">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}

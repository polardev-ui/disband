import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthSessionProvider } from './supabase/AuthSessionProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthSessionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthSessionProvider>
  </React.StrictMode>,
);

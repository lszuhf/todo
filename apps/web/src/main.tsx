import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const THEME_STORAGE_KEY = 'theme-preference';

function initializeTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    document.documentElement.classList.add(storedTheme);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
}

initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

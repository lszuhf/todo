import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryProvider } from './lib/query/QueryProvider';
import { NotificationProvider } from './lib/context/NotificationContext';
import { initMocks } from './mocks/init';

initMocks().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </QueryProvider>
    </React.StrictMode>
  );
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { DiningWidget } from './components/DiningWidget';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen flex items-center justify-center p-6">
      <DiningWidget />
    </div>
  </React.StrictMode>
);

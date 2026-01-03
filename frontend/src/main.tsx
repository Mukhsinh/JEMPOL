import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRefactored from './AppRefactored';
import './index.css';

console.log('🚀 Starting KISS Application with refactored configuration...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRefactored />
  </React.StrictMode>,
);

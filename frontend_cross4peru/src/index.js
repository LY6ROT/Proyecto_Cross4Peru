import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Buscamos el div con id="root" en el index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizamos la App dentro de ese div
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
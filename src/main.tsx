import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initGlobalGoals } from './lib/metrika'

createRoot(document.getElementById("root")!).render(<App />);

initGlobalGoals();

// Service Worker — оффлайн-режим
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
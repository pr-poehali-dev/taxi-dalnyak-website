import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initGlobalGoals } from './lib/metrika'
import { registerVisit, initVisitKeyLinks } from './lib/tracking'

createRoot(document.getElementById("root")!).render(<App />);

initGlobalGoals();
initVisitKeyLinks();
registerVisit();

// Service Worker — оффлайн-режим
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
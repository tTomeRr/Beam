
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical error during app startup:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif; direction: rtl;">
      <h2 style="color: #ef4444;">אירעה שגיאה בטעינת האפליקציה</h2>
      <p>אנא נסו לרענן את העמוד.</p>
      <pre style="text-align: left; background: #eee; padding: 10px; display: inline-block; margin-top: 20px; max-width: 100%; overflow: auto;">
        ${error instanceof Error ? error.stack || error.message : String(error)}
      </pre>
    </div>
  `;
}

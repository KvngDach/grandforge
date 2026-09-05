import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Load Google Fonts
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap";
link.rel  = "stylesheet";
document.head.appendChild(link);

// Global base styles
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #09090c; color: #ede8df; }
  a { color: inherit; }
  button { font-family: 'DM Sans', sans-serif; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

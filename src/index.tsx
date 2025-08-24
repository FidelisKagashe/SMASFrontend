import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import "./icons/index.css"
import { ApplicationProvider } from "./providers";
// import "./sass/light.scss"
import { BrowserRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <ApplicationProvider>
        <App />
      </ApplicationProvider>
    </Router>
  </React.StrictMode>
)

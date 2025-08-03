import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'


const clientId =
  "520513079843-6ng2r1pgsrmh3dhspo2fh2s79o0kmmkg.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
);

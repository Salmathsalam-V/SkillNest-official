import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store, persistor  } from '../src/Redux/store'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from 'sonner';
import  ErrorBoundary  from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="768158657502-ia2b2gh1gd3o69rm7ehh1rhtvfe2aapi.apps.googleusercontent.com">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toaster position="top-right" />
          <ErrorBoundary>
          <App />
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)

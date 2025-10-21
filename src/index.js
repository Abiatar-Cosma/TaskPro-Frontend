// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import 'modern-normalize';
import GlobalStyles from 'assets/styles/GlobalStyles';
import './index.css';
import App from 'components/App/App';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import '../src/assets/i18/i18';

const isProd = process.env.NODE_ENV === 'production';
const Router = isProd ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Router>
        <GlobalStyles />
        <App />
      </Router>
    </PersistGate>
  </Provider>
);

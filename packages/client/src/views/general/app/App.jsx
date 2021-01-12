import React, { useEffect } from 'react';
import './App.css';
import AppRouter from '@components/AppRouter';
import NavigationBar from '@components/NavigationBar';
import AppBar from '@components/AppBar';
import NoInternetConnection from './components/NoInternetConnection';
import {
  STORE_SHOW_NAVIGATION_BAR,
  STORE_SHOW_APP_BAR,
  STORE_USER_TYPE,
  USER_TYPE,
} from '@lib/constants';
import { useStoreValue } from 'react-context-hook';
import { useState } from 'react';

function App() {
  const showNavigationBar = useStoreValue(STORE_SHOW_NAVIGATION_BAR);
  const showAppBar = useStoreValue(STORE_SHOW_APP_BAR);
  const userType = useStoreValue(STORE_USER_TYPE);
  const [online, setOnline] = useState(false);

  window.addEventListener('offline', () => {
    setOnline(false);
  });

  window.addEventListener('online', () => {
    setOnline(true);
  });

  useEffect(() => {
    setOnline(navigator.onLine);
  }, []);

  return (
    <div className="App">
      {!online && <NoInternetConnection />}
      {showAppBar && userType === USER_TYPE.business && (
        <>
          <AppBar />
        </>
      )}
      <AppRouter />
      {showNavigationBar && userType === USER_TYPE.person && <NavigationBar />}
    </div>
  );
}

export default App;

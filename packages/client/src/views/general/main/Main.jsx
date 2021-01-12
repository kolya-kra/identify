import React, { Suspense } from 'react';
import App from '@views/app';
import { withStore } from 'react-context-hook';
import LoadingScreen from '@components/LoadingScreen';

import '@src/i18n';

const Main = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
  );
};

export default withStore(Main);

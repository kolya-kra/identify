import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Main from '@views/main';
import { Router } from 'react-router-dom';
import RouterHistory from './lib/router-history';
// import reportWebVitals from './lib/reportWebVitals';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import 'bootstrap/dist/css/bootstrap.min.css';

Sentry.init({
  dsn:
    'https://341719f0700341a5838a55cd8e549038@o483035.ingest.sentry.io/5534154',
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <Router history={RouterHistory}>
    <Main />
  </Router>,
  document.getElementById('root')
);

// window.onfocus = () => {
//   const r = new XMLHttpRequest();
//   r.onload = function () {
//     const t = r.responseText;
//     const versionStart = t.indexOf('"/precache-manifest.') + 20;
//     const versionEnd = t.indexOf('.js"', versionStart);

//     if (versionEnd - versionStart === 32) {
//       const ls = localStorage;
//       const oldPrecacheManifestVersion = ls.getItem('pmv');
//       const newPrecacheManifestVersion = t.substring(versionStart, versionEnd);

//       if (newPrecacheManifestVersion !== oldPrecacheManifestVersion) {
//         ls.setItem('pmv', newPrecacheManifestVersion);
//         console.log('Reload window because of new version');
//         return window.reload();
//       }
//     }
//   };
//   r.open('GET', '/serviceWorker.js?c=' + new Date().getTime());
//   r.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//   r.send();
// };

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// reportWebVitals(console.log);

import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useSetStoreValue } from 'react-context-hook';
import {
  STORE_USER,
  STORE_USER_TYPE,
  STORE_LOGGED_IN,
  STORE_LOGIN_EXPIRY,
  QUERY_PARAM_INTENDED_URL,
  STORE_DEMO_USER,
} from '@lib/constants';
import JWT from 'jsonwebtoken';
import moment from 'moment';

export default function withAuth(ComponentToProtect, requiredUserType) {
  return function (props) {
    const [loading, setLoading] = useState(true);
    const [redirect, setRedirect] = useState(false);
    const [loginExpired, setLoginExpired] = useState(false);

    const user = JSON.parse(localStorage.getItem(STORE_USER));
    const setUserType = useSetStoreValue(STORE_USER_TYPE);
    const setDemoUser = useSetStoreValue(STORE_DEMO_USER);
    const setLoggedIn = useSetStoreValue(STORE_LOGGED_IN);

    const [intendedUrl, setIntendedUrl] = useState();

    const path = useLocation();

    useEffect(() => {
      let isMounted = true;
      async function validateUser() {
        const expiryToken = localStorage.getItem(STORE_LOGIN_EXPIRY);
        if (expiryToken) {
          const expiryDate = moment(
            JWT.verify(
              expiryToken,
              process.env.REACT_APP_JWT_SECRET || 'secret'
            ).expiry
          );

          const now = moment();
          if (expiryDate.isSameOrBefore(now)) {
            await setLoginExpired(true);
          }
        }

        if (user && !loginExpired) {
          // is logged in
          if (isMounted) {
            setDemoUser(user.demo ? true : false);
            setUserType(user.type);
            setLoggedIn(true);
            setLoading(false);
            setLoginExpired(false);
          }
        } else {
          // is not logged in
          if (isMounted) {
            setIntendedUrl(encodeURIComponent(path.pathname + path.search));
            setLoading(false);
            setRedirect(true);
            setLoggedIn(false);
          }
        }
      }
      validateUser();
      return () => {
        isMounted = false;
      };
      // eslint-disable-next-line
    }, []);

    if (loading) {
      return null;
    }
    if (loginExpired) {
      return <Redirect to="/logout" />;
    }
    if (redirect) {
      if (intendedUrl)
        return (
          <Redirect
            to={{
              pathname: '/login',
              search: `${QUERY_PARAM_INTENDED_URL}=${intendedUrl}`,
            }}
          />
        );
      else return <Redirect to="/login" />;
    }
    if (
      !requiredUserType ||
      (requiredUserType && user.type === requiredUserType) ||
      user.isAdmin
    ) {
      return <ComponentToProtect {...props} />;
    } else {
      return <Redirect to="/" />;
    }
  };
}

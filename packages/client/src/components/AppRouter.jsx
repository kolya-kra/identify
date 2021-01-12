import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useStoreValue } from 'react-context-hook';

import PersonHome from '@personApp/home';
import Profile from '@personApp/profile';
import Scanner from '@personApp/scanner';
import BusinessHome from '@businessApp/home';
import Subscription from '@businessApp/subscription';
import BusinessProfile from '@businessApp/profile';
import SignIn from '@views/signIn';
import SignUp from '@views/signUp';
import WithAuth from '@components/WithAuth';
import Logout from '@components/Logout';
import AccountVerification from '@components/AccountVerification';

import Error404 from '@views/error404';

import { STORE_USER_TYPE, USER_TYPE } from '@lib/constants';

export default function AppRouter() {
  const userType = useStoreValue(STORE_USER_TYPE);

  return (
    <div>
      <Switch>
        <Route
          exact
          path="/"
          component={
            userType === 'business'
              ? WithAuth(BusinessHome)
              : WithAuth(PersonHome)
          }
        />

        <Route
          path="/profile"
          component={
            userType === 'business'
              ? WithAuth(BusinessProfile)
              : WithAuth(Profile)
          }
        />
        <Route path="/scanner" component={WithAuth(Scanner)} />

        <Route
          path="/subscription"
          component={WithAuth(Subscription, USER_TYPE.business)}
        />

        <Route path="/verification/:token" component={AccountVerification} />

        <Route path="/login" component={SignIn} />
        <Route path="/register" component={SignUp} />
        <Route path="/logout" component={Logout} />

        <Route path="*" component={Error404} />
      </Switch>
    </div>
  );
}

import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSetStoreValue } from 'react-context-hook';
import API from '@lib/api';
import {
  STORE_USER,
  STORE_SHOW_NAVIGATION_BAR,
  STORE_SHOW_APP_BAR,
  STORE_LOGIN_EXPIRY,
  STORE_VISIT,
  STORE_HOME_CURRENT_LOCATION,
  STORE_HOME_SEARCHTERM,
} from '@lib/constants';
import {
  Container,
  CssBaseline,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: theme.spacing(8),
    alignItems: 'center',
  },
}));

const Logout = () => {
  const classes = useStyles();
  const history = useHistory();
  const setShowNavigationBar = useSetStoreValue(STORE_SHOW_NAVIGATION_BAR);
  const setShowAppBar = useSetStoreValue(STORE_SHOW_APP_BAR);

  useEffect(() => {
    setShowNavigationBar(false);
    setShowAppBar(false);

    const visit = JSON.parse(localStorage.getItem(STORE_VISIT));
    if (visit) {
      API.post(`/location/${visit._id}/checkout`).then(() => {
        localStorage.removeItem(STORE_VISIT);
        logout();
      });
    } else {
      logout();
    }
  });

  const logout = () => {
    API.post('/auth/logout').then((response) => {
      if (response.status === 200) {
        localStorage.removeItem(STORE_USER);
        localStorage.removeItem(STORE_LOGIN_EXPIRY);
        localStorage.removeItem(STORE_HOME_CURRENT_LOCATION);
        localStorage.removeItem(STORE_HOME_SEARCHTERM);
        history.replace('/login');
      }
    });
  };

  return (
    <div>
      <Container component="main" maxWidth="xs" className={classes.main}>
        <CssBaseline />
        <CircularProgress />
        <Typography>We're currently logging you out...</Typography>
      </Container>
    </div>
  );
};

export default Logout;

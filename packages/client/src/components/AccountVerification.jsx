import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSetStoreValue } from 'react-context-hook';
import API from '@lib/api';
import {
  STORE_SHOW_NAVIGATION_BAR,
  STORE_SHOW_APP_BAR,
  QUERY_PARAM_VERIFICATION_SUCCESSFUL,
  QUERY_PARAM_VERIFICATION_FAILED,
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

const AccountVerification = () => {
  const classes = useStyles();
  const history = useHistory();
  const setShowNavigationBar = useSetStoreValue(STORE_SHOW_NAVIGATION_BAR);
  const setShowAppBar = useSetStoreValue(STORE_SHOW_APP_BAR);

  const { token } = useParams();

  useEffect(() => {
    setShowNavigationBar(false);
    setShowAppBar(false);

    if (token) {
      API.post(`/auth/verification`, { token })
        .then(() => {
          history.replace({
            pathname: '/login',
            search: `?${QUERY_PARAM_VERIFICATION_SUCCESSFUL}`,
          });
        })
        .catch((error) => {
          console.log(error?.response?.data);
          history.replace({
            pathname: '/login',
            search: `?${QUERY_PARAM_VERIFICATION_FAILED}=${encodeURIComponent(
              error?.response?.data
            )}`,
          });
        });
    } else {
      history.replace('/login');
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <Container component="main" maxWidth="xs" className={classes.main}>
        <CssBaseline />
        <CircularProgress />
        <Typography>We're currently verifying your account...</Typography>
      </Container>
    </div>
  );
};

export default AccountVerification;

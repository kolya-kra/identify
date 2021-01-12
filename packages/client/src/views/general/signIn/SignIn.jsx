import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSetStoreValue } from 'react-context-hook';
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Box,
  Container,
  CircularProgress,
  Grid,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import API from '@lib/api';
import {
  STORE_USER,
  STORE_SHOW_NAVIGATION_BAR,
  STORE_SHOW_APP_BAR,
  STORE_LOGIN_EXPIRY,
  STORE_VISIT,
  USER_TYPE,
  QUERY_PARAM_INTENDED_URL,
  QUERY_PARAM_VERIFICATION_SUCCESSFUL,
  QUERY_PARAM_VERIFICATION_FAILED,
  QUERY_PARAM_REGISTRATION_SUCCESSFUL,
  CONFIGURATION,
} from '@lib/constants';
import Copyright from './components/Copyright';
import JWT from 'jsonwebtoken';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import * as EmailValidator from 'email-validator';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    height: 38,
  },
  linkText: {
    cursor: 'pointer',
    color: '#30e3ca !important',
  },
  alert: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  logo: {
    width: 200,
    marginBottom: theme.spacing(2),
  },
}));

const SignIn = (props) => {
  const { t, i18n } = useTranslation();
  const setShowNavigationBar = useSetStoreValue(STORE_SHOW_NAVIGATION_BAR);
  const setShowAppBar = useSetStoreValue(STORE_SHOW_APP_BAR);
  const history = useHistory();
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState();
  const [alertSeverity, setAlertSeverity] = useState('success');

  useEffect(() => {
    setShowNavigationBar(false);
    setShowAppBar(false);
    if (localStorage.getItem(STORE_USER)) {
      history.replace('/');
    }
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setEmail(urlParams.get('email'));
    setPassword(urlParams.get('pw'));
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(props.location.search);

    if (urlParams.get(QUERY_PARAM_REGISTRATION_SUCCESSFUL) !== null) {
      console.log('Registration Successful');

      setAlertSeverity('success');
      setAlert(t('signIn.alerts.registrationSuccessful'));
    } else if (urlParams.get(QUERY_PARAM_VERIFICATION_SUCCESSFUL) !== null) {
      console.log('Verification Successful');

      setAlertSeverity('success');
      setAlert(t('signIn.alerts.verificationSuccessful'));
    } else if (urlParams.get(QUERY_PARAM_VERIFICATION_FAILED) !== null) {
      console.log('Verification Failed');

      setAlertSeverity('error');
      setAlert(
        decodeURIComponent(urlParams.get(QUERY_PARAM_VERIFICATION_FAILED))
      );
    } else {
      setAlert(null);
    }
  }, [props.location.search, t]);

  const handleOnSignUpClick = () => {
    history.push('/register');
  };

  const handleOnForgotPasswordClick = () => {
    console.log('forgot password');
    if (!loading) {
      if (email && EmailValidator.validate(email)) {
        setLoading(true);
        API.post('/auth/forgot-password', {
          email,
        })
          .then((response) => {
            setAlert(t('signIn.alerts.passwordResetSuccessful'));
            setAlertSeverity('success');
            console.log(response);
          })
          .catch(function (error) {
            if (error && error.response && error.response.data) {
              setAlert(error.response.data);
              setAlertSeverity('error');
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setAlert(t('signIn.alerts.validEmail'));
        setAlertSeverity('error');
        console.log('Enter valid mail');
      }
    }
  };

  const handleSignIn = () => {
    if (!loading) {
      const urlParams = new URLSearchParams(props.location.search);
      const intendedUrl = decodeURIComponent(
        urlParams.get(QUERY_PARAM_INTENDED_URL)
      ).split('?');

      setLoading(true);
      API.post('/auth/login', {
        email,
        password,
      })
        .then(async (response) => {
          if (response.status === 200) {
            const user = response.data.user;
            const expiryDate =
              process.env.NODE_ENV === 'development'
                ? moment().add(24, 'h')
                : moment().add(6, 'h');

            const expiryToken = JWT.sign(
              { expiry: expiryDate },
              process.env.REACT_APP_JWT_SECRET || 'secret',
              { algorithm: 'HS512' }
            );
            localStorage.setItem(STORE_USER, JSON.stringify(user));
            localStorage.setItem(STORE_LOGIN_EXPIRY, expiryToken);

            setLoading(false);
            setAlert(null);

            if (user.type === USER_TYPE.person) {
              try {
                const activeVisitResponse = await API.get(
                  `/person/${user.id}/active-visit`
                );
                if (activeVisitResponse?.data) {
                  localStorage.setItem(
                    STORE_VISIT,
                    JSON.stringify(activeVisitResponse.data)
                  );
                }

                API.get(`/configuration/${user.id}`)
                  .then((res) => {
                    console.log(res.data);
                    if (res.data?.language) {
                      i18n.changeLanguage(res.data.language);
                    }
                    localStorage.setItem(CONFIGURATION.radius, res.data.radius);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              } catch (error) {
                console.log(error);
              }
            }

            if (intendedUrl?.length === 2) {
              history.push({
                pathname: intendedUrl[0],
                search: intendedUrl[1],
              });
            } else {
              history.push({
                pathname: '/',
                search: null,
              });
            }
          }
        })
        .catch(function (error) {
          if (error && error.response && error.response.data) {
            setLoading(false);
            setAlert(error.response.data);
            setAlertSeverity('error');
          } else {
            console.log(error);
          }
        });
    }
  };

  const handleKeyPress = (e) => {
    const code = e.keyCode ? e.keyCode : e.which;
    if (code === 13 && email && password) {
      handleSignIn();
    }
  };

  return (
    <div>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <img
            src={process.env.PUBLIC_URL + '/img/identify.svg'}
            className={classes.logo}
            alt=""
          />

          {alert && (
            <Alert className={classes.alert} severity={alertSeverity}>
              {alert}
            </Alert>
          )}

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('signIn.email')}
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLocaleLowerCase())}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('signIn.password')}
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSignIn}
            className={classes.submit}
          >
            {loading ? (
              <CircularProgress size={20} color="secondary" />
            ) : (
              <span>{t('signIn.signIn')}</span>
            )}
          </Button>
          <Grid container>
            <Grid item xs className="text-left">
              <Link
                onClick={handleOnForgotPasswordClick}
                className={classes.linkText}
              >
                {t('signIn.forgotPassword')}
              </Link>
            </Grid>
            <Grid item>
              <Link onClick={handleOnSignUpClick} className={classes.linkText}>
                {t('signIn.noAccount')}
              </Link>
            </Grid>
          </Grid>
        </div>
        <Box mt={4}>
          <Copyright />
        </Box>
      </Container>
    </div>
  );
};

export default SignIn;

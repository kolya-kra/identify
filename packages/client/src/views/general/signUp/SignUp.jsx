import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Container,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ToggleButtonGroup, ToggleButton, Alert } from '@material-ui/lab';
import Copyright from '../signIn/components/Copyright';
import API from '@lib/api';
import { useSetStoreValue } from 'react-context-hook';
import {
  STORE_SHOW_NAVIGATION_BAR,
  STORE_USER,
  STORE_SHOW_APP_BAR,
  QUERY_PARAM_REGISTRATION_SUCCESSFUL,
  USER_TYPE,
} from '@lib/constants';
import * as EmailValidator from 'email-validator';
import passwordStrength from 'check-password-strength';
import { useTranslation } from 'react-i18next';
import { get as _get, set as _set, unset as _unset } from 'lodash';

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
  signInButton: {
    cursor: 'pointer',
    color: '#30e3ca !important',
  },
  userTypeToggle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  userTypeToggleButton: {
    width: '50%',
  },
  errorText: {
    color: theme.palette.error.main,
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

export default function SignUp() {
  const { t } = useTranslation();
  const setShowNavigationBar = useSetStoreValue(STORE_SHOW_NAVIGATION_BAR);
  const setShowAppBar = useSetStoreValue(STORE_SHOW_APP_BAR);
  const classes = useStyles();
  const history = useHistory();

  const [user, setUser] = useState({});

  const [userType, setUserType] = useState(USER_TYPE.person);
  const [errors, setErrors] = useState({});
  const [alertError, setAlertError] = useState();
  const [weakPassword, setWeakPassword] = useState({
    isWeak: false,
    confirmed: false,
  });
  const [loading, setLoading] = useState(false);
  const [requiredFields, setRequiredFields] = useState([]);

  useEffect(() => {
    setShowNavigationBar(false);
    setShowAppBar(false);
    if (localStorage.getItem(STORE_USER)) {
      history.replace('/');
    }
  });

  useEffect(() => {
    if (userType !== null) {
      let fields;
      if (userType === USER_TYPE.person) {
        fields = [
          'firstname',
          'name',
          'address.street',
          'address.number',
          'address.postcode',
          'address.city',
          'email',
          'phone',
          'password',
        ];
      } else if (userType === USER_TYPE.business) {
        fields = ['companyName', 'email', 'phone', 'password'];
      }
      setRequiredFields(fields);
      const newUser = {};
      Object.keys(user).forEach((key) => {
        if (fields.includes(key)) newUser[key] = user[key];
      });
      setUser(newUser);
    }
    // eslint-disable-next-line
  }, [userType]);

  const handleUserTypeChange = (_, newType) => {
    if (newType !== null) {
      setErrors({});
      setWeakPassword({ ...weakPassword, isWeak: false });
      setUserType(newType);
    }
  };

  const handleOnSignInClick = () => {
    history.push('/login');
  };

  const validationSuccessful = () => {
    let valid = true;
    const updatedErrors = { ...errors };
    requiredFields.forEach((field) => {
      if (!_get(user, field)) {
        valid = false;
        _set(updatedErrors, field, t('signUp.errors.isRequired'));
      }
    });

    if (user.password.length < 6) {
      valid = false;
      _set(updatedErrors, 'password', t('signUp.errors.passwordLength'));
    } else if (weakPassword.isWeak && !weakPassword.confirmed) {
      valid = false;
      _set(
        updatedErrors,
        'weakPassword',
        t('signUp.errors.confirmWeakPassword')
      );
    }
    setErrors(updatedErrors);
    return valid;
  };

  const handleSignUp = () => {
    if (!loading) {
      setLoading(true);
      if (validationSuccessful()) {
        API.post('/auth/register', {
          userType,
          user,
        })
          .then((response) => {
            if (response.status === 200) {
              setAlertError(null);
              setLoading(false);
              history.push({
                pathname: '/login',
                search: `?${QUERY_PARAM_REGISTRATION_SUCCESSFUL}`,
              });
            }
          })
          .catch((error) => {
            setLoading(false);
            console.log(error);
            setAlertError(error.response.data);
          });
      } else {
        setAlertError('Please fill out the fields correctly');
        setLoading(false);
      }
    }
  };

  const validateTextField = (field) => {
    const { id, value } = field.target;
    const updatedErrors = { ...errors };
    if (
      (!value || value === '' || value === null) &&
      requiredFields.includes(id)
    ) {
      _set(updatedErrors, id, t('signUp.errors.isRequired'));
      setErrors(updatedErrors);
    } else {
      if (id === 'email' && !EmailValidator.validate(value)) {
        _set(updatedErrors, id, t('signUp.errors.validEmail'));
        setErrors(updatedErrors);
      } else {
        _unset(updatedErrors, id);
        setErrors(updatedErrors);
      }
    }
  };

  const handleKeyPress = (e) => {
    const code = e.keyCode ? e.keyCode : e.which;
    if (code === 13) {
      handleSignUp();
    }
  };

  const textFieldProps = (id, label, required) => {
    const helperText = _get(errors, id);

    return {
      required,
      id,
      label,
      fullWidth: true,
      variant: 'outlined',
      error: Boolean(helperText),
      helperText:
        helperText === t('signUp.errors.isRequired') ? null : helperText,
      value: _get(user, id, ''),
      inputProps: {
        autoComplete: 'new-password',
      },
      onBlur: validateTextField,
      onChange: (e) => {
        if (e.target.id === 'password') {
          const value = e.target.value;
          if (value?.length > 0 && passwordStrength(value).id === 0)
            setWeakPassword({ ...weakPassword, isWeak: true });
          else setWeakPassword({ confirmed: false, isWeak: false });
        }
        const updatedUser = _set({ ...user }, id, e.target.value);
        setUser(updatedUser);
      },
      onKeyPress: handleKeyPress,
    };
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <img
          src={process.env.PUBLIC_URL + '/img/identify.svg'}
          className={classes.logo}
          alt=""
        />

        {alertError ? (
          <Alert className={classes.alert} severity="error">
            {alertError}
          </Alert>
        ) : null}
        <ToggleButtonGroup
          value={userType}
          exclusive
          onChange={handleUserTypeChange}
          className={classes.userTypeToggle}
        >
          <ToggleButton
            value={USER_TYPE.person}
            width="50%"
            className={classes.userTypeToggleButton}
          >
            {t('signUp.person.title')}
          </ToggleButton>
          <ToggleButton
            value={USER_TYPE.business}
            width="50%"
            className={classes.userTypeToggleButton}
          >
            {t('signUp.business.title')}
          </ToggleButton>
        </ToggleButtonGroup>
        <Grid container spacing={2}>
          {userType === USER_TYPE.person ? (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  {...textFieldProps(
                    'firstname',
                    t('signUp.person.firstName'),
                    true
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...textFieldProps('name', t('signUp.person.lastName'), true)}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  {...textFieldProps(
                    'address.street',
                    t('signUp.person.street'),
                    true
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  {...textFieldProps(
                    'address.number',
                    t('signUp.person.number'),
                    true
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...textFieldProps(
                    'address.additional',
                    t('signUp.person.additionalInfo'),
                    false
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  {...textFieldProps(
                    'address.postcode',
                    t('signUp.person.code'),
                    true
                  )}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  {...textFieldProps(
                    'address.city',
                    t('signUp.person.city'),
                    true
                  )}
                />
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <TextField
                autoFocus
                {...textFieldProps(
                  'companyName',
                  t('signUp.business.companyName'),
                  true
                )}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField {...textFieldProps('email', t('signUp.email'), true)} />
          </Grid>
          <Grid item xs={12}>
            <TextField {...textFieldProps('phone', t('signUp.phone'), true)} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...textFieldProps('password', t('signUp.password'), true)}
              type="password"
            />
            {weakPassword.isWeak ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={weakPassword.confirmed}
                    onChange={(e) =>
                      setWeakPassword({
                        ...weakPassword,
                        confirmed: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label={t('signUp.weakPassword')}
                className={errors.weakPassword ? classes.errorText : null}
              />
            ) : null}
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={handleSignUp}
        >
          {loading ? (
            <CircularProgress size={20} color="secondary" />
          ) : (
            <span>{t('signUp.signUp')}</span>
          )}
        </Button>
        <Link onClick={handleOnSignInClick} className={classes.signInButton}>
          {t('signUp.alreadyAccount')}
        </Link>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}

import React, { useEffect, useState } from 'react';
import { useSetStoreValue, useStoreValue } from 'react-context-hook';
import {
  STORE_SHOW_APP_BAR,
  STORE_USER,
  STORE_DEMO_USER,
} from '@lib/constants';
import {
  Button,
  Paper,
  Container,
  Typography,
  TextField,
  Collapse,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { Container as BootstrapContainer, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import API from '@lib/api';

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(3),
  },
  paper: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
    clear: 'both',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  row: {
    margin: theme.spacing(2),
  },
  paperHeader: {
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.54)',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const textFieldProps = {
  size: 'small',
  variant: 'outlined',
  autoComplete: 'off',
  fullWidth: true,
  inputProps: {
    autoComplete: 'off',
  },
};

const Profile = () => {
  const classes = useStyles();
  const setShowAppBar = useSetStoreValue(STORE_SHOW_APP_BAR);
  const demoUser = useStoreValue(STORE_DEMO_USER);
  const [business, setBusiness] = useState();
  const [password, setPassword] = useState();
  const [passwordAlert, setPasswordAlert] = useState({ show: false });
  const [generalAlert, setGeneralAlert] = useState({ show: false });
  const { t } = useTranslation();

  useEffect(() => {
    setShowAppBar(true);
  }, [setShowAppBar]);

  useEffect(() => {
    let mounted = true;
    const user = JSON.parse(localStorage.getItem(STORE_USER));
    API.get(`/business/${user.id}`)
      .then((response) => {
        if (response?.data && mounted) setBusiness(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (passwordAlert.show) {
      setTimeout(() => {
        if (mounted) {
          setPasswordAlert((prev) => {
            return { ...prev, show: false };
          });
        }
      }, 5000);
    }

    return () => {
      mounted = false;
    };
  }, [passwordAlert]);

  useEffect(() => {
    let mounted = true;
    if (generalAlert.show) {
      setTimeout(() => {
        if (mounted) {
          setGeneralAlert((prev) => {
            return { ...prev, show: false };
          });
        }
      }, 5000);
    }

    return () => {
      mounted = false;
    };
  }, [generalAlert]);

  const updatePassword = async () => {
    let mounted = true;

    if (password?.new === password?.confirmedNew && password?.current) {
      API.put(`/business/new-password`, {
        password: password.current,
        newPassword: password.confirmedNew,
      })
        .then(() => {
          if (mounted) {
            setPasswordAlert({
              show: true,
              severity: 'success',
              message: t(
                'business.profile.messages.passwordUpdatedSuccessfully'
              ),
            });
            setPassword({});
          }
        })
        .catch((res) => {
          if (mounted) {
            if (res?.response?.data?.includes('wrong')) {
              setPasswordAlert({
                show: true,
                severity: 'error',
                message: t('business.profile.messages.wrongPassword'),
              });
            } else {
              setPasswordAlert({
                show: true,
                severity: 'error',
                message: t('business.profile.messages.passwordUpdateError'),
              });
              setPassword({});
            }
          }
        });
    } else {
      console.log("Couldn't update password");
    }

    return () => {
      mounted = false;
    };
  };

  const updateBusinessProfile = () => {
    API.put(`/business/${business.id}`, { business })
      .then(() => {
        setGeneralAlert({
          show: true,
          severity: 'success',
          message: t('business.profile.messages.profileUpdatedSuccessfully'),
        });
      })
      .catch(() => {
        setGeneralAlert({
          show: true,
          severity: 'error',
          message: t('business.profile.messages.profileUpdatedSuccessfully'),
        });
      });
  };

  return (
    <div className={classes.main}>
      <Container maxWidth="sm" disableGutters>
        <Typography variant="h4" className="mb-3">
          {t('business.profile.yourProfile')}
        </Typography>
        {demoUser ? (
          <Alert severity="warning">
            {t('business.profile.messages.demoBusiness')}
          </Alert>
        ) : null}
        <Paper className={classes.paper}>
          <BootstrapContainer className="mt-3">
            <Row className={classes.row}>
              <small className={classes.paperHeader}>
                {t('business.profile.generalInformation')}
              </small>
            </Row>
            <Collapse in={generalAlert?.show}>
              <Row>
                <Col>
                  <Alert
                    severity={generalAlert?.severity}
                    onClose={() =>
                      setGeneralAlert((prev) => {
                        return { ...prev, show: false };
                      })
                    }
                  >
                    {generalAlert?.message}
                  </Alert>
                </Col>
              </Row>
            </Collapse>
            <Row className={classes.row}>
              <Col>
                <TextField
                  label={t('business.profile.id')}
                  value={business?.id || ''}
                  {...textFieldProps}
                  disabled
                />
              </Col>
            </Row>
            <Row className={classes.row}>
              <Col>
                <TextField
                  label={t('business.profile.companyName')}
                  value={business?.name || ''}
                  onChange={(e) =>
                    setBusiness((prev) => {
                      return { ...prev, name: e.target.value };
                    })
                  }
                  {...textFieldProps}
                />
              </Col>
            </Row>
            <Row className={classes.row}>
              <Col>
                <TextField
                  label={t('business.profile.email')}
                  value={business?.email || ''}
                  onChange={(e) =>
                    setBusiness((prev) => {
                      return { ...prev, email: e.target.value };
                    })
                  }
                  {...textFieldProps}
                />
              </Col>
            </Row>
            <Row className={classes.row}>
              <Col>
                <TextField
                  label={t('business.profile.phone')}
                  value={business?.phone || ''}
                  onChange={(e) =>
                    setBusiness((prev) => {
                      return { ...prev, phone: e.target.value };
                    })
                  }
                  {...textFieldProps}
                />
              </Col>
            </Row>
            <ButtonRow onClick={updateBusinessProfile} />
          </BootstrapContainer>
        </Paper>
        <Paper className={classes.paper}>
          <BootstrapContainer className="mt-3">
            <Row className={classes.row}>
              <small className={classes.paperHeader}>
                {t('business.profile.changePassword')}
              </small>
            </Row>
            <Collapse in={passwordAlert?.show}>
              <Row>
                <Col>
                  <Alert
                    severity={passwordAlert?.severity}
                    onClose={() =>
                      setPasswordAlert((prev) => {
                        return { ...prev, show: false };
                      })
                    }
                  >
                    {passwordAlert?.message}
                  </Alert>
                </Col>
              </Row>
            </Collapse>
            <Row className={classes.row}>
              <Col>
                <TextField
                  label={t('business.profile.currentPassword')}
                  value={password?.current || ''}
                  onChange={(e) =>
                    setPassword((prev) => {
                      return { ...prev, current: e.target.value };
                    })
                  }
                  type="password"
                  {...textFieldProps}
                />
              </Col>
            </Row>
            <Row className={classes.row}>
              <Col>
                <TextField
                  label={t('business.profile.newPassword')}
                  value={password?.new || ''}
                  onChange={(e) =>
                    setPassword((prev) => {
                      return { ...prev, new: e.target.value };
                    })
                  }
                  type="password"
                  {...textFieldProps}
                />
              </Col>
            </Row>
            <Row className={classes.row}>
              <Col>
                <TextField
                  label={t('business.profile.confirmNewPassword')}
                  value={password?.confirmedNew || ''}
                  onChange={(e) =>
                    setPassword((prev) => {
                      return { ...prev, confirmedNew: e.target.value };
                    })
                  }
                  type="password"
                  {...textFieldProps}
                />
              </Col>
            </Row>
            <ButtonRow onClick={updatePassword} />
          </BootstrapContainer>
        </Paper>
      </Container>
    </div>
  );
};

const ButtonRow = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const demoUser = useStoreValue(STORE_DEMO_USER);

  return (
    <Row className={classes.row + ' mt-4 text-right'}>
      <Col>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={props?.onClick}
          disabled={demoUser}
        >
          {t('business.profile.saveChanges')}
        </Button>
      </Col>
    </Row>
  );
};

export default Profile;

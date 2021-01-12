import React, { useEffect, useState } from 'react';
import { useSetStoreValue, useGetAndSet } from 'react-context-hook';
import {
  STORE_USER,
  STORE_SHOW_APP_BAR,
  STORE_SHOW_LOCATION_DRAWER,
  QUERY_PARAM_LOCATION_ID,
  QUERY_PARAM_NEW_LOCATION,
} from '@lib/constants';
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  Tooltip,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ArrowForward as ArrowForwardIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import Locations from './components/Locations';
import LocationDetailDrawer from './components/LocationDetailDrawer';
import VisitsDrawer from './components/VisitsDrawer';
import StatCharts from './components/StatCharts';
import { useHistory } from 'react-router-dom';
import API from '@lib/api';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(3),
  },
  comparePaper: {
    height: 150,
    padding: theme.spacing(3),
  },
  locations: {
    marginTop: theme.spacing(5),
  },
  widget: {
    // paddingBottom: theme.spacing(3),
    textAlign: 'left',
  },
  locationsHeader: {
    textDecoration: 'underline',
    marginBottom: theme.spacing(3),
  },
  container: {
    maxWidth: '60%',
  },
  noSubscription: {
    color: theme.palette.error.main,
    fontSize: 10,
    verticalAlign: 'middle',
    cursor: 'pointer',
  },
}));

const Home = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const setShowAppBar = useSetStoreValue(STORE_SHOW_APP_BAR);

  const urlParams = new URLSearchParams(props.location.search);
  const id = urlParams.get(QUERY_PARAM_LOCATION_ID);
  const showVisits = urlParams.get('showVisits');
  const newLocation = urlParams.get(QUERY_PARAM_NEW_LOCATION);
  const { t } = useTranslation();

  const [showLocationDrawer, setShowLocationDrawer] = useGetAndSet(
    STORE_SHOW_LOCATION_DRAWER
  );

  const [refetchLocations, setRefetchLocations] = useState(0);
  const [showVisitsDrawer, setShowVisitsDrawer] = useState(false);
  const [currentTier, setCurrentTier] = useState();
  const [tierExpiresInDays, setTierExpiresInDays] = useState();
  const [loading, setLoading] = useState({ currentTier: true });

  useEffect(() => {
    if ((id !== null || newLocation !== null) && showVisits === null) {
      setShowLocationDrawer(true);
    } else if (showVisits !== null) {
      setShowVisitsDrawer(true);
    }
  }, [id, newLocation, setShowLocationDrawer, showVisits]);

  useEffect(() => {
    setShowAppBar(true);
  }, [setShowAppBar]);

  useEffect(() => {
    let mounted = true;
    API.get(`/tier/current`)
      .then((response) => {
        if (response?.data?.tier) {
          const currentTier = response.data;
          if (mounted) {
            setCurrentTier(currentTier);
            setTierExpiresInDays(
              moment(currentTier.tier.expiry).diff(moment(), 'd')
            );
          }
        }
      })
      .catch((error) => {
        if (error.response.status === 402) {
          setCurrentTier({ noTier: true });
        } else {
          console.log(error.response.data);
        }
      })
      .finally(() => {
        setLoading((prev) => {
          return { ...prev, currentTier: false };
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const onLocationDrawerClose = () => {
    setShowLocationDrawer(false);
    history.push('/');
  };

  const onVisitsDrawerClose = () => {
    setShowVisitsDrawer(false);
    history.push('/');
  };

  const onLocationDrawerSave = (isNew, location) => {
    onLocationDrawerClose();
    if (location) {
      if (location._id) delete location._id;
      if (isNew) {
        const business = JSON.parse(localStorage.getItem(STORE_USER));
        location.businessId = business.id;
        history.push('/');
        API.post('/location', { location }).then(() => {
          console.log('add location successfully');
          setRefetchLocations(refetchLocations + 1);
        });
      } else {
        API.put(`/location/${location.id}`, {
          location,
        }).then(() => {
          history.push('/');
          console.log('updated location successfully');
          setRefetchLocations(refetchLocations + 1);
        });
      }
    }
  };

  return (
    <div>
      <div className={classes.main}>
        <Container maxWidth="lg" disableGutters>
          <StatCharts />
          {tierExpiresInDays && tierExpiresInDays <= 7 && (
            <Alert
              variant="filled"
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => history.push('/subscription')}
                >
                  {t('business.home.extend')}
                </Button>
              }
            >
              {t('business.home.alertText', { days: tierExpiresInDays })}
            </Alert>
          )}
          <div className={classes.locations}>
            <Typography variant="h4">
              <span className={classes.locationsHeader}>
                {t('business.home.locations')}
              </span>{' '}
              {loading?.currentTier ? (
                <CircularProgress className="ml-2" size={20} />
              ) : (
                <CurrentTier tier={currentTier} />
              )}
            </Typography>
            <Locations triggerLocationRefetch={refetchLocations} />
            <LocationDetailDrawer
              open={showLocationDrawer}
              onClose={onLocationDrawerClose}
              onSave={onLocationDrawerSave}
              locationId={id}
              usage={currentTier?.usage}
              limit={currentTier?.customLimits || currentTier?.tier?.limits}
            />
            <VisitsDrawer
              open={showVisitsDrawer}
              onClose={onVisitsDrawerClose}
              locationId={id}
            />
          </div>
        </Container>
      </div>
    </div>
  );
};

const CurrentTier = (props) => {
  const { tier } = props;
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation();

  if (tier?.noTier) {
    return (
      <Tooltip
        title={t('business.home.noSubscriptionTooltip')}
        placement="right"
      >
        <span
          className={classes.noSubscription}
          onClick={() => history.push('/subscription')}
        >
          ({t('business.home.noSubscription')})
        </span>
      </Tooltip>
    );
  } else if (tier?.usage?.locations && tier?.tier?.limits?.locations) {
    return `(${tier.usage.locations}/${
      tier?.customLimits?.locations || tier.tier.limits.locations
    })`;
  } else {
    return '';
  }
};

export default Home;

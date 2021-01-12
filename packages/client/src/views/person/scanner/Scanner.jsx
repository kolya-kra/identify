import React, { useEffect, useState } from 'react';
import { useSetStoreValue } from 'react-context-hook';
import { Button, Container, CircularProgress, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert, AlertTitle } from '@material-ui/lab';
import {
  NAVIGATION_BAR_SCANNER_VALUE,
  STORE_NAVIGATION_BAR_VALUE,
  STORE_SHOW_NAVIGATION_BAR,
  STORE_USER,
  STORE_VISIT,
  SOCKET_CHECK_OUT,
  QUERY_PARAM_LOCATION_ID,
} from '@lib/constants';
import QrReader from 'react-qr-reader';
import API from '@lib/api';
import validateUUID from 'uuid-validate';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { calcGpsDistance } from '@lib/helper';
import SocketClient from '@lib/socket';

export const checkInState = {
  TRUE: 'checked-in',
  FALSE: 'checked-out',
  PENDING: 'pending',
  INITIAL: 'initial',
};

const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: '1rem',
  },
  alert: {
    marginTop: theme.spacing(5),
  },
  checkOutButton: {
    marginTop: theme.spacing(5),
  },
  progressIndicator: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  scanner: {
    objectFit: 'fill',
  },
}));

const Scanner = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const setNavigationValue = useSetStoreValue(STORE_NAVIGATION_BAR_VALUE);
  const setShowNavigationBar = useSetStoreValue(STORE_SHOW_NAVIGATION_BAR);
  const [checkInStatus, setCheckInStatus] = useState(checkInState.INITIAL);
  const [visit, setVisit] = useState();
  const [checkInError, setCheckInError] = useState();
  const [startLocation, setStartLocation] = useState();
  const [leftLocation, setLeftLocation] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState();

  useEffect(() => {
    const urlParams = new URLSearchParams(props.location.search);
    const locationId = urlParams.get(QUERY_PARAM_LOCATION_ID);

    if (locationId !== null) {
      console.log('Check in: ' + locationId);
      setCheckInStatus(checkInState.PENDING);
      checkIn(locationId);
    }

    setShowNavigationBar(true);
    setNavigationValue(NAVIGATION_BAR_SCANNER_VALUE);
    const currentVisit = JSON.parse(localStorage.getItem(STORE_VISIT));
    if (currentVisit) {
      setCheckInStatus(checkInState.TRUE);
      setVisit(currentVisit);
    } else setCheckInStatus(checkInState.FALSE);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log(visit);
    let mounted = true;
    const socket = SocketClient.getInstance();
    if (visit) {
      socket.emit('joinRoom', visit.locationId, () => {
        if (mounted) setJoinedRoom(visit.locationId);
      });
    }

    return () => {
      mounted = false;
      if (joinedRoom) {
        console.log('Leaving Room');
        socket.emit('leaveRoom', joinedRoom);
        setJoinedRoom(null);
      }
    };
    // eslint-disable-next-line
  }, [visit]);

  useEffect(() => {
    let mounted = true;
    const socket = SocketClient.getInstance();

    socket.on(SOCKET_CHECK_OUT, (data) => {
      const { locationId } = data;
      if (locationId === visit.locationId) {
        console.log('Check Out triggered by business-owner');
        if (mounted) handleCheckOut();
      }
    });

    return () => {
      mounted = false;
      socket.off(SOCKET_CHECK_OUT);
    };
  }, [visit]);

  const fetchLocation = () => {
    try {
      navigator.geolocation.watchPosition((res) => {
        console.log(res.coords);
        if (!startLocation) {
          setStartLocation({
            latitude: res.coords.latitude,
            longitude: res.coords.longitude,
          });
        } else {
          const maxDistance = 0.1; //in Km
          if (
            calcGpsDistance(
              res.coords.latitude,
              res.coords.longitude,
              startLocation.latitude,
              startLocation.longitude
            ) > maxDistance
          ) {
            setLeftLocation(true);
            console.log('Left location!');
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const checkIn = async (locationId) => {
    const user = JSON.parse(localStorage.getItem(STORE_USER));
    if (user) {
      try {
        const response = await API.post(`/location/${locationId}/checkin`, {
          personId: user.id,
        });
        const visit = response.data;
        localStorage.setItem(STORE_VISIT, JSON.stringify(visit));
        setVisit(visit);
        setCheckInStatus(checkInState.TRUE);
        fetchLocation();
      } catch (error) {
        setCheckInStatus(checkInState.FALSE);
        setCheckInError(error.response.data);
        console.log(error);
      }
    } else {
      setCheckInStatus(checkInState.FALSE);
    }
  };
  const handleCheckOut = async () => {
    const visit = JSON.parse(localStorage.getItem(STORE_VISIT));
    const response = await API.post(`/location/${visit._id}/checkout`);

    localStorage.removeItem(STORE_VISIT);
    console.log(response.data);
    setCheckInStatus(checkInState.FALSE);
  };

  const handleScan = async (data) => {
    if (data) {
      setCheckInStatus(checkInState.PENDING);
    }
    if (data) {
      const urlParams = new URLSearchParams(data.split('?')[1]);
      const locationId = urlParams.get(QUERY_PARAM_LOCATION_ID);

      if (locationId !== null) {
        if (validateUUID(locationId)) checkIn(locationId);
      } else {
        setCheckInStatus(checkInState.FALSE);
      }
    } else {
      setCheckInStatus(checkInState.FALSE);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const Body = () => {
    if (checkInStatus === checkInState.FALSE) {
      return (
        <div>
          {checkInError?.length > 0 && (
            <Alert severity="error" className="mb-3">
              {checkInError}
            </Alert>
          )}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="75vh"
            width="100%"
          >
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
          </Box>
        </div>
      );
    } else if (checkInStatus === checkInState.PENDING) {
      return (
        <>
          <CircularProgress className={classes.progressIndicator} />
          <div>{t('person.checkIn.checkingIn')}</div>
        </>
      );
    } else if (checkInStatus === checkInState.INITIAL) {
      return (
        <>
          <CircularProgress className={classes.progressIndicator} />
          <div>{t('person.checkIn.preparingCheckIn')}</div>
        </>
      );
    } else if (checkInStatus === checkInState.TRUE) {
      const date = moment(visit.checkIn);
      const locName = visit.location.name;
      const locAddress = visit.location.address;

      return (
        <>
          <Alert severity="success" className={classes.alert}>
            <AlertTitle>{t('person.checkIn.checkedIn')}</AlertTitle>
            {t('person.checkIn.time')} {date.format('D.M.YYYY')}{' '}
            {t('person.checkIn.at')} {date.format('HH:mm')}{' '}
            {t('person.checkIn.clock')}
            <br />
            {t('person.checkIn.location')} {locName}
            <br />
            {t('person.checkIn.address')}{' '}
            {locAddress.street +
              ' ' +
              locAddress.number +
              ', ' +
              locAddress.postcode +
              ' ' +
              locAddress.city}
            <br />
            <br />
            {t('person.checkIn.checkInDescription')}
          </Alert>
          <Button
            variant="contained"
            onClick={handleCheckOut}
            className={classes.checkOutButton}
          >
            {t('person.checkIn.checkOut')}
          </Button>
          {leftLocation && (
            <Alert severity="info" className="mt-3">
              You left the location
            </Alert>
          )}
        </>
      );
    }
  };

  return (
    <div>
      <h1 className={classes.title}>{t('person.bottomNavigation.scanner')}</h1>
      <Container maxWidth="sm">
        <Body />
      </Container>
    </div>
  );
};

export default Scanner;

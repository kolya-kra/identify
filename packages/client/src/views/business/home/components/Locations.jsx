import React, { useEffect, useState } from 'react';
import { useSetStoreValue } from 'react-context-hook';
import {
  STORE_SHOW_APP_BAR,
  QUERY_PARAM_LOCATION_ID,
  QUERY_PARAM_NEW_LOCATION,
  SOCKET_CHECK_IN,
  SOCKET_CHECK_OUT,
  LOCATION_ACTIONS,
  STORE_REFETCH_VISITS,
} from '@lib/constants';
import { Container, Fab, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Add as AddIcon } from '@material-ui/icons';
import API from '@lib/api';
import LocationCard from './LocationCard';
import QRCodeModal from './QRCodeModal';
import { useHistory } from 'react-router-dom';
import ConfirmModal from '@components/ConfirmModal';
import SocketClient from '@lib/socket';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  addLocationIcon: {
    marginRight: theme.spacing(1),
  },
  floatingActionButton: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const Locations = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const setShowAppBar = useSetStoreValue(STORE_SHOW_APP_BAR);
  const setRefetchVisits = useSetStoreValue(STORE_REFETCH_VISITS);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({});
  const [refetch, setRefetch] = useState(0);

  const [locations, setLocations] = useState();
  const [locationToUpdate, setLocationToUpdate] = useState({});
  const [joinedRooms, setJoinedRooms] = useState([]);

  useEffect(() => {
    setShowAppBar(true);
  }, [setShowAppBar]);

  useEffect(() => {
    let isMounted = true;
    API.get('/location').then((response) => {
      if (isMounted) setLocations(response.data);
    });
    return () => {
      isMounted = false;
    };
  }, [props.triggerLocationRefetch, refetch]);

  useEffect(() => {
    const socket = SocketClient.getInstance();
    if (locations && locations.length > 0) {
      locations.forEach((location) => {
        socket.emit('joinRoom', location.id, () => {
          setJoinedRooms([...joinedRooms, location.id]);
        });
      });
    }

    return () => {
      if (joinedRooms && joinedRooms.length > 0) {
        console.log('Leaving Rooms');
        joinedRooms.forEach((room) => {
          socket.emit('leaveRoom', room);
        });
        setJoinedRooms([]);
      }
    };
    // eslint-disable-next-line
  }, [locations]);

  useEffect(() => {
    const socket = SocketClient.getInstance();

    socket.on(SOCKET_CHECK_IN, (data) => {
      const { locationId } = data;
      console.log('Check In triggered on: ' + locationId);
      setLocationToUpdate({
        id: locationId,
        action: LOCATION_ACTIONS.checkIn,
      });
    });

    socket.on(SOCKET_CHECK_OUT, (data) => {
      const { locationId } = data;
      console.log('Check Out triggered on: ' + locationId);
      setLocationToUpdate({
        id: locationId,
        action: LOCATION_ACTIONS.checkOut,
      });
    });

    return () => {
      socket.off(SOCKET_CHECK_IN);
      socket.off(SOCKET_CHECK_OUT);
    };
  }, []);

  useEffect(() => {
    if (locationToUpdate && locationToUpdate.id && locationToUpdate.action) {
      const { id, action } = locationToUpdate;

      const locationsClone = [...locations];

      const location = locations.find((location) => location.id === id);
      const currentIndex = locations.indexOf(location);

      if (action === LOCATION_ACTIONS.checkIn) {
        location.visits++;
        setRefetchVisits(location.visits);
      } else if (action === LOCATION_ACTIONS.checkOut) {
        location.visits--;
      }
      locationsClone.splice(currentIndex, 1, location);
      setLocations(locationsClone);
      setLocationToUpdate({});
    }
    // eslint-disable-next-line
  }, [locationToUpdate, locations]);

  const showQRCodeForLocation = (id, name, city) => {
    setCurrentLocation({ id, name, city });
    setShowQRCodeDialog(true);
  };

  const forwardToLocation = (id) => {
    history.push({
      pathname: '/',
      search: `?${QUERY_PARAM_LOCATION_ID}=${id}`,
    });
  };

  const forwardToLocationVisits = (id) => {
    history.push({
      pathname: '/',
      search: `?${QUERY_PARAM_LOCATION_ID}=${id}&showVisits`,
    });
  };

  const handleDeleteLocation = (id) => {
    setCurrentLocation({ id });
    setShowConfirmDialog(true);
  };

  const handleConfirmDeletion = () => {
    setShowConfirmDialog(false);
    API.delete(`/location/${currentLocation.id}`).then(() => {
      setRefetch(refetch + 1);
    });
  };

  return (
    <div>
      {locations?.length > 0 ? (
        <Grid container spacing={3}>
          {locations.map((location, index) => {
            return (
              <Grid item xs={4} key={'location-' + index}>
                <LocationCard
                  category={
                    location?.category[i18n.language] || location?.category?.en
                  }
                  key={'card' + location.id}
                  name={location.name}
                  city={location.address.city}
                  capacity={location.capacity}
                  visits={location.visits}
                  onDetailsClick={() => forwardToLocation(location.id)}
                  onVisitsClick={() => forwardToLocationVisits(location.id)}
                  onDeleteClick={() => handleDeleteLocation(location.id)}
                  onQRCodeClick={() =>
                    showQRCodeForLocation(
                      location.id,
                      location.name,
                      location.address.city
                    )
                  }
                />
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Container>
          <Typography variant="h6">
            {t('business.locations.noLocation')}
          </Typography>
        </Container>
      )}

      <QRCodeModal
        open={showQRCodeDialog}
        onClose={() => setShowQRCodeDialog(false)}
        locationId={currentLocation.id}
        locationName={currentLocation.name + ' - ' + currentLocation.city}
      />

      <ConfirmModal
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmDeletion}
        message={t('business.locations.deleteModalText')}
      />

      <Fab
        variant="extended"
        size="medium"
        color="primary"
        aria-label="add"
        className={classes.floatingActionButton}
        onClick={() => {
          history.push({
            pathname: '/',
            search: `?${QUERY_PARAM_NEW_LOCATION}`,
          });
        }}
      >
        <AddIcon className={classes.addLocationIcon} />
        {t('business.locations.addLocation')}
      </Fab>
    </div>
  );
};

export default Locations;

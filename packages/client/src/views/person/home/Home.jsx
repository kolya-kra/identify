import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Container,
  IconButton,
  Paper,
  InputBase,
  Divider,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Room as RoomIcon, Search as SearchIcon } from '@material-ui/icons';
import API from '@lib/api';
import { useSetStoreValue, useStoreValue } from 'react-context-hook';
import {
  NAVIGATION_BAR_HOME_VALUE,
  STORE_NAVIGATION_BAR_VALUE,
  STORE_SHOW_NAVIGATION_BAR,
  // STORE_HOME_LOCATIONS,
  STORE_HOME_SEARCHTERM,
  STORE_HOME_CURRENT_LOCATION,
  QUERY_PARAM_LOCATION_ID,
  QUERY_PARAM_NEW_LOCATION,
  SOCKET_CHECK_IN,
  SOCKET_CHECK_OUT,
  LOCATION_ACTIONS,
  CONFIGURATION,
  STORE_DEMO_USER,
} from '@lib/constants';
import LocationCard from '@components/LocationCard';
import SocketClient from '@lib/socket';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  logo: {
    marginTop: '1rem',
    width: 150,
  },
  searchbar: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '25px',
    marginTop: '1.5rem',
    position: '-webkit-sticky',
    // eslint-disable-next-line
    position: 'sticky',
    top: '1.5rem',
    zIndex: 100,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  locationList: {
    marginBottom: '4rem',
  },
  picture: {
    position: 'fixed',
    top: '68%',
    left: '50%',
    maxHeight: 300,
    maxWidth: '95%',
    transform: 'translate(-50%, -100%)',
  },
  imgSubtitle: {
    position: 'fixed',
    top: '68%',
    left: '50%',
    transform: 'translate(-50%, 0%)',
  },
}));

const Home = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation();
  const setNavigationValue = useSetStoreValue(STORE_NAVIGATION_BAR_VALUE);
  const setShowNavigationBar = useSetStoreValue(STORE_SHOW_NAVIGATION_BAR);
  const demoUser = useStoreValue(STORE_DEMO_USER);

  const [searchTerm, setSearchTerm] = useState(
    JSON.parse(localStorage.getItem(STORE_HOME_SEARCHTERM)) || ''
  );
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [currentLocation, setCurrentLocation] = useState();
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationToUpdate, setLocationToUpdate] = useState({});
  const [joinedRooms, setJoinedRooms] = useState([]);

  useEffect(() => {
    setShowNavigationBar(true);
    setNavigationValue(NAVIGATION_BAR_HOME_VALUE);
    const path = props.location;
    if (
      path.search.includes(QUERY_PARAM_NEW_LOCATION) ||
      path.search.includes(QUERY_PARAM_LOCATION_ID)
    ) {
      history.push('/');
    }
  });

  useEffect(() => {
    const searchTerm = JSON.parse(localStorage.getItem(STORE_HOME_SEARCHTERM));
    if (searchTerm) {
      setSearchTerm();
      getSearchedLocations();
    } else {
      const currentLocation = JSON.parse(
        localStorage.getItem(STORE_HOME_CURRENT_LOCATION)
      );
      if (currentLocation) setCurrentLocation(currentLocation);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log(locations);
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
    if (currentLocation) {
      localStorage.setItem(
        STORE_HOME_CURRENT_LOCATION,
        JSON.stringify(currentLocation)
      );
      if (currentLocation.useGpsLocations) {
        const params = {
          params: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          },
        };
        const radius = localStorage.getItem(CONFIGURATION.radius);
        API.get(`/location/coordinates/${radius}`, params)
          .then((res) => {
            setLocations(res.data);
            setLocationsLoading(false);
            setNoResultsFound(res.data.length === 0);
          })
          .catch((error) => {
            console.log(error);
            setLocationsLoading(false);
          });
      }
    }
  }, [currentLocation]);

  useEffect(() => {
    const socket = SocketClient.getInstance();

    socket.on(SOCKET_CHECK_IN, (data) => {
      const { locationId } = data;
      console.log('Check In: ' + locationId);
      setLocationToUpdate({
        id: locationId,
        action: LOCATION_ACTIONS.checkIn,
      });
    });

    socket.on(SOCKET_CHECK_OUT, (data) => {
      const { locationId } = data;
      console.log('Check Out: ' + locationId);
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
      } else if (action === LOCATION_ACTIONS.checkOut) {
        location.visits--;
      }
      locationsClone.splice(currentIndex, 1, location);
      setLocations(locationsClone);
      setLocationToUpdate({});
    }
  }, [locationToUpdate, locations]);

  const getSearchedLocations = () => {
    if (searchTerm || searchTerm === '') {
      localStorage.setItem(STORE_HOME_SEARCHTERM, JSON.stringify(searchTerm));

      const params = { params: { term: searchTerm } };
      API.get('/location/search', params)
        .then((res) => {
          setLocations(res.data);
          setLocationsLoading(false);
          setNoResultsFound(res.data.length === 0 && searchTerm !== '');
        })
        .catch((error) => {
          setLocationsLoading(false);
          console.log(error);
        });
    } else {
      localStorage.setItem(STORE_HOME_SEARCHTERM, JSON.stringify(''));
      setLocationsLoading(false);
      setLocations([]);
    }
  };

  const getLocationsByGps = () => {
    setLocationsLoading(true);
    navigator.geolocation.getCurrentPosition((res) => {
      setCurrentLocation({
        useGpsLocations: true,
        latitude: demoUser ? 0 : res.coords.latitude,
        longitude: demoUser ? 0 : res.coords.longitude,
      });
    });
  };

  const onSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCurrentLocation((prev) => {
        return { ...prev, useGpsLocations: false };
      });
      setLocationsLoading(true);
      getSearchedLocations();
      e.preventDefault();
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <img
        src={process.env.PUBLIC_URL + '/img/identify.svg'}
        className={classes.logo}
        alt=""
      />

      <Paper component="form" className={classes.searchbar} elevation={4}>
        <InputBase
          className={classes.input}
          placeholder={t('person.home.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={onSearchKeyPress}
        />

        <IconButton
          className={classes.iconButton}
          onClick={getSearchedLocations}
        >
          <SearchIcon />
        </IconButton>
        <Divider className={classes.divider} orientation="vertical" />
        <IconButton
          color="primary"
          className={classes.iconButton}
          aria-label="Search locations by current position"
          onClick={getLocationsByGps}
        >
          <RoomIcon />
        </IconButton>
      </Paper>
      {/* No Result Found */}
      {noResultsFound ? (
        <Typography>{t('person.home.noResults')}</Typography>
      ) : (
        ''
      )}
      {locations?.length === 0 && !locationsLoading ? (
        <div>
          <img
            src={process.env.PUBLIC_URL + '/img/home-background.svg'}
            className={classes.picture}
            alt=""
          />
          <Typography variant="h6" className={classes.imgSubtitle}>
            {t('person.home.imageSubtitle')}
          </Typography>
        </div>
      ) : locationsLoading ? (
        <div>
          <LocationCard skeleton={true} />
          <LocationCard skeleton={true} />
        </div>
      ) : (
        <div className={classes.locationList}>
          {locations.map((location) => (
            <LocationCard location={location} key={location.id} />
          ))}
        </div>
      )}
    </Container>
  );
};

export default Home;

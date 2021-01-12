import React from 'react';
import { Typography, Card, CardContent, CardMedia } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { makeStyles } from '@material-ui/core/styles';
import { Schedule as ScheduleIcon } from '@material-ui/icons';
import OccupationBar from '@components/OccupationBar';
import moment from 'moment';
import { Img as Image } from 'react-image';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginBottom: '18px',
  },
  content: {
    flex: '1 0 auto',
    textAlign: 'left',
  },
  logoContainer: {
    margin: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  positionIcon: {
    fontSize: 14,
    verticalAlign: 'middle',
    marginBottom: 2,
  },
  smallText: {
    fontSize: 14,
  },
  occupationBar: { marginTop: 5 },
  occupationText: { float: 'left', marginRight: 5, marginTop: -5 },
}));

const LocationCard = (props) => {
  const { t, i18n } = useTranslation();
  const { location, skeleton } = props;
  const classes = useStyles();

  const convertDates = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    if (!checkOut) {
      return moment(checkInDate).format(' HH:mm DD.MM.YYYY');
    } else {
      const checkOutDate = new Date(checkOut);
      return ` ${moment(checkInDate).format('HH:mm')}-${moment(
        checkOutDate
      ).format('HH:mm DD.MM.YYYY')}`;
    }
  };

  const convertDistanceUnit = (distance) => {
    if (distance < 1) {
      return parseInt(distance * 100) + ' m away';
    } else {
      return distance.toFixed(2) + ' km away';
    }
  };

  return skeleton ? (
    <Card className={classes.root} elevation={2}>
      <div className={classes.logoContainer}>
        <Skeleton variant="rect" animation="wave" className={classes.logo} />
      </div>
      <CardContent className={classes.content}>
        <Typography component="h6" variant="h6">
          <Skeleton variant="text" animation="wave" />
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          className={classes.smallText}
        >
          <Skeleton variant="text" animation="wave" />
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          <Skeleton variant="text" animation="wave" />
        </Typography>
      </CardContent>
    </Card>
  ) : (
    <Card key={location.id} className={classes.root} elevation={2}>
      <div className={classes.logoContainer}>
        <CardMedia>
          <Image
            className={classes.logo}
            src={[
              location.imageUrl || '/img/no-image-available.png',
              '/img/no-image-available.png',
            ]}
            alt="Business Logo"
          />
        </CardMedia>
      </div>
      <CardContent className={classes.content}>
        <Typography component="h6" variant="h6">
          {location.name}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {location.address
            ? ` ${location.address.street} ${location.address.number}, ${location.address.city}`
            : ''}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          className={classes.smallText}
        >
          {location?.category[i18n.language]}
          {location.distance
            ? ` · ${convertDistanceUnit(location.distance)}`
            : ''}
        </Typography>
        {/* Occupation Bar */}
        {location.capacity ? (
          <div className={classes.occupationBar}>
            <Typography
              variant="body2"
              color="textSecondary"
              className={classes.occupationText}
            >
              {t('person.locationCard.occupation')}
            </Typography>
            <OccupationBar
              occupation={(location.visits / location.capacity) * 100}
            />
          </div>
        ) : null}
        {/* Checkin Times */}
        {location.checkIn ? (
          <Typography variant="subtitle2" color="textSecondary">
            <ScheduleIcon className={classes.positionIcon} color="inherit" />
            {convertDates(location.checkIn, location.checkOut)}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default LocationCard;

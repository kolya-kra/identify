import React from 'react';
import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Button,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import QRCodeScannerIcon from '@icons/QRCodeScanner';
import { useTranslation } from 'react-i18next';
import { useStoreValue } from 'react-context-hook';
import { STORE_DEMO_USER } from '@lib/constants';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    textAlign: 'left',
    width: '100%',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const LocationCard = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const demoUser = useStoreValue(STORE_DEMO_USER);

  const openQRCodeModal = () => {
    console.log('Show QR Code');
    if (props.onQRCodeClick) props.onQRCodeClick();
  };

  return (
    <Card className={classes.root} variant="outlined" elevation={2}>
      <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          {props.category || 'Location'}
        </Typography>
        <Typography variant="h5" component="h2">
          {props.name || 'Unnamed'}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {props.city || 'No city'}
        </Typography>
        <Typography variant="body2" component="p">
          {t('business.locationCard.capacity')}: {props.capacity || 'N/A'}
          <br />
          {t('business.locationCard.currentVisits')}: {props.visits || 0}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={props.onDetailsClick || null}>
          {t('business.locationCard.detailsAndEdit')}
        </Button>
        <Button size="small" onClick={props.onVisitsClick || null}>
          {t('business.locationCard.visits')}
        </Button>
        <Button
          size="small"
          className={'text-danger'}
          onClick={props.onDeleteClick || null}
          disabled={demoUser}
        >
          {t('business.locationCard.delete')}
        </Button>
        <div style={{ flexGrow: 1 }}></div>
        <IconButton
          color="primary"
          aria-label="qrcode"
          component="span"
          onClick={openQRCodeModal}
        >
          <QRCodeScannerIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default LocationCard;

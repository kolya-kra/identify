import React, { useEffect, useState } from 'react';
import { useSetStoreValue } from 'react-context-hook';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
} from '@material-ui/core';
import { Alert, ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { Star as StarIcon } from '@material-ui/icons';
import {
  STORE_SHOW_APP_BAR,
  SUBSCRIPTION_PERIODS,
  PERIOD_VALUES,
} from '@lib/constants';
import API from '@lib/api';
import PaymentModal from './components/PaymentModal';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  heroContent: {
    marginTop: theme.spacing(7),
    marginBottom: theme.spacing(7),
    padding: theme.spacing(8, 0, 6),
  },
  cardHeader: {
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[200]
        : theme.palette.grey[700],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  cardPricingWrapper: {
    marginBottom: theme.spacing(5),
  },
  alert: {
    textAlign: 'left',
  },
  alertMessage: {
    width: '100%',
    textAlign: 'left',
  },
}));

const Subscription = () => {
  const classes = useStyles();
  const setShowAppBar = useSetStoreValue(STORE_SHOW_APP_BAR);

  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState();
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState({});
  const [currentTier, setCurrentTier] = useState();
  const [noTier, setNoTier] = useState(false);
  const [alert, setAlert] = useState();
  const [payment, setPayment] = useState(PERIOD_VALUES.week);
  const { t } = useTranslation();

  useEffect(() => {
    setShowAppBar(true);
  }, [setShowAppBar]);

  useEffect(() => {
    let mounted = true;

    API.get('/tier')
      .then((response) => {
        if (response && response.data) {
          if (mounted) {
            setLoading(false);
            setTiers(response.data);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });

    fetchCurrentTier();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchCurrentTier = () => {
    API.get('/tier/current')
      .then((response) => {
        if (response && response.data) {
          setCurrentTier(response.data);
        }
      })
      .catch((error) => {
        if (error.response.status === 402) setNoTier(true);
        else console.log(error);
      });
  };

  const handleBooking = (id) => {
    console.log('Book: ' + id);
    setSelectedTier(id);
    setOpenPaymentModal(true);
  };

  const handleContact = () => {
    console.log('Contact us');
    window.location.assign('mailto:enterprise-identify@deskcode.de');
  };

  const onPaymentSuccess = (message) => {
    setOpenPaymentModal(false);
    setAlert({
      severity: 'success',
      message,
    });
    fetchCurrentTier();
  };

  const onPaymentError = (message) => {
    setOpenPaymentModal(false);
    setAlert({
      severity: 'error',
      message,
    });
  };

  const handlePaymentChange = (_, newPayment) => {
    if (newPayment !== null) {
      setPayment(newPayment);
    }
  };

  return (
    <div>
      {/* Hero unit */}
      <Container maxWidth="md" component="main" className={classes.heroContent}>
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          component="p"
        >
          {t('business.subscription.titleText')}
        </Typography>
      </Container>
      {/* End hero unit */}
      <Container maxWidth="lg" component="main">
        <div className="mb-5">
          {noTier && (
            <Alert
              variant="filled"
              severity="error"
              classes={{ root: classes.alert, message: classes.alertMessage }}
            >
              {t('business.subscription.alerts.noActiveSubscription')}
            </Alert>
          )}
          {currentTier && (
            <Alert
              variant="filled"
              severity="success"
              classes={{ root: classes.alert, message: classes.alertMessage }}
            >
              {t('business.subscription.activeSubscription', {
                tier: currentTier.tier.title,
                until: moment(currentTier.tier.expiry).format('DD.MM.YYYY'),
              })}
              <br />
              <br />
              <strong>{t('business.subscription.usage')}:</strong>
              <br />
              {t('business.subscription.seats')}:{' '}
              {currentTier?.usage?.capacity || 'N/A'}/
              <strong>
                {currentTier?.customLimits?.capacity ||
                  currentTier?.tier?.limits?.capacity ||
                  'N/A'}
              </strong>
              <br />
              {t('business.subscription.locations')}:{' '}
              {currentTier?.usage?.locations || 'N/A'}/
              <strong>
                {currentTier?.customLimits?.locations ||
                  currentTier?.tier?.limits?.locations ||
                  'N/A'}
              </strong>
              <br />
              <br />
              {t('business.subscription.extendSubscription')}
            </Alert>
          )}

          {alert && (
            <Alert severity={alert.severity} className="mt-3">
              {alert.message}
            </Alert>
          )}
        </div>
        {!loading && tiers ? (
          <div>
            <ToggleButtonGroup
              value={payment}
              exclusive
              onChange={handlePaymentChange}
              aria-label="text alignment"
              className={'mb-5'}
            >
              <ToggleButton value={PERIOD_VALUES.week}>
                {t('business.subscription.oneWeek')}
              </ToggleButton>
              <ToggleButton value={PERIOD_VALUES.month}>
                {t('business.subscription.oneMonth')}
              </ToggleButton>
              <ToggleButton value={PERIOD_VALUES.year}>
                {t('business.subscription.oneYear')}
              </ToggleButton>
            </ToggleButtonGroup>
            <Grid container spacing={5} alignItems="flex-end">
              {tiers.map((tier, index) => (
                // If amount of tiers is odd the last element is full width at sm breakpoint
                <Grid
                  item
                  key={tier.id}
                  xs={12}
                  sm={
                    tiers.length % 2 === 1 && index === tiers.length - 1
                      ? 12
                      : 6
                  }
                  md={3}
                >
                  <Card>
                    <CardHeader
                      title={tier.title}
                      subheader={
                        tier.favorite && t('business.subscription.mostPopular')
                      }
                      titleTypographyProps={{ align: 'center' }}
                      subheaderTypographyProps={{ align: 'center' }}
                      action={tier.favorite ? <StarIcon /> : null}
                      className={classes.cardHeader}
                    />
                    <CardContent>
                      <CardPricing
                        price={
                          tier.pricing[payment] ||
                          tier.pricing[PERIOD_VALUES.week]
                        }
                        periods={SUBSCRIPTION_PERIODS[payment]}
                      />
                      <ul>
                        {tier.description.map((line) => (
                          <Typography
                            component="li"
                            variant="subtitle1"
                            align="center"
                            key={line}
                          >
                            {line}
                          </Typography>
                        ))}
                      </ul>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant={tier.favorite ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={
                          tier.bookable
                            ? () => handleBooking(tier.id)
                            : handleContact
                        }
                      >
                        {tier.bookable ? 'Book now' : 'Contact us'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        ) : (
          <span>{t('business.subscription.loading')}</span>
        )}
      </Container>
      <PaymentModal
        open={openPaymentModal}
        tier={selectedTier}
        payment={payment}
        onClose={() => setOpenPaymentModal(false)}
        onSuccess={onPaymentSuccess}
        onError={onPaymentError}
      />
    </div>
  );
};

const CardPricing = (props) => {
  const classes = useStyles();
  const tierPrice = props.price;
  const { t } = useTranslation();

  const price = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(tierPrice);

  const periodPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(tierPrice * props.periods);

  return (
    <div className={classes.cardPricingWrapper}>
      <div className={classes.cardPricing}>
        {tierPrice !== -1 ? (
          <>
            <Typography component="h2" variant="h3" color="textPrimary">
              {price}
            </Typography>
            <Typography variant="h6" color="textSecondary">
              /{t('business.subscription.week')}
            </Typography>
          </>
        ) : (
          <Typography component="h2" variant="h3" color="textPrimary">
            &infin;
          </Typography>
        )}
      </div>
      <div>
        {tierPrice !== -1 ? (
          <Typography color="textSecondary">{periodPrice}</Typography>
        ) : (
          <Typography color="textSecondary">
            {t('business.subscription.onRequest')}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default Subscription;

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  CircularProgress,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { PayPalButton } from 'react-paypal-button-v2';
import { SUBSCRIPTION_PERIODS } from '@lib/constants';
import API from '@lib/api';

const useStyles = makeStyles((theme) => ({
  centered: {
    textAlign: 'center',
  },
}));

const PaymentModal = (props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(props.open || false);
  const [tier, setTier] = useState();
  const [price, setPrice] = useState();
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalPending, setPaypalPending] = useState(false);

  const handleClose = () => {
    setOpen(false);
    if (props.onClose) props.onClose();
  };

  useEffect(() => {
    let mounted = true;
    if (props.open) {
      setOpen(true);
      setPaypalPending(false);
      setPaypalReady(true);
      console.log(props.tier);
      API.get(`/tier/${props.tier}`).then((response) => {
        if (response && response.data) {
          if (mounted) {
            const tier = response.data;
            setTier(tier);
            setPrice(
              new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
              }).format(
                tier.pricing[props.payment] *
                  SUBSCRIPTION_PERIODS[props.payment]
              )
            );
          }
        }
      });
    } else {
      setTier(null);
    }
    return () => {
      mounted = false;
    };
  }, [props.open, props.tier, props.payment]);

  return (
    <div>
      <Dialog open={open} onClose={handleClose} disableBackdropClick>
        <DialogContent>
          {tier ? (
            <>
              <DialogContentText>
                You selected: {tier.title}
                <br />
                Pricing: {price}
              </DialogContentText>
              <PayPalButton
                amount={(
                  tier.pricing[props.payment] *
                  SUBSCRIPTION_PERIODS[props.payment]
                ).toFixed(2)}
                shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
                onClick={() => setPaypalPending(true)}
                onSuccess={(details, data) => {
                  console.log(data);
                  console.log(details);

                  API.post(`/tier/${tier.id}/booking`, {
                    orderId: data.orderID,
                    periods: SUBSCRIPTION_PERIODS[props.payment],
                  })
                    .then((response) => {
                      console.log(response);
                      setOpen(false);
                      if (props.onSuccess)
                        props.onSuccess('Booking was successful');
                    })
                    .catch((error) => {
                      setOpen(false);
                      if (props.onError) {
                        if (error && error.response && error.response.data)
                          props.onError(error.response.data);
                      }
                    });
                }}
                onButtonReady={() => {
                  console.log('Button ready');
                  setPaypalReady(true);
                }}
                options={{
                  currency: 'EUR',
                  clientId: process?.env?.REACT_APP_PAYPAL_CLIENT_ID || 'sb',
                }}
              />
              {paypalPending && (
                <div className={classes.centered + ' mt-5 mb-2'}>
                  <CircularProgress />
                </div>
              )}
              {paypalReady ? (
                <div className={classes.centered + ' mt-5 mb-2'}>
                  <Button variant="outlined" onClick={handleClose}>
                    Cancel Booking
                  </Button>
                </div>
              ) : (
                <div className={classes.centered + ' my-5'}>
                  <CircularProgress />
                </div>
              )}
            </>
          ) : (
            <span>Loading</span>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentModal;

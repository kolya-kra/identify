import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { PortableWifiOff as PortableWifiOffIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    top: 0,
    left: 0,
  },
  container: {
    height: '100%',
    position: 'relative',
  },
  verticalCenteredContainer: {
    color: 'white',
    position: 'absolute',
    width: '100%',
    top: '50%',
    margin: 0,
    transform: 'translateY(-50%)',
    '& p': {
      marginTop: 25,
    },
  },
}));

const NoInternetConnection = () => {
  const classes = useStyles();

  return (
    <div className={classes.overlay}>
      <div className={classes.container}>
        <div className={classes.verticalCenteredContainer}>
          <img
            src={process.env.PUBLIC_URL + '/img/identify-white.svg'}
            alt=""
            style={{ height: 50, marginBottom: 20 }}
          />
          <h2>No Internet Connection</h2>
          <PortableWifiOffIcon style={{ fontSize: 50 }} />
          <p style={{ margin: 25 }}>
            Please make sure you're connected to the internet to use Identify
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoInternetConnection;

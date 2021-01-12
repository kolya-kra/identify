import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  spinner: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
  },
}));

const LoadingScreen = () => {
  const classes = useStyles();

  return (
    <div>
      <CircularProgress className={classes.spinner} size={40} />
    </div>
  );
};

export default LoadingScreen;

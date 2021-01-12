import React, { useEffect, useState } from 'react';
import API from '@lib/api';

import {
  Container,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close as CloseIcon } from '@material-ui/icons';
import {
  PROFILE_PAGE_VISITS_HISTORY,
  PROFILE_PAGE_CHANGE_EMAIL,
  PROFILE_PAGE_CHANGE_PASSWORD,
  PROFILE_PAGE_EDIT_INFO,
  PROFILE_PAGE_APP_SETTINGS,
} from '@lib/constants';
import LocationCard from '@components/LocationCard';
import ChangeEmail from './ChangeEmail';
import ChangePassword from './ChangePassword';
import EditContactData from './EditContactData';
import AppSettings from './AppSettings';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'fixed',
    backgroundColor: '#ffffff',
  },
  container: {
    marginTop: '5rem',
  },
  input: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  button: {
    marginTop: theme.spacing(3),
    float: 'right',
  },
  radioButtonGroup: {
    display: 'inline-block',
  },
  radioButton: {
    marginRight: '2rem',
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  slider: {
    width: '95%',
    marginLeft: '2.5%',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProfileDialog = (props) => {
  const classes = useStyles();
  const { closeDialog, dialogOpen, title, content, user } = props;

  //Visits History
  const [visits, setVisits] = useState([]);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
    getVisits();
    return () => {
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userId]);

  const getVisits = () => {
    if (props.userId !== '') {
      API.get(`/person/${props.userId}/visits`)
        .then((res) => {
          if (mounted) setVisits(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const checkContent = () => {
    switch (content) {
      case PROFILE_PAGE_VISITS_HISTORY:
        return (
          <div>
            {visits.map((visit) => (
              <LocationCard location={visit} key={visit._id} />
            ))}
          </div>
        );
      case PROFILE_PAGE_CHANGE_EMAIL:
        return (
          <ChangeEmail
            user={user}
            classes={classes}
            closeDialog={closeDialog}
          />
        );
      case PROFILE_PAGE_CHANGE_PASSWORD:
        return (
          <ChangePassword
            user={user}
            classes={classes}
            closeDialog={closeDialog}
          />
        );
      case PROFILE_PAGE_EDIT_INFO:
        return (
          <EditContactData
            user={user}
            classes={classes}
            closeDialog={closeDialog}
          />
        );
      case PROFILE_PAGE_APP_SETTINGS:
        return (
          <div>
            <AppSettings
              user={user}
              classes={classes}
              closeDialog={closeDialog}
            />
          </div>
        );
      default:
        return '';
    }
  };

  return (
    <Dialog
      fullScreen
      open={dialogOpen}
      onClose={closeDialog}
      TransitionComponent={Transition}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            aria-label="close"
            onClick={() => {
              closeDialog();
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" color={'textPrimary'}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" className={classes.container}>
        {checkContent()}
      </Container>
    </Dialog>
  );
};

export default ProfileDialog;

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSetStoreValue } from 'react-context-hook';
import {
  NAVIGATION_BAR_PROFILE_VALUE,
  STORE_NAVIGATION_BAR_VALUE,
  STORE_SHOW_NAVIGATION_BAR,
  STORE_USER,
  STORE_VISIT,
  PROFILE_PAGE_VISITS_HISTORY,
  PROFILE_PAGE_CHANGE_EMAIL,
  PROFILE_PAGE_CHANGE_PASSWORD,
  PROFILE_PAGE_EDIT_INFO,
  PROFILE_PAGE_APP_SETTINGS,
} from '@lib/constants';
import {
  Avatar,
  Container,
  List,
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Snackbar,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import {
  History as HistoryIcon,
  KeyboardArrowDown as ArrowDownIcon,
  ExitToApp as ExitToAppIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
} from '@material-ui/icons';
import ProfileDialog from './components/ProfileDialog';
import API from '@lib/api';
import ConfirmModal from '@components/ConfirmModal';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  paper: {
    marginBottom: '1.5rem',
    clear: 'both',
  },
  subheader: {
    textAlign: 'left',
  },
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    float: 'left',
    marginBottom: '2rem',
    marginLeft: '1.5rem',
  },
  profileData: {
    float: 'left',
    textAlign: 'left',
    paddingLeft: 20,
  },
  snackbar: {
    marginBottom: theme.spacing(10),
  },
}));

const Profile = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const setNavigationValue = useSetStoreValue(STORE_NAVIGATION_BAR_VALUE);
  const setShowNavigationBar = useSetStoreValue(STORE_SHOW_NAVIGATION_BAR);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [user, setUser] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [alert, setAlert] = useState();
  const [showAlert, setShowAlert] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
    getUserById(JSON.parse(localStorage.getItem(STORE_USER)).id);
    return () => {
      setMounted(false);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setShowNavigationBar(true);
    setNavigationValue(NAVIGATION_BAR_PROFILE_VALUE);
  });

  const openDialog = (title, content) => {
    setDialogOpen(true);
    setDialogTitle(title);
    setDialogContent(content);
  };

  const closeDialog = (alert, updateUser = false) => {
    setDialogOpen(false);
    if (alert?.severity && alert?.message) {
      setAlert(alert);
      setShowAlert(true);
    }
    if (updateUser) {
      getUserById(JSON.parse(localStorage.getItem(STORE_USER)).id);
    }
  };

  const getUserById = (userId) => {
    if (userId !== '') {
      API.get(`/person/${userId}`)
        .then((res) => {
          if (mounted) setUser(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const getAvatarAcronym = (firstname, name) => {
    if (typeof name === 'string') {
      return firstname.charAt(0) + name.charAt(0);
    }
  };

  const handleSignOut = () => {
    if (localStorage.getItem(STORE_VISIT)) {
      console.log('Visit is active');
      setShowConfirmDialog(true);
    } else {
      history.push('/logout');
    }
  };

  return (
    <div>
      <Container component="main" maxWidth="sm">
        <h1 className={classes.title}>{t('person.profile.profile')}</h1>
        <div>
          <Avatar className={classes.avatar} color="primary">
            {getAvatarAcronym(user.firstname, user.name)}
          </Avatar>
          <div className={classes.profileData}>
            <Typography variant="h6">
              {user.firstname} {user.name}
            </Typography>
            <Typography color={'textSecondary'}>{user.email}</Typography>
          </div>
        </div>
        <Paper className={classes.paper}>
          <List
            subheader={
              <ListSubheader component="div" className={classes.subheader}>
                {t('person.profile.profileSettings')}
              </ListSubheader>
            }
          >
            <ListItem button>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText
                primary={t('person.profile.changeEmail')}
                onClick={() =>
                  openDialog(
                    t('person.profile.changeEmail'),
                    PROFILE_PAGE_CHANGE_EMAIL
                  )
                }
              />
              <ListItemSecondaryAction>
                <ArrowDownIcon />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <LockIcon />
              </ListItemIcon>
              <ListItemText
                primary={t('person.profile.changePassword')}
                onClick={() =>
                  openDialog(
                    t('person.profile.changePassword'),
                    PROFILE_PAGE_CHANGE_PASSWORD
                  )
                }
              />
              <ListItemSecondaryAction>
                <ArrowDownIcon />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText
                primary={t('person.profile.editContactInfo')}
                onClick={() =>
                  openDialog(
                    t('person.profile.editContactInfo'),
                    PROFILE_PAGE_EDIT_INFO
                  )
                }
              />
              <ListItemSecondaryAction>
                <ArrowDownIcon />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
        <Paper className={classes.paper}>
          <List>
            <ListItem
              button
              onClick={() =>
                openDialog(
                  t('person.profile.visitsHistory'),
                  PROFILE_PAGE_VISITS_HISTORY
                )
              }
            >
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary={t('person.profile.visitsHistory')} />
              <ListItemSecondaryAction>
                <ArrowDownIcon />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
        <Paper className={classes.paper}>
          <List>
            <ListItem
              button
              onClick={() =>
                openDialog(
                  t('person.profile.appSettings'),
                  PROFILE_PAGE_APP_SETTINGS
                )
              }
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={t('person.profile.appSettings')} />
              <ListItemSecondaryAction>
                <ArrowDownIcon />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
        <Paper className={classes.paper}>
          <List>
            <ListItem button onClick={handleSignOut}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary={t('person.profile.signOut')} />
            </ListItem>
          </List>
        </Paper>
      </Container>
      <ProfileDialog
        closeDialog={closeDialog}
        dialogOpen={dialogOpen}
        userId={user.id}
        content={dialogContent}
        title={dialogTitle}
        user={user}
      />
      <Snackbar
        open={showAlert}
        autoHideDuration={5000}
        className={classes.snackbar}
        onClose={() => setShowAlert(false)}
      >
        <Alert severity={alert?.severity}>{alert?.message}</Alert>
      </Snackbar>
      <ConfirmModal
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => history.push('/logout')}
        message={t('person.profile.signOutMessage')}
      />
    </div>
  );
};

export default Profile;

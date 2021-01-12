import React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { Home as HomeIcon, Person as PersonIcon } from '@material-ui/icons';
import QRCodeScannerIcon from '@icons/QRCodeScanner';
import { useStoreValue } from 'react-context-hook';
import {
  STORE_NAVIGATION_BAR_VALUE,
  NAVIGATION_BAR_SCANNER_VALUE,
  NAVIGATION_BAR_HOME_VALUE,
  NAVIGATION_BAR_PROFILE_VALUE,
} from '@lib/constants';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  bottomNavigation: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
  },
  navigationAction: {
    paddingBottom: theme.spacing(2),
  },
}));

const NavigationBar = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const navigationValue = useStoreValue(STORE_NAVIGATION_BAR_VALUE, '');
  const history = useHistory();

  const handleBottomNavigationChange = (_, newValue) => {
    history.push(`/${newValue}`);
  };

  return (
    <div>
      <BottomNavigation
        value={navigationValue}
        onChange={handleBottomNavigationChange}
        showLabels
        className={classes.bottomNavigation}
      >
        <BottomNavigationAction
          value={NAVIGATION_BAR_SCANNER_VALUE}
          label={t('person.bottomNavigation.scanner')}
          icon={<QRCodeScannerIcon />}
          className={classes.navigationAction}
        />
        <BottomNavigationAction
          value={NAVIGATION_BAR_HOME_VALUE}
          label={t('person.bottomNavigation.home')}
          icon={<HomeIcon />}
          className={classes.navigationAction}
        />
        <BottomNavigationAction
          value={NAVIGATION_BAR_PROFILE_VALUE}
          label={t('person.bottomNavigation.profile')}
          icon={<PersonIcon />}
          className={classes.navigationAction}
        />
      </BottomNavigation>
    </div>
  );
};

export default NavigationBar;

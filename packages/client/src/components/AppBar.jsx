import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#283371',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    fontFamily: 'Helvetica Neue',
    fontWeight: 'bold',
  },
  title: {
    flexGrow: 1,
    textAlign: 'left',
  },
  logo: {
    height: 40,
    cursor: 'pointer',
  },
}));

const Bar = () => {
  const classes = useStyles();
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [languages, setLanguages] = useState();
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);

  useEffect(() => {
    const languages = i18n.options.whitelist.filter(
      (lang) => lang !== 'cimode'
    );
    setSelectedLanguageIndex(languages.indexOf(i18n.language) || 0);
    setLanguages(languages);
    // eslint-disable-next-line
  }, []);

  const openLanguageMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language, index) => {
    i18n.changeLanguage(language);
    setSelectedLanguageIndex(index);
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <div className={classes.title}>
          <img
            src={process.env.PUBLIC_URL + '/img/identify-white.svg'}
            className={classes.logo}
            onClick={() => history.push('/')}
            alt=""
          />
        </div>
        <div>
          <Button
            onClick={() => history.push('/')}
            color="inherit"
            className={classes.menuButton}
          >
            {t('business.appBar.home')}
          </Button>
          <Button
            onClick={() => history.push('/profile')}
            color="inherit"
            className={classes.menuButton}
          >
            {t('business.appBar.profile')}
          </Button>
          <Button
            onClick={() => history.push('/subscription')}
            color="inherit"
            className={classes.menuButton}
          >
            {t('business.appBar.subscriptions')}
          </Button>
          <Button
            onClick={() => history.push('/logout')}
            color="inherit"
            className={classes.menuButton}
          >
            {t('business.appBar.logout')}
          </Button>
          <IconButton
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={openLanguageMenu}
          >
            {languages ? (
              <img
                src={`/img/locales/${languages[selectedLanguageIndex]}.svg`}
                alt=""
                width={30}
              />
            ) : (
              <img src={`/img/locales/en.svg`} alt="" width={30} />
            )}
          </IconButton>
        </div>
        <Menu
          id="language-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {languages &&
            languages.map((language, index) => {
              return (
                <MenuItem
                  onClick={() => handleLanguageChange(language, index)}
                  selected={index === selectedLanguageIndex}
                  key={language}
                >
                  <img src={`/img/locales/${language}.svg`} alt="" width={30} />
                </MenuItem>
              );
            })}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Bar;

import React, { useState, useEffect } from 'react';
import {
  Button,
  Divider,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import {
  LANGUAGE_ENGLISH,
  LANGUAGE_GERMAN,
  CONFIGURATION,
} from '@lib/constants';
import { useTranslation } from 'react-i18next';
import { CustomSlider as Slider } from './Slider';
import API from '@lib/api';

const AppSettings = (props) => {
  const { t, i18n } = useTranslation();
  const { user, classes, closeDialog } = props;

  const [language, setLanguage] = useState(LANGUAGE_ENGLISH);
  const [radius, setRadius] = useState(5);

  useEffect(() => {
    setLanguage(localStorage.getItem('i18nextLng'));
    setRadius(localStorage.getItem(CONFIGURATION.radius));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAppData = () => {
    let configuration = {};
    configuration[CONFIGURATION.language] = language;
    configuration[CONFIGURATION.radius] = radius;
    API.put(`/configuration/${user.id}`, { configuration })
      .then(() => {
        localStorage.setItem(CONFIGURATION.radius, radius);
        localStorage.setItem('i18nextLng', language);
        i18n.changeLanguage(language);
        closeDialog(
          {
            severity: 'success',
            message: t('person.profile.alerts.appSettingsConfirmation'),
          },
          true
        );
      })
      .catch((error) => {
        console.log(error);
        closeDialog({
          severity: 'error',
          message: t('person.profile.alerts.appSettingsError'),
        });
      });
  };
  return (
    <div>
      <FormControl>
        <Typography variant="subtitle1">
          {t('person.profile.appSetting.language')}
        </Typography>
        <RadioGroup
          className={classes.radioButtonGroup}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <FormControlLabel
            className={classes.radioButton}
            value={LANGUAGE_ENGLISH}
            control={<Radio color="primary" />}
            label={t('person.profile.appSetting.english')}
          />
          <FormControlLabel
            className={classes.radioButton}
            value={LANGUAGE_GERMAN}
            control={<Radio color="primary" />}
            label={t('person.profile.appSetting.german')}
          />
        </RadioGroup>
      </FormControl>
      <Divider className={classes.divider} />
      <Typography variant="subtitle1">
        {t('person.profile.appSetting.radius')}
      </Typography>
      <Slider
        className={classes.slider}
        value={radius}
        valueLabelDisplay="auto"
        min={1}
        max={30}
        onChange={(e, newRadius) => setRadius(newRadius)}
      />
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={updateAppData}
      >
        {t('person.profile.appSetting.saveSettings')}
      </Button>
    </div>
  );
};

export default AppSettings;

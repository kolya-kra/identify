import React, { useState } from 'react';
import API from '@lib/api';

import { Button, TextField } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useTranslation } from 'react-i18next';
import * as EmailValidator from 'email-validator';
import { useStoreValue } from 'react-context-hook';
import { STORE_DEMO_USER } from '@lib/constants';

const ChangeEmail = (props) => {
  const { t } = useTranslation();
  const { user, classes, closeDialog } = props;

  const [email, setEmail] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  const demoUser = useStoreValue(STORE_DEMO_USER);

  const updateEmail = () => {
    if (email.length > 0 && EmailValidator.validate(email)) {
      console.log(closeDialog);
      setInvalidEmail(false);
      const person = user;
      person.email = email;
      API.put(`/person/${user.id}`, { person })
        .then(() =>
          closeDialog({
            severity: 'success',
            message: `${t(
              'person.profile.alerts.emailConfirmation'
            )} ${email}!`,
          })
        )
        .catch((error) => {
          console.log(error);
          closeDialog({
            severity: 'error',
            message: t('person.profile.alerts.emailError'),
          });
        });
    } else {
      setInvalidEmail(true);
    }
  };
  return (
    <div>
      {demoUser ? (
        <Alert severity="warning">
          {t('person.profile.alerts.demoUserEmail')}
        </Alert>
      ) : null}
      <TextField
        disabled
        label={t('person.profile.email.currentEmail')}
        defaultValue={user.email}
        variant="outlined"
        className={classes.input}
      />
      <TextField
        error={invalidEmail}
        required
        label={t('person.profile.email.newEmail')}
        variant="outlined"
        type="email"
        className={classes.input}
        onChange={(e) => setEmail(e.target.value)}
        helperText={invalidEmail ? t('person.profile.email.invalidEmail') : ''}
      />
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={updateEmail}
        disabled={demoUser}
      >
        {t('person.profile.email.changeEmail')}
      </Button>
    </div>
  );
};

export default ChangeEmail;

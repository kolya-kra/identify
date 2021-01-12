import React, { useState } from 'react';
import API from '@lib/api';

import { Button, TextField } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useTranslation } from 'react-i18next';
import bcrypt from 'bcryptjs';
import { useStoreValue } from 'react-context-hook';
import { STORE_DEMO_USER } from '@lib/constants';

const ChangePassword = (props) => {
  const { t } = useTranslation();
  const { user, classes, closeDialog } = props;

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmedPassword: '',
  });
  const [invalidPassword, setInvalidPassword] = useState(false);
  const demoUser = useStoreValue(STORE_DEMO_USER);

  const updatePassword = async () => {
    if (await bcrypt.compare(passwords.oldPassword, user.password)) {
      if (passwords.newPassword === passwords.confirmedPassword) {
        const person = user;
        person.password = bcrypt.hashSync(passwords.newPassword, 10);
        API.put(`/person/${user.id}`, { person })
          .then(() =>
            closeDialog({
              severity: 'success',
              message: t('person.profile.alerts.passwordSuccess'),
            })
          )
          .catch((error) => {
            console.log(error);
            closeDialog({
              severity: 'error',
              message: t('person.profile.alerts.passwordError'),
            });
          });
      } else {
        setInvalidPassword(true);
      }
    } else {
      closeDialog({
        severity: 'error',
        message: t('person.profile.alerts.wrongPassword'),
      });
    }
  };
  return (
    <div>
      {demoUser ? (
        <Alert severity="warning">
          {t('person.profile.alerts.demoUserPassword')}
        </Alert>
      ) : null}
      <TextField
        required
        label={t('person.profile.password.currentPassword')}
        variant="outlined"
        type="password"
        className={classes.input}
        onChange={(e) =>
          setPasswords((prev) => {
            return { ...prev, oldPassword: e.target.value };
          })
        }
      />
      <TextField
        required
        label={t('person.profile.password.newPassword')}
        variant="outlined"
        type="password"
        className={classes.input}
        onChange={(e) =>
          setPasswords((prev) => {
            return { ...prev, newPassword: e.target.value };
          })
        }
      />
      <TextField
        error={invalidPassword}
        helperText={invalidPassword ? 'Passwords not equal!' : ''}
        required
        label={t('person.profile.password.repeatPassword')}
        variant="outlined"
        type="password"
        className={classes.input}
        onChange={(e) =>
          setPasswords((prev) => {
            return { ...prev, confirmedPassword: e.target.value };
          })
        }
      />
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={updatePassword}
        disabled={demoUser}
      >
        {t('person.profile.password.changePassword')}
      </Button>
    </div>
  );
};

export default ChangePassword;

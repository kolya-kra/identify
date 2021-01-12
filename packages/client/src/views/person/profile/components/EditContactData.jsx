import React, { useState, useEffect } from 'react';
import API from '@lib/api';

import { Button, TextField, Grid } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useTranslation } from 'react-i18next';
import { useStoreValue } from 'react-context-hook';
import { STORE_DEMO_USER } from '@lib/constants';

const EditContactData = (props) => {
  const { t } = useTranslation();
  const { user, classes, closeDialog } = props;

  const [person, setPerson] = useState({
    firstname: '',
    name: '',
    phone: '',
    address: {
      street: '',
      number: '',
      city: '',
      postcode: '',
      additional: '',
    },
  });
  const [validFields, setValidFields] = useState({
    name: true,
    firstname: true,
    street: true,
    number: true,
    postcode: true,
    city: true,
    phone: true,
  });
  const demoUser = useStoreValue(STORE_DEMO_USER);

  useEffect(() => {
    setPerson(user);
  }, [user]);

  const updatePerson = () => {
    if (validateProfileData()) {
      API.put(`/person/${user.id}`, { person })
        .then(() =>
          closeDialog(
            {
              severity: 'success',
              message: t('person.profile.alerts.profileSuccess'),
            },
            true
          )
        )
        .catch((error) => {
          console.log(error);
          closeDialog({
            severity: 'error',
            message: t('person.profile.alerts.profileError'),
          });
        });
    }
  };

  const validateProfileData = () => {
    let field;
    let valid = true;
    const requiredFields = ['firstname', 'name', 'phone'];
    const requiredAddressFields = ['street', 'number', 'postcode', 'city'];

    for (field of requiredFields) {
      if (!person[field] || person[field].length < 1) {
        valid = false;
        // eslint-disable-next-line
        setValidFields((prev) => {
          return { ...prev, [field]: false };
        });
      } else if (!validFields[field]) {
        // eslint-disable-next-line
        setValidFields((prev) => {
          return { ...prev, [field]: true };
        });
      }
    }

    for (field of requiredAddressFields) {
      if (!person.address[field] || person.address[field].length < 1) {
        valid = false;
        // eslint-disable-next-line
        setValidFields((prev) => {
          return { ...prev, [field]: false };
        });
      } else if (!validFields[field]) {
        // eslint-disable-next-line
        setValidFields((prev) => {
          return { ...prev, [field]: true };
        });
      }
    }
    return valid;
  };

  return (
    <div>
      {demoUser ? (
        <Alert severity="warning">
          {t('person.profile.alerts.demoUserData')}
        </Alert>
      ) : null}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            error={!validFields.firstname}
            className={classes.input}
            variant="outlined"
            required
            fullWidth
            label={t('signUp.person.firstName')}
            value={person?.firstname}
            onChange={(e) =>
              setPerson((prev) => {
                return { ...prev, firstname: e.target.value };
              })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            error={!validFields.name}
            variant="outlined"
            required
            fullWidth
            label={t('signUp.person.lastName')}
            value={person?.name}
            onChange={(e) =>
              setPerson((prev) => {
                return { ...prev, name: e.target.value };
              })
            }
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            error={!validFields.street}
            variant="outlined"
            required
            fullWidth
            label={t('signUp.person.street')}
            value={person?.address?.street}
            onChange={(e) =>
              setPerson((prev) => {
                return {
                  ...prev,
                  address: { ...prev.address, street: e.target.value },
                };
              })
            }
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            error={!validFields.number}
            variant="outlined"
            required
            fullWidth
            label={t('signUp.person.number')}
            value={person?.address?.number}
            onChange={(e) =>
              setPerson((prev) => {
                return {
                  ...prev,
                  address: { ...prev.address, number: e.target.value },
                };
              })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            fullWidth
            label={t('signUp.person.additionalInfo')}
            value={
              person?.address?.additional ? person?.address?.additional : ''
            }
            onChange={(e) =>
              setPerson((prev) => {
                return {
                  ...prev,
                  address: {
                    ...prev.address,
                    additional: e.target.value,
                  },
                };
              })
            }
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            error={!validFields.postcode}
            variant="outlined"
            required
            fullWidth
            label={t('signUp.person.code')}
            value={person?.address?.postcode}
            onChange={(e) =>
              setPerson((prev) => {
                return {
                  ...prev,
                  address: { ...prev.address, postcode: e.target.value },
                };
              })
            }
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            error={!validFields.city}
            variant="outlined"
            required
            fullWidth
            label={t('signUp.person.city')}
            value={person?.address?.city}
            onChange={(e) =>
              setPerson((prev) => {
                return {
                  ...prev,
                  address: { ...prev.address, city: e.target.value },
                };
              })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            error={!validFields.phone}
            required
            variant="outlined"
            fullWidth
            label={t('signUp.phone')}
            value={person?.phone}
            onChange={(e) =>
              setPerson((prev) => {
                return { ...prev, phone: e.target.value };
              })
            }
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={updatePerson}
        disabled={demoUser}
      >
        {t('person.profile.editContactInfo')}
      </Button>
    </div>
  );
};

export default EditContactData;

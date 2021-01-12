import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Drawer,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListSubheader,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@material-ui/core';
import { Container as BootstrapContainer, Row, Col } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import API from '@lib/api';
import { isEquivalent, deepClone } from '@lib/helper';
import ConfirmModal from '@components/ConfirmModal';
import { Img as Image } from 'react-image';
import { Alert } from '@material-ui/lab';
import storage from '@lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import Resizer from 'react-image-file-resizer';
import { useTranslation } from 'react-i18next';
import { useStoreValue } from 'react-context-hook';
import { STORE_DEMO_USER } from '@lib/constants';

const MAX_IMAGE_SIZE = 150;

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: '50%',
    maxWidth: 750,
  },
  header: {
    margin: theme.spacing(3),
    textDecoration: 'underline',
  },
  loadingSpinner: {
    marginTop: theme.spacing(10),
  },
  paper: {
    marginBottom: '1.5rem',
    clear: 'both',
  },
  subheader: {
    textAlign: 'left',
  },
  row: {
    marginBottom: theme.spacing(1),
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  imageWrapper: {
    maxWidth: MAX_IMAGE_SIZE,
    maxHeight: MAX_IMAGE_SIZE,
    display: 'inline-block',
    marginRight: theme.spacing(3),
    '& img': {
      border: '1px solid DarkGray',
      borderRadius: 4,
    },
  },
  demoUserAlert: {
    marginBottom: '1.5rem',
  },
}));

const emptyLocation = {
  address: {},
};

const LocationDetailDrawer = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const demoUser = useStoreValue(STORE_DEMO_USER);

  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isNewLocation, setIsNewLocation] = useState(false);
  const [location, setLocation] = useState();
  const [backupLocation, setBackupLocation] = useState();
  const [categories, setCategories] = useState();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [locationsLeft, setLocationsLeft] = useState(0);
  const [maxLocationsReached, setMaxLocationsReached] = useState(false);
  const [errors, setErrors] = useState();
  const [uploadingImage, setUploadingImage] = useState(false);

  const businessLogoInputRef = useRef();

  useEffect(() => {
    const { usage, limit } = props;
    if (isNewLocation) {
      if (limit && usage) {
        setMaxCapacity(limit.capacity - usage.capacity);
      }
    } else {
      if (limit && usage) {
        setMaxCapacity(
          limit.capacity - usage.capacity + (backupLocation?.capacity || 0)
        );
      }
    }
    setLocationsLeft(limit?.locations - usage?.locations);
    // eslint-disable-next-line
  }, [isNewLocation, props.usage, props.limit, backupLocation]);

  useEffect(() => {
    if (locationsLeft <= 0 && isNewLocation) setMaxLocationsReached(true);
    else setMaxLocationsReached(false);
  }, [locationsLeft, isNewLocation]);

  const handleClose = () => {
    if (isEquivalent(location, backupLocation)) {
      setOpen(false);
      if (props.onClose) props.onClose();
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleDoubleClick = () => {
    setOpen(false);
    if (props.onClose) props.onClose();
  };

  const handleSave = () => {
    if (validateInputFields()) {
      if (!isEquivalent(location, backupLocation)) {
        setOpen(false);
        if (props.onSave) props.onSave(isNewLocation, location);
      } else {
        handleClose();
      }
    }
  };

  const loadLocation = () => {
    setLoading(true);
    setErrors({});
    if (props.locationId) {
      setIsNewLocation(false);
      const requestLocation = API.get(`/location/${props.locationId}`);
      const requestCategories = API.get(`/category`);
      Promise.all([requestLocation, requestCategories])
        .then((responses) => {
          if (mounted) {
            const location = responses[0].data;
            const categories = responses[1].data;
            if (categories) {
              setCategories(categories);
            }
            if (location) {
              setLocation({ ...location });
              setBackupLocation(deepClone(location));
            }
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 400) {
            setOpen(false);
            if (props.onClose) props.onClose();
          }
        });
    } else {
      API.get(`/category`)
        .then((response) => {
          if (mounted) {
            if (response && response.data) setCategories(response.data);
            setIsNewLocation(true);
            setLocation({ ...emptyLocation });
            setBackupLocation(deepClone(emptyLocation));
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    setMounted(true);
    setOpen(props.open);
    if (props.open) loadLocation();

    return () => {
      setMounted(false);
    };
    // eslint-disable-next-line
  }, [props.open]);

  const onTextFieldChange = (key, value) => {
    let updatedLocation = { ...location };
    if (key && !Array.isArray(key)) {
      if (key === 'capacity') {
        if (value <= maxCapacity) {
          updatedLocation.capacity = value;
          if (errors?.capacity) {
            const errorsClone = { ...errors };
            delete errorsClone.capacity;
            setErrors(errorsClone);
          }
        } else {
          setErrors((prev) => {
            return { ...prev, capacity: 'Max. ' + maxCapacity };
          });
        }
      } else {
        updatedLocation[key] = value;
      }
    } else if (key && key.length === 2) {
      updatedLocation[key[0]][key[1]] = value;
    }
    setLocation(updatedLocation);
  };

  const handleConfirmCancellation = () => {
    setShowConfirmDialog(false);
    setOpen(false);
    if (props.onClose) props.onClose();
  };

  const validateInputFields = () => {
    let valid = true;
    const requiredFields = [
      'name',
      ['address', 'street'],
      ['address', 'number'],
      ['address', 'postcode'],
      ['address', 'city'],
      'categoryId',
      'capacity',
    ];
    setErrors({});
    requiredFields.forEach((field) => {
      let value;
      let key;
      if (Array.isArray(field) && field.length === 2) {
        value = location[field[0]][field[1]];
        key = field[1];
      } else if (!Array.isArray(field)) {
        value = location[field];
        key = field;
      }

      if (!value || value === '' || value === 0) {
        valid = false;
        setErrors((prev) => {
          const errors = { ...prev };
          errors[key] = '.';
          return errors;
        });
      }
    });

    return valid;
  };

  const chooseFile = () => {
    const { current } = businessLogoInputRef;
    (current || { click: () => {} }).click();
  };

  const resizeBusinessLogo = (image) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        image,
        MAX_IMAGE_SIZE,
        MAX_IMAGE_SIZE,
        'PNG',
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        'blob'
      );
    });

  const handleImageChange = async (e) => {
    if (e.target.files[0]) {
      setUploadingImage(true);
      const image = e.target.files[0];
      const editedImage = await resizeBusinessLogo(image);

      const uuid = uuidv4();
      const uniqueFileName = `${uuid}-${image.name}`;
      //upload Image
      const uploadTask = storage
        .ref(`business-logos/${uniqueFileName}`)
        .put(editedImage);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // progress function ...
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log('Upload Progress: ' + progress);
          // this.setState({ progress });
        },
        (error) => {
          // Error function ...
          console.log(error);
        },
        () => {
          // complete function ...
          storage
            .ref('business-logos')
            .child(uniqueFileName)
            .getDownloadURL()
            .then((url) => {
              onTextFieldChange('imageUrl', url);
              setUploadingImage(false);
            });
        }
      );
    }
  };

  return (
    <div>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        width="50%"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Container>
          <div className={classes.header}>
            <Typography align="center" variant="h5">
              {t('business.locationDrawer.locationDetails')}
            </Typography>
          </div>
          {demoUser ? (
            <Alert severity="warning" className={classes.demoUserAlert}>
              {t('business.locationDrawer.demoBusinessAlert')}
            </Alert>
          ) : null}
          {maxLocationsReached && (
            <Alert severity="error" className="mb-3">
              {t('business.locationDrawer.reachedLimit')}
            </Alert>
          )}
          {loading ? (
            <Box display="flex" width="100%">
              <Box m="auto">
                <CircularProgress className={classes.loadingSpinner} />
              </Box>
            </Box>
          ) : (
            <div>
              <Paper className={classes.paper}>
                <List
                  subheader={
                    <ListSubheader
                      component="div"
                      className={classes.subheader}
                    >
                      {t(
                        'business.locationDrawer.inputs.generalInformation.title'
                      )}
                    </ListSubheader>
                  }
                >
                  <ListItem>
                    <BootstrapContainer>
                      <Row>
                        <Col className="mb-3">
                          <div className={classes.imageWrapper}>
                            {uploadingImage ? (
                              <Box display="flex" width="100%">
                                <Box m="auto">
                                  <CircularProgress />
                                </Box>
                              </Box>
                            ) : (
                              <Image
                                src={[
                                  location.imageUrl ||
                                    '/img/no-image-available.png',
                                  '/img/no-image-available.png',
                                ]}
                                alt="Business Logo"
                                onClick={chooseFile}
                                style={{ height: '100%', width: '100%' }}
                              />
                            )}
                          </div>
                          <Typography className="d-inline-block">
                            ({t('business.locationDrawer.inputs.clickToEdit')})
                          </Typography>
                          <input
                            onChange={handleImageChange}
                            id="select-business-logo"
                            type="file"
                            ref={businessLogoInputRef}
                            style={{ display: 'none' }}
                          />
                        </Col>
                      </Row>
                      <Row className={classes.row}>
                        <Col>
                          <TextField
                            size="small"
                            label={t(
                              'business.locationDrawer.inputs.generalInformation.id'
                            )}
                            variant="outlined"
                            value={location.id || ''}
                            disabled
                            fullWidth
                          />
                        </Col>
                      </Row>
                      <Row className={classes.row}>
                        <Col>
                          <TextField
                            error={errors?.name?.length > 0 || false}
                            helperText={
                              errors?.name === '.' ? '' : errors?.name
                            }
                            size="small"
                            label={t(
                              'business.locationDrawer.inputs.generalInformation.name'
                            )}
                            variant="outlined"
                            value={location.name || ''}
                            onChange={(e) =>
                              onTextFieldChange('name', e.target.value)
                            }
                            fullWidth
                          />
                        </Col>
                      </Row>
                      <Row className={classes.row}>
                        <Col xs={9}>
                          <TextField
                            error={errors?.street?.length > 0 || false}
                            helperText={
                              errors?.street === '.' ? '' : errors?.street
                            }
                            size="small"
                            label={t(
                              'business.locationDrawer.inputs.generalInformation.street'
                            )}
                            variant="outlined"
                            value={location.address.street || ''}
                            onChange={(e) =>
                              onTextFieldChange(
                                ['address', 'street'],
                                e.target.value
                              )
                            }
                            fullWidth
                          />
                        </Col>
                        <Col>
                          <TextField
                            error={errors?.number?.length > 0 || false}
                            helperText={
                              errors?.number === '.' ? '' : errors?.number
                            }
                            size="small"
                            label={t(
                              'business.locationDrawer.inputs.generalInformation.number'
                            )}
                            variant="outlined"
                            value={location.address.number || ''}
                            onChange={(e) =>
                              onTextFieldChange(
                                ['address', 'number'],
                                e.target.value
                              )
                            }
                            fullWidth
                          />
                        </Col>
                      </Row>
                      <Row className={classes.row}>
                        <Col xs={3}>
                          <TextField
                            error={errors?.postcode?.length > 0 || false}
                            helperText={
                              errors?.postcode === '.' ? '' : errors?.postcode
                            }
                            size="small"
                            label={t(
                              'business.locationDrawer.inputs.generalInformation.postcode'
                            )}
                            variant="outlined"
                            value={location.address.postcode || ''}
                            onChange={(e) =>
                              onTextFieldChange(
                                ['address', 'postcode'],
                                e.target.value
                              )
                            }
                            fullWidth
                          />
                        </Col>
                        <Col>
                          <TextField
                            error={errors?.city?.length > 0 || false}
                            helperText={
                              errors?.city === '.' ? '' : errors?.city
                            }
                            size="small"
                            label={t(
                              'business.locationDrawer.inputs.generalInformation.city'
                            )}
                            variant="outlined"
                            value={location.address.city || ''}
                            onChange={(e) =>
                              onTextFieldChange(
                                ['address', 'city'],
                                e.target.value
                              )
                            }
                            fullWidth
                          />
                        </Col>
                      </Row>
                    </BootstrapContainer>
                  </ListItem>
                </List>
              </Paper>
              <Paper className={classes.paper}>
                <List
                  subheader={
                    <ListSubheader
                      component="div"
                      className={classes.subheader}
                    >
                      {t(
                        'business.locationDrawer.inputs.categoryAndCapacity.title'
                      )}
                    </ListSubheader>
                  }
                >
                  <ListItem>
                    <BootstrapContainer>
                      {isNewLocation && (
                        <Row className={classes.row}>
                          <Col>
                            <Typography variant="subtitle2">
                              Capacity left: {maxCapacity}
                            </Typography>
                          </Col>
                        </Row>
                      )}
                      <Row className={classes.row}>
                        <Col>
                          <FormControl
                            variant="outlined"
                            className={classes.formControl}
                            size="small"
                            error={errors?.categoryId?.length > 0}
                            fullWidth
                          >
                            <InputLabel id="category-label">
                              {t(
                                'business.locationDrawer.inputs.categoryAndCapacity.category'
                              )}
                            </InputLabel>
                            <Select
                              labelId="category-label"
                              id="category"
                              value={location.categoryId || ''}
                              label="Category"
                              onChange={(e) =>
                                onTextFieldChange('categoryId', e.target.value)
                              }
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {categories.map((category) => {
                                return (
                                  <MenuItem
                                    value={category.id}
                                    key={category.id}
                                  >
                                    {category.names.en}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                            {errors?.categoryId && (
                              <FormHelperText>
                                {errors?.categoryId === '.'
                                  ? ''
                                  : errors?.categoryId}
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Col>
                        <Col>
                          <TextField
                            error={errors?.capacity?.length > 0}
                            helperText={
                              errors?.capacity === '.' ? '' : errors?.capacity
                            }
                            size="small"
                            label={t(
                              'business.locationDrawer.inputs.categoryAndCapacity.capacity'
                            )}
                            variant="outlined"
                            value={location.capacity || ''}
                            onChange={(e) =>
                              onTextFieldChange(
                                'capacity',
                                parseInt(e.target.value) || 0
                              )
                            }
                            fullWidth
                          />
                        </Col>
                      </Row>
                    </BootstrapContainer>
                  </ListItem>
                </List>
              </Paper>
              <BootstrapContainer className="text-right">
                <Row className={classes.row}>
                  <Col>
                    <Button
                      variant="contained"
                      className={classes.button}
                      onClick={handleClose}
                      onDoubleClick={handleDoubleClick}
                    >
                      {t('business.locationDrawer.cancel')}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      onClick={handleSave}
                      disabled={maxLocationsReached || demoUser}
                    >
                      {t('business.locationDrawer.save')}
                    </Button>
                  </Col>
                </Row>
              </BootstrapContainer>
            </div>
          )}
        </Container>
      </Drawer>

      <ConfirmModal
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmCancellation}
        message={
          'You made some unsaved changes! Are you sure you want to exit without saving?'
        }
      />
    </div>
  );
};

export default LocationDetailDrawer;

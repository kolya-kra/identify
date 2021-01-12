import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const ConfirmModal = (props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(props.open);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const handleClose = () => {
    setOpen(false);
    if (props.onClose) props.onClose();
  };

  const handleConfirm = () => {
    setOpen(false);
    if (props.onConfirm) props.onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {t('confirmationModal.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.message || t('confirmationModal.defaultMessage')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {t('confirmationModal.no')}
        </Button>
        <Button onClick={handleConfirm} color="primary" autoFocus>
          {t('confirmationModal.yes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;

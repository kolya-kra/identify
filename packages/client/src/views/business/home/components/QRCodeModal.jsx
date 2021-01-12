import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';

const qrCodeBaseDomain =
  process?.env?.REACT_APP_QR_BASE_DOMAIN ||
  'https://identify.deskcode.de/scanner?locationId=';

const QRCodeModal = (props) => {
  const [open, setOpen] = useState(props.open);
  const { t } = useTranslation();

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const handleClose = () => {
    setOpen(false);
    if (props.onClose) props.onClose();
  };

  const handleSave = () => {
    const input = document.getElementById('qr-code-wrapper-div');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg');
      const pdf = new jsPDF();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const qrCode = {
        width: 120,
        height: 120,
      };

      pdf.setFontSize(40);
      pdf.text('Just Check-In', pageWidth / 2, 50, { align: 'center' });
      if (props.locationName) {
        pdf.setFontSize(30);
        pdf.text(props.locationName, pageWidth / 2, 70, { align: 'center' });
      }

      pdf.addImage(
        imgData,
        'JPEG',
        (pageWidth - qrCode.width) / 2,
        (pageHeight - qrCode.height) / 2 + 30,
        qrCode.width,
        qrCode.height
      );

      const pdfName = props.locationName.replace(/ /g, '');
      pdf.save(pdfName.toLowerCase() + '-check-in-code.pdf');
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      maxWidth="md"
    >
      <DialogTitle id="form-dialog-title">QR Code</DialogTitle>
      <DialogContent>
        <div id="qr-code-wrapper-div">
          <QRCode
            value={qrCodeBaseDomain + props.locationId}
            size={200}
            renderAs="svg"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary">
          {t('modals.save')}
        </Button>
        <Button onClick={handleClose} color="primary">
          {t('modals.ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeModal;

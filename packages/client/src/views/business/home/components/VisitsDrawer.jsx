import React, { useEffect, useState } from 'react';
import {
  Container,
  Drawer,
  Typography,
  Box,
  CircularProgress,
  Button,
  Tooltip,
} from '@material-ui/core';
import { Check as CheckIcon, Close as CloseIcon } from '@material-ui/icons';
import { STORE_REFETCH_VISITS } from '@lib/constants';
import { useStoreValue } from 'react-context-hook';
import { makeStyles } from '@material-ui/core/styles';
import API from '@lib/api';
import VisitCard from './VisitCard';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: '50%',
    maxWidth: 750,
  },
  header: {
    margin: theme.spacing(3),
    textDecoration: 'underline',
  },
  centered: {
    textAlign: 'center',
  },
  exportButton: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    maxWidth: 200,
  },
}));

const LocationDetailDrawer = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState();
  const [showExportButton, setShowExportButton] = useState(true);
  const [exportPending, setExportPending] = useState(false);
  const [exportFinished, setExportFinished] = useState();

  const refetchVisits = useStoreValue(STORE_REFETCH_VISITS);

  const handleClose = () => {
    setOpen(false);
    if (props.onClose) props.onClose();
  };

  const loadVisits = () => {
    setLoading(true);
    fetchVisits();
  };

  const fetchVisits = () => {
    if (props.locationId) {
      API.get(`/location/${props.locationId}/visits/current`)
        .then((response) => {
          const visits = response.data;
          visits.sort(function (a, b) {
            return a.checkIn - b.checkIn;
          });
          if (visits) {
            setVisits(visits);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    fetchVisits();
    // eslint-disable-next-line
  }, [refetchVisits]);

  useEffect(() => {
    setOpen(props.open);
    if (props.open) {
      setExportFinished(null);
      setExportPending(false);
      setShowExportButton(true);
      loadVisits();
    }
    // eslint-disable-next-line
  }, [props.open]);

  useEffect(() => {
    let mounted = true;
    if (exportFinished) {
      setTimeout(() => {
        if (mounted) {
          setShowExportButton(false);
        }
      }, 5000);
    }

    return () => {
      mounted = false;
    };
  }, [exportFinished]);

  const handleCheckOut = (id) => {
    const visitsClone = [...visits];
    setVisits(visitsClone.filter((visit) => visit._id !== id));
  };

  const handleExport = () => {
    setExportPending(true);
    API.post(`/location/${props.locationId}/send-csv-export`)
      .then(() => {
        setExportPending(false);
        setExportFinished('success');
      })
      .catch((error) => {
        console.log(error);
        setExportPending(false);
        setExportFinished('error');
      });
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
              {t('business.visitDrawer.currentVisits')}
            </Typography>
          </div>
          {loading ? (
            <Box display="flex" width="100%">
              <Box m="auto">
                <CircularProgress className={classes.loadingSpinner} />
              </Box>
            </Box>
          ) : (
            <div style={{ maxHeight: '100%', overflow: 'auto' }}>
              {visits && visits.length > 0 ? (
                visits.map((visit) => {
                  return (
                    <VisitCard
                      key={visit._id}
                      visit={visit}
                      onCheckOut={() => handleCheckOut(visit._id)}
                    />
                  );
                })
              ) : (
                <div className={classes.centered}>
                  {t('business.visitDrawer.noVisits')}
                </div>
              )}
            </div>
          )}
          {showExportButton && (
            <Tooltip title={t('business.visitDrawer.sendToHealthDepartment')}>
              <Button className={classes.exportButton} onClick={handleExport}>
                {!exportFinished &&
                  !exportPending &&
                  t('business.visitDrawer.exportVisits')}
                {exportPending && <CircularProgress size={20} />}
                {exportFinished && exportFinished === 'success' && (
                  <CheckIcon className="text-success" />
                )}
                {exportFinished && exportFinished === 'error' && (
                  <CloseIcon className="text-danger" />
                )}
              </Button>
            </Tooltip>
          )}
        </Container>
      </Drawer>
    </div>
  );
};

export default LocationDetailDrawer;

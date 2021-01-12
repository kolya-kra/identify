import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CWidgetDropdown } from '@coreui/react';
import ChartLineSimple from '@components/charts/ChartLineSimple';
import ChartBarSimple from '@components/charts/ChartBarSimple';
import API from '@lib/api';
import { useTranslation } from 'react-i18next';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  widget: {
    textAlign: 'left',
  },
}));

const StatCharts = () => {
  const classes = useStyles();
  const [chartData, setChartData] = useState();
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;
    API.get('/stats')
      .then((response) => {
        if (response && response.data && isMounted) {
          setChartData(response.data);
        }
      })
      .catch((error) => {
        console.log(error.response.data);
      });
    return () => {
      isMounted = false;
    };
  }, [setChartData]);

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <CWidgetDropdown
            color="gradient-warning"
            header={String(chartData?.averageVisits || 'N/A')}
            text={t('business.charts.averagePerDay')}
            className={classes.widget}
            footerSlot={
              <ChartLineSimple
                pointed
                className="c-chart-wrapper mt-3 mx-3"
                style={{ height: '70px' }}
                dataPoints={chartData?.visits || []}
                pointHoverBackgroundColor="warning"
                label={t('business.charts.visits')}
                labels={t('business.charts.days')}
              />
            }
          />
        </Grid>
        <Grid item xs={4}>
          <CWidgetDropdown
            color="gradient-primary"
            header={String(chartData?.totalVisits || 'N/A')}
            text={t('business.charts.totalVisits')}
            className={classes.widget}
            footerSlot={
              <ChartLineSimple
                className="mt-3"
                style={{ height: '70px' }}
                backgroundColor="rgba(255,255,255,.2)"
                dataPoints={chartData?.visits || []}
                options={{ elements: { line: { borderWidth: 2.5 } } }}
                pointHoverBackgroundColor="primary"
                label={t('business.charts.visits')}
                labels={t('business.charts.days')}
              />
            }
          />
        </Grid>
        <Grid item xs={4}>
          <CWidgetDropdown
            color="gradient-info"
            header={String(chartData?.averageOccupation || 'N/A') + ' %'}
            text={t('business.charts.averageOccupation')}
            className={classes.widget}
            footerSlot={
              <ChartBarSimple
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                dataPoints={chartData?.occupations || []}
                backgroundColor="secondary"
                label={t('business.charts.occupation')}
                labels={t('business.charts.day')}
              />
            }
          />
        </Grid>
      </Grid>
      {!chartData?.visits && (
        <Alert severity="warning">{t('business.charts.notEnoughData')}</Alert>
      )}
    </div>
  );
};

export default StatCharts;

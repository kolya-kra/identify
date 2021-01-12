import React from 'react';
import { Button, Paper, Typography } from '@material-ui/core';
import { ExitToApp as ExitToAppIcon } from '@material-ui/icons';
import { Row, Col } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import API from '@lib/api';

const useStyles = makeStyles((theme) => ({
  row: {
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  checkInTime: {
    fontWeight: 'bold',
  },
  button: {
    margin: theme.spacing(1),
  },
  checkInCol: {
    marginLeft: theme.spacing(2),
    width: 100,
  },
}));

const VisitCard = (props) => {
  const classes = useStyles();

  const { checkIn, visitor } = props.visit;
  const visitId = props.visit._id;

  const handleCheckOut = () => {
    API.post(`/location/${visitId}/checkout`).then((response) => {
      if (response.status === 200) {
        if (props.onCheckOut) props.onCheckOut();
      }
    });
  };

  return (
    <Paper elevation={2}>
      <Row className={classes.row}>
        <Col xs={2} className={classes.checkInCol}>
          <CheckInTime time={checkIn} />
        </Col>
        <Col>
          <Typography>
            {visitor.firstname} {visitor.name}
          </Typography>
        </Col>
        <Col xs="auto">
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            size="small"
            onClick={handleCheckOut}
            startIcon={<ExitToAppIcon />}
          >
            Check-Out
          </Button>
        </Col>
      </Row>
    </Paper>
  );
};

const CheckInTime = (props) => {
  const classes = useStyles();
  const checkIn = moment(props.time);
  const duration = moment.duration(moment().diff(checkIn));
  return (
    <span className={classes.checkInTime}>
      {duration.hours()}h {duration.minutes()}m
    </span>
  );
};

export default VisitCard;

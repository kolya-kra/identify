import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@material-ui/core';
import {
  Home as HomeIcon,
  LocationCity as LocationItem,
} from '@material-ui/icons';

const useStyles = makeStyles({
  bottomNavigation: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

const NavigationDrawer = (props) => {
  const classes = useStyles();
  const history = useHistory();

  const [open, setOpen] = useState(props.open);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onDrawerClose = () => {
    setOpen(false);
    if (props.onClose) props.onClose();
  };

  const handleOnItemClick = (path) => {
    history.push(`/${path}`);
  };

  return (
    <div>
      <Drawer open={open} onClose={onDrawerClose}>
        <div
          className={classes.list}
          role="presentation"
          onClick={onDrawerClose}
        >
          <List>
            <ListItem button onClick={() => handleOnItemClick('')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem
              button
              onClick={() => handleOnItemClick('manage/locations')}
            >
              <ListItemIcon>
                <LocationItem />
              </ListItemIcon>
              <ListItemText primary="Locations" />
            </ListItem>
          </List>
        </div>
      </Drawer>
    </div>
  );
};

export default NavigationDrawer;

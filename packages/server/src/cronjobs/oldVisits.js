import { removeOutdatedVisits } from '@api/location/location.service';

const visitRemover = () => {
  console.log('Start removing outdated visits');
  removeOutdatedVisits();
};

module.exports = visitRemover;

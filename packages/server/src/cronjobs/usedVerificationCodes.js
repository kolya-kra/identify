import { removeUsedVerificationCodes } from '@api/auth/auth.service';

const removeCodes = () => {
  console.log('Start removing used verification codes');
  removeUsedVerificationCodes();
};

module.exports = removeCodes;

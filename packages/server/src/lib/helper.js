import Axios from 'axios';

export const blockTempMail = async (email) => {
  return new Promise(async (resolve, reject) => {
    let valid = false;
    try {
      const response = await Axios.get(
        `https://block-temporary-email.com/check/email/${email}`,
        {
          mode: 'no-cors',
        }
      );
      if (
        response?.data?.status === 200 &&
        response?.data?.dns &&
        !response?.data?.temporary
      ) {
        valid = true;
      }
    } catch (error) {
      console.log(error);
      return reject(error);
    }
    if (!valid) {
      return reject('Please do not use temporary mail addresses');
    } else {
      return resolve(true);
    }
  });
};

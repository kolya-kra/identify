import socketIOClient from 'socket.io-client';
const ENDPOINT =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://identify-api.deskcode.de';

const socket = (function () {
  let instance;

  function createInstance() {
    const socket = socketIOClient(ENDPOINT);
    return socket;
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

export default socket;

import firebase from 'firebase/app';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA--F2btBFJN_7VO_ZhoCP2qi5mqJqluZs',
  authDomain: 'identify-cd2e2.firebaseapp.com',
  projectId: 'identify-cd2e2',
  storageBucket: 'identify-cd2e2.appspot.com',
  messagingSenderId: '1028631948704',
  appId: '1:1028631948704:web:cb5187752e964a86aec8c5',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export { firebase, storage as default };

import firebase from 'firebase/app';
import {firebaseConfig} from './config';

export default function initFirebase() {
  const app = firebase.initializeApp(firebaseConfig);
  return app;
}

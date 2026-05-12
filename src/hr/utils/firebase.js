import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSCiRQBu1BRegXOmsECIFGJlauCjox1_o",
  authDomain: "zexora-hr.firebaseapp.com",
  projectId: "zexora-hr",
  storageBucket: "zexora-hr.firebasestorage.app",
  messagingSenderId: "30431401463",
  appId: "1:30431401463:web:93897b74bf7ca2cb028af2",
  measurementId: "G-W45ZXE0SXB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";

import { getMessaging } from "firebase/messaging";

//Firebase Config values imported from .env file
const firebaseConfig = {
  apiKey: "AIzaSyD3KD3NN__eMvpXbBu0c6-E2_7S2aptDZg",
  authDomain: "tplus-cf7d9.firebaseapp.com",
  projectId: "tplus-cf7d9",
  storageBucket: "tplus-cf7d9.appspot.com",
  messagingSenderId: "532894246194",
  appId: "1:532894246194:web:2f2f93ab2e15df0adf232b",
  measurementId: "G-3PDLM5MLK8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Messaging service
export const messaging = getMessaging(app)
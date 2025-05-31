// Import Firebase core functions and services
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Firebase Configuration Object
// Replace these values with your actual Firebase project settings
// (These are available in Firebase Console > Project Settings > General)
const firebaseConfig = {
  apiKey: "",              // Unique API key for your Firebase project
  authDomain: "",          // Auth domain used for authentication
  projectId: "",           // Project ID of your Firebase project
  storageBucket: "",       // Cloud Storage bucket for file uploads
  messagingSenderId: "",   // Sender ID used for push notifications (optional)
  appId: "",               // Unique identifier for your web app
  measurementId: ""        // Used for Google Analytics (optional)
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Firestore Database and export it for use in your app
export const db = getFirestore(app);

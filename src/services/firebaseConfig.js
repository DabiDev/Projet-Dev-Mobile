import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your actual Firebase config keys
const firebaseConfig = {
  apiKey: "AIzaSyCg1VQekaMX2L8iZaVci7zD0sHIMJliLqI",
  authDomain: "fitnessapp-8b2d2.firebaseapp.com",
  projectId: "fitnessapp-8b2d2",
  storageBucket: "fitnessapp-8b2d2.firebasestorage.app",
  messagingSenderId: "694022014404",
  appId: "1:694022014404:web:204274a1a1a7ad35195091"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native Persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);

// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword , sendPasswordResetEmail, signOut} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, query, where,onSnapshot, arrayRemove, arrayUnion, orderBy, Timestamp, limit, writeBatch } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, uploadBytes, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";

// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export {
  db,
  auth,
  firebaseApp,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  arrayRemove,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  getDocs,
  query,
  where,
  listAll,
  deleteObject,
  ref,
  uploadBytesResumable,
  uploadBytes,
  getDownloadURL,
  onSnapshot,
  addDoc,
  orderBy,
  Timestamp,
  limit,
  writeBatch
};
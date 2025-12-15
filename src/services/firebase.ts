// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBQRkCfj-nZCIOdvoYUCwsAnTisoqvE5XA",
    authDomain: "designer-app-6c79f.firebaseapp.com",
    projectId: "designer-app-6c79f",
    storageBucket: "designer-app-6c79f.firebasestorage.app",
    messagingSenderId: "127264309804",
    appId: "1:127264309804:web:2abfcf425cd8407fce0789",
    measurementId: "G-SNBYDG91E4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
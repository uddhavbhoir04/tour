// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// //temporary souls firebase
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: "mern-travel-tourism.firebaseapp.com",
//   projectId: "mern-travel-tourism",
//   storageBucket: "mern-travel-tourism.appspot.com",
//   messagingSenderId: "304378877141",
//   appId: "1:304378877141:web:3bddab2778ca23186f7e5c",
// };

// // Initialize Firebase
// export const app = initializeApp(firebaseConfig);



// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-travel-tourism.firebaseapp.com",
  projectId: "mern-travel-tourism",
  storageBucket: "mern-travel-tourism.appspot.com",
  messagingSenderId: "304378877141",
  appId: "1:304378877141:web:3bddab2778ca23186f7e5c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ this fixes your storage import
export default app;

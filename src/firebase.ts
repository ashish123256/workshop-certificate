// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth , GoogleAuthProvider, EmailAuthProvider} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  // apiKey: "",
  // authDomain: "",
  // projectId: "workshop-certificate",
  // storageBucket: "workshop-certificate.firebasestorage.app",
  // messagingSenderId: "55169835163",
  // appId: "",
  // measurementId: ""

  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app)

export const providers = {
    google: new GoogleAuthProvider(),
    email: new EmailAuthProvider()
};


export const authErrorMessages = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'User disabled',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'auth/weak-password': 'Weak password',
    'auth/email-already-in-use': 'Email already in use',

}

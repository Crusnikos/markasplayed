import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

export default firebase;

export type LoginRequest = {
  email: string;
  password: string;
};

export async function SignIn(props: {
  formData: LoginRequest;
}): Promise<firebase.auth.UserCredential> {
  const { email, password } = props.formData;

  return await firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function SignOut(): Promise<boolean> {
  await firebase.auth().signOut();

  return true;
}

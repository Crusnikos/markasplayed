if (!process.env.REACT_APP_API_URL) {
  throw new Error("REACT_APP_API_URL environmental variable is missing");
}

export const settings = {
  url: process.env.REACT_APP_API_URL,
};

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export type Paged<Data> = {
  data: Data;
  totalCount: number;
  page: number;
};

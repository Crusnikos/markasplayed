import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type LoginRequest = {
  email: string;
  password: string;
};

type firebaseAuthType = {
  app: firebase.app.App;
  user: firebase.User | null;
  authenticated: boolean;
};

type FirebasePattern = {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
} | null;

export const FirebaseDataContext = createContext<Partial<firebaseAuthType>>({});

export const useFirebaseAuth: () => Partial<firebaseAuthType> = () =>
  useContext(FirebaseDataContext);

export function FirebaseAuthProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: FirebasePattern;
}): JSX.Element {
  const [appInit, setAppInit] = useState<firebase.app.App | null>(null);
  const [user, setUser] = useState(null as firebase.User | null);

  useEffect(() => {
    const initializedFirebase = firebase.initializeApp({
      apiKey: config?.apiKey,
      authDomain: config?.authDomain,
      projectId: config?.projectId,
      storageBucket: config?.storageBucket,
      messagingSenderId: config?.messagingSenderId,
      appId: config?.appId,
    });
    setAppInit(initializedFirebase);

    initializedFirebase
      .auth()
      .onAuthStateChanged((user: firebase.User | null) => {
        setUser(user);
      });
  }, [config]);

  return (
    <FirebaseDataContext.Provider
      value={{
        app: appInit!,
        user,
        authenticated: user !== null,
      }}
    >
      {children}
    </FirebaseDataContext.Provider>
  );
}

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import firebase from "./user/firebase";

type ContextProps = {
  user: firebase.User | null;
  authenticated: boolean;
  setUser: any;
};

export const AuthContext = createContext<Partial<ContextProps>>({});

export const useAuth: () => Partial<ContextProps> = () =>
  useContext(AuthContext);

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState(null as firebase.User | null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user: any) => {
      setUser(user);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated: user !== null,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

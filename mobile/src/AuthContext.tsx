// TerraVista — auth state provider. Gates the app between Login and the Drawer,
// and keeps the in-memory token cache (lib/auth) in sync with AsyncStorage.
// Author: Gabriel Mule (RM 560586)

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  getUser,
  isAuthenticated,
  loadSession,
  saveSession,
} from "./lib/auth";

interface AuthState {
  ready: boolean; // initial AsyncStorage load finished
  signedIn: boolean;
  user: string | null;
  signIn: (token: string, user: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await loadSession();
      if (isAuthenticated()) {
        setSignedIn(true);
        setUser(await getUser());
      }
      setReady(true);
    })();
  }, []);

  async function signIn(token: string, name: string) {
    await saveSession(token, name);
    setUser(name);
    setSignedIn(true);
  }

  async function signOut() {
    await clearSession();
    setUser(null);
    setSignedIn(false);
  }

  return (
    <AuthContext.Provider value={{ ready, signedIn, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

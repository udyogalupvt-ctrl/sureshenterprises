import { createContext, use, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  // `undefined` while Firebase restores the session, then a User or `null`.
  const [user, setUser] = useState(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return <AuthContext value={user}>{children}</AuthContext>;
}

export const useUser = () => use(AuthContext);

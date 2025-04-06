// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { auth, firestore } from "../firebase";
import { User, onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface UserData {
  email: string;
  isAdmin: boolean;
  displayName?: string;
  createdAt?: Date;
  lastLogin?: Date;
  profileComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  error: Error | null;
  refreshToken: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  error: null,
  refreshToken: async () => {},
  refreshUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(firestore, "users", userId));
      return userDoc.exists() ? (userDoc.data() as UserData) : null;
    } catch (err) {
      console.error("Error fetching user data:", err);
      return null;
    }
  };

  const checkAdminStatus = async (user: User): Promise<boolean> => {
    try {
      const idTokenResult = await getIdTokenResult(user, true);
      const claimsAdmin = !!idTokenResult.claims.admin;
      
      // Also check Firestore in case claims haven't propagated
      const data = await fetchUserData(user.uid);
      const firestoreAdmin = data?.isAdmin || false;
      
      return claimsAdmin || firestoreAdmin;
    } catch (err) {
      console.error("Error checking admin status:", err);
      return false;
    }
  };

  const refreshToken = async () => {
    if (!user) return;
    try {
      await user.getIdToken(true);
      const adminStatus = await checkAdminStatus(user);
      setIsAdmin(adminStatus);
    } catch (err) {
      setError(err as Error);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const data = await fetchUserData(user.uid);
      setUserData(data);
      
      // Update admin status based on fresh data
      if (data?.isAdmin !== undefined) {
        setIsAdmin(data.isAdmin);
      }
    } catch (err) {
      setError(err as Error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          setLoading(true);
          setError(null);

          if (currentUser) {
            const adminStatus = await checkAdminStatus(currentUser);
            const userData = await fetchUserData(currentUser.uid);
            
            setUser(currentUser);
            setUserData(userData);
            setIsAdmin(adminStatus);
          } else {
            setUser(null);
            setUserData(null);
            setIsAdmin(false);
          }
        } catch (err) {
          setError(err as Error);
          setUser(null);
          setUserData(null);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      },
      (authError) => {
        setError(authError);
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      userData,
      loading,
      isAdmin,
      error,
      refreshToken,
      refreshUserData,
      checkAdminStatus
    }),
    [user, userData, loading, isAdmin, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
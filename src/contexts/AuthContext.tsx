import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { auth } from "../firebase";
import { User, onAuthStateChanged, getIdTokenResult } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  email: string | null;
  loading: boolean;
  isAdmin: boolean;
  error: Error | null;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  email: null,
  loading: true,
  isAdmin: false,
  error: null,
  refreshToken: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAdminStatus = async (user: User): Promise<boolean> => {
    try {
      const idTokenResult = await user.getIdTokenResult(true);
      return !!idTokenResult.claims.admin;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          setLoading(true);
          setError(null);

          if (currentUser) {
            const adminStatus = await checkAdminStatus(currentUser);
            setUser(currentUser);
            setEmail(currentUser.email); // Set the email from Firebase user
            setIsAdmin(adminStatus);
          } else {
            setUser(null);
            setEmail(null);
            setIsAdmin(false);
          }
        } catch (err) {
          setError(err as Error);
          setUser(null);
          setEmail(null);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      },
      (authError) => {
        setError(authError);
        setUser(null);
        setEmail(null);
        setIsAdmin(false);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      email, // Include email in the context value
      loading,
      isAdmin,
      error,
      refreshToken,
    }),
    [user, email, loading, isAdmin, error] // Add email to dependencies
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
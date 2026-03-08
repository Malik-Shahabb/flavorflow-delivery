import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type ActiveRole = "customer" | "owner" | "delivery" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isReady: boolean;
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isReady: false,
  activeRole: null,
  setActiveRole: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeRole, setActiveRoleState] = useState<ActiveRole>(() => {
    const stored = localStorage.getItem("feastfleet-active-role") as ActiveRole;
    return stored || null;
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Clear role on sign out
        if (!session) {
          setActiveRoleState(null);
          localStorage.removeItem("feastfleet-active-role");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setActiveRole = (role: ActiveRole) => {
    setActiveRoleState(role);
    if (role) {
      localStorage.setItem("feastfleet-active-role", role);
    } else {
      localStorage.removeItem("feastfleet-active-role");
    }
  };

  const signOut = async () => {
    setActiveRoleState(null);
    localStorage.removeItem("feastfleet-active-role");
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isReady, activeRole, setActiveRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { supabase }
  from "../lib/supabase";

const AuthContext =
  createContext();

export function AuthProvider({
  children
}) {

  const [user, setUser] =
  useState(null);

  const [loading, setLoading] =
  useState(true);

  useEffect(() => {

    async function getUser() {

      const {
        data: { user },
      } =

      await supabase.auth.getUser();

      setUser(user);
      setLoading(false);

    }

    getUser();

    const {
      data: listener,
    } =

    supabase.auth.onAuthStateChange(
      (_event, session) => {

        setUser(
          session?.user ?? null
        );

      }
    );

    return () => {

      listener.subscription.unsubscribe();

    };

  }, []);

  return (

    <AuthContext.Provider
      value={{ user, loading }}
    >

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {
  return useContext(AuthContext);
}

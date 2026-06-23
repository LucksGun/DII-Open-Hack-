import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[useAuth] Starting auth check...");
    let mounted = true;

    // Bulletproof timeout: We don't check 'loading' state, we just force it false.
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn("[useAuth] 3-second absolute timeout hit! Forcing load to false.");
        setLoading(false);
      }
    }, 3000);

    try {
      // 1. Setup the listener
      const { data: sub } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        console.log(`[useAuth] Auth state changed: ${_event}`);
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      });

      // 2. Fetch initial session
      supabase.auth.getSession()
        .then(({ data }) => {
          console.log("[useAuth] getSession resolved successfully.");
          if (mounted) {
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("[useAuth] Supabase Promise Rejected:", error);
          if (mounted) {
            setLoading(false);
          }
        });

      return () => {
        mounted = false;
        clearTimeout(timeout);
        sub?.subscription?.unsubscribe();
      };
      
    } catch (criticalError) {
      // 3. Catch synchronous crashes from the proxy/client initialization
      console.error("[useAuth] CRITICAL SYNCHRONOUS ERROR:", criticalError);
      if (mounted) {
        setLoading(false);
      }
    }
  }, []);

  return { session, user, loading };
}
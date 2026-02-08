import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserRole, AppRole, BusinessMembership, Business } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  businessMemberships: (BusinessMembership & { business: Business })[];
  loading: boolean;
  isPrincipal: boolean;
  isEA: boolean;
  isGM: boolean;
  isManager: boolean;
  isSales: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [businessMemberships, setBusinessMemberships] = useState<(BusinessMembership & { business: Business })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      if (rolesData) {
        setRoles(rolesData.map(r => r.role as AppRole));
      }

      // Fetch business memberships
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('business_memberships')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('user_id', userId);

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
      }

      if (membershipsData) {
        setBusinessMemberships(membershipsData as unknown as (BusinessMembership & { business: Business })[]);
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer data fetching to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setBusinessMemberships([]);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: email,
          full_name: fullName,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
    setBusinessMemberships([]);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    roles,
    businessMemberships,
    loading,
    isPrincipal: roles.includes('principal'),
    isEA: roles.includes('ea'),
    isGM: roles.includes('gm'),
    isManager: roles.includes('manager'),
    isSales: roles.includes('sales'),
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

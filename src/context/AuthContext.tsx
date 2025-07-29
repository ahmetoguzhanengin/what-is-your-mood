import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User, Session } from '@supabase/supabase-js';

// Auth State Types
type AuthState = {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Actions
type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_PROFILE'; payload: any | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SIGN_OUT' };

// Initial State
const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SIGN_OUT':
      return {
        ...initialState,
        isLoading: false
      };
    default:
      return state;
  }
}

// Context
type AuthContextType = {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  // Helper functions
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Provider Component
type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API Base URL
  const API_BASE = 'http://172.20.10.5:3000/api';

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (mounted) {
          if (session) {
            dispatch({ type: 'SET_SESSION', payload: session });
            dispatch({ type: 'SET_USER', payload: session.user });
            await fetchUserProfile(session.user.id);
          }
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          dispatch({ type: 'SET_SESSION', payload: session });
          dispatch({ type: 'SET_USER', payload: session?.user ?? null });
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            dispatch({ type: 'SET_PROFILE', payload: null });
          }
          
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from backend
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for userId:', userId);
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_stats (*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Supabase error fetching profile:', error);
        return;
      }

      console.log('User profile fetched successfully:', data);
      dispatch({ type: 'SET_PROFILE', payload: data });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Sign Up
  const signUp = async (email: string, password: string, username: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('Starting signup request...', { email, username });

      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      console.log('Signup response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Signup response data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // User will receive an email confirmation
      // Session will be set when they confirm their email
    } catch (error: any) {
      console.error('Signup error in AuthContext:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Sign In
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('Starting signin request...');

      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Signin response status:', response.status);
      const data = await response.json();
      console.log('Signin response data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to sign in');
      }

      // Session and user will be set by the auth state change listener
      dispatch({ type: 'SET_SESSION', payload: data.session });
      dispatch({ type: 'SET_USER', payload: data.user });
      
      // Profile should be set too if available
      if (data.profile) {
        console.log('Setting profile from signin response:', data.profile);
        dispatch({ type: 'SET_PROFILE', payload: data.profile });
      } else {
        console.log('No profile in signin response, creating temporary profile');
        
        // Create a temporary profile from user data
        const tempProfile = {
          id: data.user.id,
          username: data.user.email?.split('@')[0] || 'player',
          display_name: data.user.email?.split('@')[0] || 'player',
          email: data.user.email,
          user_stats: [{
            games_played: 0,
            games_won: 0,
            total_votes_received: 0,
            total_votes_given: 0
          }]
        };
        console.log('Created temporary profile:', tempProfile);
        dispatch({ type: 'SET_PROFILE', payload: tempProfile });
      }
    } catch (error: any) {
      console.error('Signin error in AuthContext:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }

      dispatch({ type: 'SIGN_OUT' });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh Profile
  const refreshProfile = async (): Promise<void> => {
    if (state.user) {
      await fetchUserProfile(state.user.id);
    }
  };

  const value: AuthContextType = {
    state,
    dispatch,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
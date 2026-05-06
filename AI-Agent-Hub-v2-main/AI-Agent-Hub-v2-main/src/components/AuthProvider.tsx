import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer, getDocs, collection, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Listen to user profile
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, async (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            // Auto-promote admin emails
            const isAdminEmail = user.email === 'chatshero8@gmail.com' || user.email === 'irishng01@gmail.com';
            
            if (isAdminEmail && (!data.isAdmin || data.role !== 'admin' as any)) {
              try {
                await setDoc(userDocRef, { 
                  role: 'admin' as any,
                  isAdmin: true 
                }, { merge: true });
                data.role = 'admin' as any;
                data.isAdmin = true;
              } catch (e) {
                console.error("Failed to auto-promote admin", e);
              }
            }
            setProfile(data);
            setLoading(false);
          } else {
            // New user registration
            const isAdminUser = user.email === 'chatshero8@gmail.com' || user.email === 'irishng01@gmail.com';
            
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || 'Hero',
              email: user.email || '',
              avatar: user.photoURL || '',
              role: isAdminUser ? 'admin' as any : 'pending' as any,
              isAdmin: isAdminUser,
            };

            try {
              await setDoc(userDocRef, {
                ...newProfile,
                createdAt: serverTimestamp(),
              });
              // Profile state will be updated by the next snapshot
            } catch (e) {
              console.error("Failed to create user profile", e);
              // Fallback to local profile while write is pending
              setProfile(newProfile);
              setLoading(false);
            }
          }
        }, (error) => {
          console.error("Profile snapshot error:", error);
          // Don't crash the app, but stop loading if we get an error (e.g. permission denied)
          setLoading(false);
        });
        
        return () => {
          unsubscribeProfile();
        };
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

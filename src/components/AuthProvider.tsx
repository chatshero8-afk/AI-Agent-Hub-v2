import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer, getDocs, collection, onSnapshot, query, where, updateDoc } from 'firebase/firestore';
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
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Cleanup previous profile subscription if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Listen to user profile
        unsubscribeProfile = onSnapshot(userDocRef, async (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            
            // Auto-promote admin emails
            const isAdminEmail = user.email === 'chatshero8@gmail.com' || user.email === 'irishng01@gmail.com';
            
            // Also check whitelist for auto-approval
            let isWhitelisted = false;
            try {
              const whitelistSnap = await getDocs(query(collection(db, 'allowedEmails'), where('email', '==', user.email?.toLowerCase())));
              isWhitelisted = !whitelistSnap.empty;
            } catch (e) {
              console.error("Whitelist check failed", e);
            }

            const shouldApprove = isAdminEmail || isWhitelisted;
            
            if (shouldApprove && data.role === 'pending') {
              try {
                await updateDoc(userDocRef, { 
                  role: isAdminEmail ? 'admin' : 'Junior IT',
                  isAdmin: isAdminEmail 
                });
                data.role = isAdminEmail ? 'admin' as any : 'Junior IT' as any;
                if (isAdminEmail) data.isAdmin = true;
              } catch (e) {
                console.error("Failed to auto-approve whitelisted user", e);
              }
            }
            
            setProfile(data);
            setLoading(false);
          } else {
            // New user registration
            const isAdminUser = user.email === 'chatshero8@gmail.com' || user.email === 'irishng01@gmail.com';
            
            // Check whitelist for new users too
            let isWhitelisted = false;
            try {
              const whitelistSnap = await getDocs(query(collection(db, 'allowedEmails'), where('email', '==', user.email?.toLowerCase())));
              isWhitelisted = !whitelistSnap.empty;
            } catch (e) {
              console.error("Whitelist check failed", e);
            }

            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || 'Hero',
              email: user.email || '',
              avatar: user.photoURL || '',
              role: (isAdminUser || isWhitelisted) ? (isAdminUser ? 'admin' : 'Junior IT') as any : 'pending' as any,
              isAdmin: isAdminUser,
            };

            try {
              await setDoc(userDocRef, {
                ...newProfile,
                createdAt: serverTimestamp(),
              });
            } catch (e) {
              console.error("Failed to create user profile", e);
              setProfile(newProfile);
              setLoading(false);
            }
          }
        }, (error) => {
          console.error("Profile snapshot error:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
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

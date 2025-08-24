import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithCustomToken, signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore'; // Import setDoc and doc
import NotionPage from './NotionPage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnLpu-HAgIoGJi61UCuREhF4f3yG_nKSQ",
  authDomain: "doctor-portal-b8c30.firebaseapp.com",
  projectId: "doctor-portal-b8c30",
  storageBucket: "doctor-portal-b8c30.firebasestorage.app",
  messagingSenderId: "415109624546",
  appId: "1:415109624546:web:11e28f2e2a5fee968424bb",
  measurementId: "G-3BJ27QL4EY"
};

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = firebaseConfig.projectId;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const App = () => {
  const [name, setName] = useState(''); // State for the user's full name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [view, setView] = useState('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser && initialAuthToken) {
        try {
          await signInWithCustomToken(auth, initialAuthToken);
        } catch (e) {
          console.error("Firebase Auth Error with custom token:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- NEW: Function to save user data to Firestore ---
  const createUserProfile = async (user, provider) => {
    const userRef = doc(db, `/artifacts/${appId}/public/data/users/${user.uid}`);
    const userData = {
      uid: user.uid,
      name: provider === 'Google' ? user.displayName : name,
      email: user.email,
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(userRef, userData, { merge: true }); // Use merge: true to avoid overwriting
      console.log("User profile created/updated successfully.");
    } catch (e) {
      console.error("Error creating user profile:", e);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // --- NEW: Create a user profile document after sign-up ---
      if (userCredential.user) {
        await createUserProfile(userCredential.user, 'email');
      }
      setMessage('Sign-up successful! You can now log in.');
      setName('');
      setEmail('');
      setPassword('');
      setView('login');
    } catch (e) {
      setError('Sign-up failed: ' + e.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await logUserLogin(userCredential.user.uid, 'email');
      }
    } catch (e) {
      setError('Login failed: ' + e.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      if (userCredential.user) {
        await logUserLogin(userCredential.user.uid, 'Google');
        // --- NEW: Create a user profile if they sign in with Google for the first time ---
        await createUserProfile(userCredential.user, 'Google');
      }
    } catch (e) {
      setError('Google login failed: ' + e.message);
    }
  };

  const logUserLogin = async (userId, provider) => {
    try {
      const loginCollectionPath = `/artifacts/${appId}/public/data/user_logins`;
      await addDoc(collection(db, loginCollectionPath), {
        userId: userId,
        timestamp: serverTimestamp(),
        provider: provider
      });
    } catch (e) {
      console.error("Error writing login event to Firestore:", e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      setError('Sign-out failed: ' + e.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
      setEmail('');
      setView('login');
    } catch (e) {
      setError('Password reset failed: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <NotionPage onSignOut={handleSignOut} />;
  }

  const renderForms = () => {
    switch (view) {
      case 'signup':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center text-jivo-blue-dark">Sign Up</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jivo-blue transition"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jivo-blue transition"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jivo-blue transition"
                required
              />
              <button
                type="submit"
                className="w-full bg-jivo-blue hover:bg-jivo-blue-dark text-white font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign Up
              </button>
            </form>
            <p className="text-center mt-4">
              Already have an account?{' '}
              <button onClick={() => setView('login')} className="text-jivo-blue hover:underline">
                Log In
              </button>
            </p>
          </div>
        );
      case 'forgotPassword':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center text-jivo-blue-dark">Forgot Password</h2>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jivo-blue transition"
                required
              />
              <button
                type="submit"
                className="w-full bg-jivo-yellow hover:opacity-90 text-jivo-blue-dark font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Send Reset Email
              </button>
            </form>
            <p className="text-center mt-4">
              <button onClick={() => setView('login')} className="text-jivo-blue hover:underline">
                Back to Login
              </button>
            </p>
          </div>
        );
      case 'login':
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center text-jivo-blue-dark">Log In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jivo-blue transition"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jivo-blue transition"
                required
              />
              <button
                type="submit"
                className="w-full bg-jivo-blue hover:bg-jivo-blue-dark text-white font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Log In
              </button>
            </form>
            <p className="text-center mt-4">
              <button onClick={() => setView('forgotPassword')} className="text-jivo-blue hover:underline">
                Forgot Password?
              </button>
            </p>
            <div className="my-6 text-center text-gray-500">
              <p>— OR —</p>
            </div>
            <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
              >
                <img src="https://i.ibb.co/1YbkcNMH/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png" alt="Google Logo" className="w-5 h-5 mr-2" />
                Sign in with Google
              </button>
            <p className="text-center mt-4">
              Don't have an account?{' '}
              <button onClick={() => setView('signup')} className="text-jivo-blue hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter text-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-jivo-blue mb-2">Jivo Doctor Partner Hub</h1>
        <p className="text-lg text-gray-600">
          Please sign in to continue
        </p>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
            <p>{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md" role="alert">
            <p>{message}</p>
          </div>
        )}
        {renderForms()}
      </div>
    </div>
  );
};

export default App;

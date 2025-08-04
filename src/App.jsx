import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithCustomToken, signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// IMPORTANT: This is your specific Firebase configuration.
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

// Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// The Notion page URL to redirect to.
const NOTION_PAGE_URL = 'https://www.notion.so/Your-Notion-Page-ID';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [view, setView] = useState('login');

  useEffect(() => {
    console.log("App component loaded. Listening for auth state changes.");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed. Current user:", currentUser);
      setUser(currentUser);
      setLoading(false);
      if (!currentUser && initialAuthToken) {
        try {
          console.log("Attempting sign-in with custom token.");
          await signInWithCustomToken(auth, initialAuthToken);
        } catch (e) {
          console.error("Firebase Auth Error with custom token:", e);
        }
      }
    });
    return () => {
      console.log("Cleaning up auth state listener.");
      unsubscribe();
    };
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    console.log("Sign up button clicked.");
    setError('');
    setMessage('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('Sign-up successful! You can now log in.');
      setEmail('');
      setPassword('');
      setView('login');
    } catch (e) {
      console.error('Sign-up failed:', e);
      setError('Sign-up failed: ' + e.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Log in button clicked.");
    setError('');
    setMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await logUserLogin(userCredential.user.uid);
      }
      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = NOTION_PAGE_URL;
      }, 1000);
    } catch (e) {
      console.error('Login failed:', e);
      setError('Login failed: ' + e.message);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("Google login button clicked.");
    setError('');
    setMessage('');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      if (userCredential.user) {
        await logUserLogin(userCredential.user.uid);
      }
      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = NOTION_PAGE_URL;
      }, 1000);
    } catch (e) {
      console.error('Google login failed:', e);
      setError('Google login failed: ' + e.message);
    }
  };

  const logUserLogin = async (userId) => {
    try {
      const loginCollectionPath = `/artifacts/${appId}/public/data/user_logins`;
      await addDoc(collection(db, loginCollectionPath), {
        userId: userId,
        timestamp: serverTimestamp(),
        provider: 'Google' // Add provider for tracking
      });
      console.log("Login event successfully logged to Firestore.");
    } catch (e) {
      console.error("Error writing login event to Firestore:", e);
    }
  };

  const handleSignOut = async () => {
    console.log("Sign out button clicked.");
    try {
      await signOut(auth);
      setMessage('Signed out successfully.');
      setView('login');
    } catch (e) {
      console.error('Sign-out failed:', e);
      setError('Sign-out failed: ' + e.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    console.log("Forgot password link clicked. Sending reset email.");
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
      setEmail('');
      setView('login');
    } catch (e) {
      console.error('Password reset failed:', e);
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

  const renderView = () => {
    if (user) {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">You are logged in!</h2>
          <p className="text-gray-700 mb-6">
            You will be redirected to the Notion page automatically upon successful login.
          </p>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Sign Out
          </button>
        </div>
      );
    }

    switch (view) {
      case 'signup':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="signup-email">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="signup-password">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign Up
              </button>
            </form>
            <p className="text-center mt-4">
              Already have an account?{' '}
              <button onClick={() => setView('login')} className="text-blue-500 hover:underline">
                Log In
              </button>
            </p>
          </div>
        );
      case 'forgotPassword':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="forgot-email">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Send Reset Email
              </button>
            </form>
            <p className="text-center mt-4">
              Remembered your password?{' '}
              <button onClick={() => setView('login')} className="text-blue-500 hover:underline">
                Back to Login
              </button>
            </p>
          </div>
        );
      case 'login':
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Log In
              </button>
            </form>
            <p className="text-center mt-4">
              <button onClick={() => setView('forgotPassword')} className="text-blue-500 hover:underline">
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
              <button onClick={() => setView('signup')} className="text-green-500 hover:underline">
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
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Welcome!</h1>
        <p className="text-lg text-gray-600">
          Sign up or log in to access the exclusive content.
        </p>
      </div>

      {user && (
        <div className="bg-gray-200 p-3 rounded-lg mb-4 text-sm text-gray-700">
          <p className="font-semibold">Your User ID (for tracking):</p>
          <p className="break-all">{user.uid}</p>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md" role="alert">
            <p className="font-bold">Success</p>
            <p>{message}</p>
          </div>
        )}
        {renderView()}
      </div>
    </div>
  );
};

export default App;

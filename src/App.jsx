import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithCustomToken, signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import NotionPage from './NotionPage'; // Import the NotionPage component

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

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [view, setView] = useState('login');

  useEffect(() => {
    // This listener handles auth state changes
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
    return () => unsubscribe(); // Cleanup the listener
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('Sign-up successful! You can now log in.');
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
        await logUserLogin(userCredential.user.uid);
      }
      // No redirection needed. The onAuthStateChanged listener will handle the UI update.
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
        await logUserLogin(userCredential.user.uid);
      }
       // No redirection needed. The onAuthStateChanged listener will handle the UI update.
    } catch (e) {
      setError('Google login failed: ' + e.message);
    }
  };

  const logUserLogin = async (userId) => {
    try {
      const loginCollectionPath = `/artifacts/${appId}/public/data/user_logins`;
      await addDoc(collection(db, loginCollectionPath), {
        userId: userId,
        timestamp: serverTimestamp(),
        provider: 'Google' // This should be dynamic based on login method
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

  // If a user is logged in, render the NotionPage component
  if (user) {
    return <NotionPage onSignOut={handleSignOut} />;
  }

  // --- Login / Signup Forms ---
  const renderForms = () => {
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

  // Render the authentication forms if no user is logged in
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter text-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Welcome!</h1>
        <p className="text-lg text-gray-600">
          Sign up or log in to access the exclusive content.
        </p>
      </div>
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
        {renderForms()}
      </div>
    </div>
  );
};

export default App;

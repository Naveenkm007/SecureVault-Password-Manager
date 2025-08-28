import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Simple AuthContext defined directly in App.tsx
interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password) {
        setUser({ id: '1', email });
        console.log('Welcome back!');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      console.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password) {
        setUser({ id: '1', email });
        console.log('Account created successfully!');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      console.error(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
      console.log('Signed out successfully');
    } catch (error: any) {
      console.error(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h1>SecureVault React App</h1>
                  <p>🎉 App is working! Authentication system added.</p>
                  <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px', borderRadius: '8px' }}>
                    <h2>✅ Working Features:</h2>
                    <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                      <li>✅ React App Running</li>
                      <li>✅ React Router Working</li>
                      <li>✅ Basic Routing</li>
                      <li>✅ Toast Notifications</li>
                      <li>✅ Query Client</li>
                      <li>✅ Authentication Context (Inline)</li>
                      <li>🔄 Ready to add login pages</li>
                    </ul>
                    <p><strong>🎯 Status:</strong> Authentication system is working!</p>
                    <div style={{ marginTop: '20px' }}>
                      <a href="/test" style={{ 
                        color: 'white', 
                        background: '#007bff', 
                        padding: '10px 20px', 
                        borderRadius: '5px', 
                        textDecoration: 'none',
                        marginRight: '10px'
                      }}>
                        Test Route
                      </a>
                      <a href="/dashboard" style={{ 
                        color: 'white', 
                        background: '#28a745', 
                        padding: '10px 20px', 
                        borderRadius: '5px', 
                        textDecoration: 'none'
                      }}>
                        Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              } />
              <Route path="/test" element={
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h2>Test Route</h2>
                  <p>Routing is working correctly!</p>
                  <a href="/" style={{ color: 'blue' }}>Go back home</a>
                </div>
              } />
              <Route path="/dashboard" element={
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h2>Dashboard</h2>
                  <p>Dashboard route is working! Ready to add full dashboard features.</p>
                  <a href="/" style={{ color: 'blue' }}>Go back home</a>
                </div>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

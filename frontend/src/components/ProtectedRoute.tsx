import { Navigate, Outlet } from "react-router-dom";
import { useContext, createContext, ReactNode, useState, useEffect } from "react";

// Authentication Context
interface AuthContextType {
  isAuthenticated: boolean;
  user?: any;
  login: (token: string, userData?: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token) {
      setIsAuthenticated(true);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      }
    }
    setLoading(false);
  }, []);
  
  const login = (token: string, userData?: any) => {
    localStorage.setItem('token', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ProtectedRoute component - for routes that require authentication
interface ProtectedRouteProps {
  redirectTo?: string;
  requiredRole?: string;
}

export const ProtectedRoute = ({ 
  redirectTo = "/login",
  requiredRole
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Check role-based access (optional)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
};

// PublicRoute component - for routes that should redirect authenticated users
interface PublicRouteProps {
  redirectTo?: string;
}

export const PublicRoute = ({ 
  redirectTo = "/dashboard"
}: PublicRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If authenticated, redirect to dashboard or specified route
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // If not authenticated, render the public route
  return <Outlet />;
};

// Default export for backward compatibility
const ProtectedRouteComponent = ProtectedRoute;

export default ProtectedRoute;
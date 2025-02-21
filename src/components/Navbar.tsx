import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, ListTodo, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="w-8 h-8" />
            <span className="text-xl font-bold">Task AI</span>
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/generate"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <Brain className="w-5 h-5" />
                  <span>Generate Tasks</span>
                </Link>
                <Link
                  to="/tasks"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <ListTodo className="w-5 h-5" />
                  <span>My Tasks</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-destructive transition-colors flex items-center space-x-1"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState('User');
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.email) {
      const emailUsername = user.email.split('@')[0];
      setUsername(emailUsername);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {  // Check if we're on client-side
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.email) {
            const emailUsername = userData.email.split('@')[0];
            setUsername(emailUsername);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call the API to logout
      const response = await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear auth context and local storage
      logout();
      
      // Close the menu
      setIsMenuOpen(false);

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we should still clear local state
      logout();
      router.push('/login');
    }
  };

  // Don't render anything until after mounting
  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-slate-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold">
          Linkify
        </div>

        {/* Search Bar */}
        <div className="flex-grow flex justify-center">
          <input
            type="text"
            placeholder="Search"
            className="w-6/12 p-2 pl-5 rounded-full text-black"
          />
        </div>

        {/* Account Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2"
          >
            <img
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="User"
              className="w-8 h-8 rounded-full"
            />
            <span>{username}</span>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 text-white">
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push('/profile');
                }}
                className="block w-full text-left px-4 py-2 hover:bg-slate-600 transition-colors duration-200"
              >
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-slate-600 transition-colors duration-200 text-red-400"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
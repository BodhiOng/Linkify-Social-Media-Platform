import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Linkify from '../components/Linkify';

interface FormData {
  email: string;
  password: string;
}

interface LoginResponse {
  message?: string;
  accessToken?: string;
  userId?: string;
  user?: {
    email: string;
    username?: string;
  };
}

interface UsernameLookupResponse {
  username: string | null;
  userId: string | null;
  message?: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error.show) {
      const timer = setTimeout(() => {
        setError({ show: false, message: '' });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error.show]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const getUsernameFromEmail = async (email: string): Promise<{ username: string | null, userId: string | null }> => {
    try {
      const response = await fetch ('/api/users/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data: UsernameLookupResponse = await response.json();

      if(!response.ok) {
        console.error('Username lookup failed');
        return { username: null, userId: null };
      }

      return {
        username: data.username,
        userId: data.userId
      };
    } catch (error) {
      console.error('Username lookup error:', error);
      return { username: null, userId: null };
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError({ show: false, message: '' });

    if(!isValidEmail(formData.email)) {
      setError({
        show: true,
        message: 'Please enter a valid email address'
      });
      setIsLoading(false);
      return;
    }

    const submitData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim()
    };

    try {
      // Get username first
      const { username, userId } = await getUsernameFromEmail(submitData.email);

      // Proceed with login
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Ensure access token exists
      if (!data.accessToken) {
        throw new Error('No access token received');
      }

      // Create user object
      const user = { 
        _id: userId || data.userId,
        email: submitData.email,
        username: username || undefined
      };

      // Store user data and token in local storage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', data.accessToken);

      await login(user, data.accessToken);
      router.replace("/feed");
    } catch (error) {
      console.error("Login error:", error);
      setError({
        show: true,
        message: error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row w-full h-auto md:h-5/6 bg-transparent rounded-lg shadow-lg overflow-hidden desktop:max-w-7xl laptop:max-w-5xl tablet:shadow-none mobile:shadow-none">
        {/* Left side - Login Form */}
        <div className="flex items-center justify-center w-full bg-slate-800 p-6 sm:p-8 desktop:w-1/2 desktop:bg-slate-800 laptop:w-1/2 laptop:bg-slate-800 tablet:bg-slate-900 mobile:bg-slate-900">
          <div className="flex flex-col justify-center w-full">
            <Linkify />
            <h2 className="text-xl sm:text-2xl font-black text-center text-slate-100 mt-6 sm:mt-10 mb-4 sm:mb-8">Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-slate-100 font-medium font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  aria-label="Email address"
                  aria-required="true"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-slate-100 font-medium font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={isLoading}
                />
              </div>
              {error.show && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error.message}</span>
                </div>
              )}
              <button
                type="submit"
                className={`w-full bg-indigo-500 text-white text-lg py-3 sm:py-4 rounded-md hover:bg-indigo-600 transition duration-200 mt-5 
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                    Logging in...
                  </div>
                ) : 'Login'}
              </button>
            </form>

            <a href="/signup" className="mt-3 text-slate-100 underline underline-offset-1 hover:text-cyan-400 text-sm sm:text-base">
              Not a user yet? Register as one
            </a>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden laptop:block w-1/2 desktop:w-1/2 h-auto">
          <img
            src="/images/linkify-login.png"
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;

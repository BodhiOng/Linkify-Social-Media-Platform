import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Linkify from '../components/Linkify';

interface FormData {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  accessToken: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    // Debug: Check initial localStorage state
    console.log('Initial localStorage state:', {
      user: localStorage.getItem('user'),
      token: localStorage.getItem('token')
    });
  }, []);

  useEffect(() => {
    if (error.show) {
      const timer = setTimeout(() => {
        setError({ show: false, message: '' });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error.show]);


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

    const submitData = {
      email: formData.email.trim(),
      password: formData.password.trim()
    };

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        credentials: 'include'
      });

      const data: LoginResponse = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        try {
          // Create user object from email
          const user = {
            email: submitData.email,
            // Add any other user data you want to store
          };

          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', data.accessToken);

          // Verify storage
          console.log('Stored in localStorage:', {
            user: localStorage.getItem('user'),
            token: localStorage.getItem('token')
          });

          // Update auth context with the token
          login(user, data.accessToken);
          
          // Navigate to feed
          router.push("/feed");
        } catch (storageError) {
          console.error('Storage error:', storageError);
          throw new Error('Failed to store authentication data');
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError({ 
        show: true, 
        message: error instanceof Error ? error.message : "An unexpected error occurred" 
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
              <button
                type="submit"
                className={`w-full bg-indigo-500 text-white text-lg py-3 sm:py-4 rounded-md hover:bg-indigo-600 transition duration-200 mt-5 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            {error.show && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error.message}</span>
              </div>
            )}
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

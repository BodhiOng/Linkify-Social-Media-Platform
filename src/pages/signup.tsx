import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Linkify from '../components/Linkify';

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface FieldError {
  username: string;
  email: string;
}

const SignUp: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ username: '', email: '', password: '' });
  const [error, setError] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({ username: '', email: '' });

  useEffect(() => {
    if(error.show) {
      const timer = setTimeout(() => {
        setError({ show: false,  message: '' })
      }, 5000)

      return () => clearTimeout(timer);
    }
  }, [error.show]);

  const checkExistence = async (field: 'username' | 'email', value: string) => {
    try {
      const response = await fetch(`/api/check-existence?${field}=${value}`);
      const data = await response.json();

      if (data.exists) {
        setFieldErrors(prev => ({ ...prev, [field]: `This ${field} is already taken`}));
      } else {
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch (error) {
      console.error(`Error checking ${field} existence: `, error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'username' || name === 'email') {
      checkExistence(name, value);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError({ show: false, message: '' });

    if (fieldErrors.username || fieldErrors.email) {
      setError({ show: true, message: "Please correct the errors before submitting" });
      return;
    }
 
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Sign up successful: ", data);
        router.push("/feed");
      } else {
        console.error("Sign up error: ", response.status, data);
        setError({ show: true, message: data.message || "An error occurred during sign up" });
      }
    } catch (error) {
      console.error("Error occurred during sign up: ", error);
      setError({ show: true, message: "An error occurred. Please try again." });
    }    
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="flex flex-col md:flex-row w-full h-auto md:h-5/6 bg-transparent rounded-lg shadow-lg overflow-hidden desktop:max-w-7xl laptop:max-w-5xl tablet:shadow-none mobile:shadow-none">
        {/* Left side - Image */}
        <div className="hidden laptop:block w-1/2 desktop:w-1/2 h-auto">
          <img
            src="/images/linkify-signup.png"
            alt="Sign up illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Sign up form */}
        <div className="flex items-center justify-center w-full bg-slate-800 p-6 sm:p-8 desktop:w-1/2 desktop:bg-slate-800 laptop:w-1/2 laptop:bg-slate-800 tablet:bg-slate-900 mobile:bg-slate-900">
          <div className="flex flex-col justify-center w-full">
            <Linkify />
            <h2 className="text-xl sm:text-2xl font-black text-center text-slate-100 mt-6 sm:mt-10 mb-4 sm:mb-8">Sign up</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-slate-100 font-medium font-bold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                  required
                />
                {fieldErrors.username && <p className="text-red-500 text-sm">{fieldErrors.username}</p>}
              </div>
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
                />
                {fieldErrors.email && <p className="text-red-500 text-sm">{fieldErrors.email}</p>}
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
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 text-white text-lg py-3 sm:py-4 rounded-md hover:bg-indigo-600 transition duration-200 mt-5"
              >
                Sign up
              </button>
            </form>
            {error.show && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error.message}</span>
              </div>
            )}
            <a href="/login" className="mt-3 text-slate-100 underline underline-offset-1 hover:text-cyan-400 text-sm sm:text-base">
              Already have an account? Login to it
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
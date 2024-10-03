import React, { useState, ChangeEvent, FormEvent } from 'react';
import Linkify from '../components/Linkify';

interface FormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="flex w-full max-w-4xl h-5/6 bg-transparent rounded-lg shadow-lg overflow-hidden">
        {/* Left side - Login Form */}
        <div className="flex items-center justify-center w-1/2 bg-slate-800 p-8">
          <div className="flex flex-col justify-center w-full">
            <Linkify />
            <h2 className="text-2xl font-black text-center text-slate-100 mt-10 mb-8">Login</h2>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                  required
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 text-white text-lg py-4 rounded-md hover:bg-indigo-600 transition duration-200 mt-5"
              >
                Login
              </button>
            </form>
            <a href='/signup' className='mt-3 text-slate-100 underline underline-offset-1 hover:text-cyan-400'>
              Not a user yet? Register as one
            </a>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="w-1/2">
          <img
            src="/images/linkify-login-signup.png"
            alt="Login/Sign up illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
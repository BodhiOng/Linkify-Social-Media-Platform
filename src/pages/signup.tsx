import React, { useState, ChangeEvent, FormEvent } from 'react';
import Linkify from '../components/Linkify';

interface FormData {
  username: string;
  password: string;
}

const SignUp: React.FC = () => {
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
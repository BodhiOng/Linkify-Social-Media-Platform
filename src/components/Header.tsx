import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <span>John Doe</span>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
              <a href="#" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-100">Logout</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
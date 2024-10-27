# Social Media Platform (MERN & Next.js)
The Social Media Platform is a full-featured web application developed using the MERN (MongoDB, Express.js, React, Node.js) stack alongside Next.js. This platform is designed to facilitate social interaction among users, enabling them to create, share, and engage with content in a dynamic online environment.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Installation](#installation)
- [Running the Application](#running-the-application)

## Technologies Used

- **Frontend**: React, Next.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **State Management**: Redux
- **Styling**: Tailwind CSS

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete posts
- Comment on posts
- Like posts
- Follow/unfollow users
- Notifications for new interactions

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/BodhiOng/Social-Media-Platform-MERN-NextJS.git
   cd Social-Media-Platform-MERN-NextJS
   ```

2. **Install dependencies**

     ```bash
     npm install
     ```

3. **Environment Variables**: Create a `.env` file in the `server` directory and add your environment variables. Example:

   ```bash
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

## Running the Application

1. **Start the backend server**:

   ```bash
   npm start
   ```

2. **Access the application**:

   Open your browser and go to `http://localhost:3000`.
